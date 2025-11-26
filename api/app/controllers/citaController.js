'use strict';

const db = require('../config/db');
const Citas = db.citas;
const { Op } = db.Sequelize;

// Función auxiliar para obtener solo la hora (sin minutos) de un tiempo
const getHourFromTime = (timeString) => {
  if (!timeString) return null;
  const [hours] = timeString.split(':');
  return parseInt(hours, 10);
};

// Función para validar capacidad por hora según tipo de terapia
const validateCapacity = async (fecha, horaInicio, tipoTerapia, idTerapeuta, idCitaExcluir = null) => {
  const hora = getHourFromTime(horaInicio);
  if (hora === null) {
    throw new Error('Hora de inicio inválida');
  }

  // Capacidad máxima según tipo de terapia
  const capacidadMaxima = tipoTerapia === 'Fisica' ? 3 : tipoTerapia === 'Neurologica' ? 2 : 0;
  
  if (capacidadMaxima === 0) {
    throw new Error('Tipo de terapia inválido');
  }

  // Construir rango de hora (ej: 09:00:00 a 09:59:59)
  const horaInicioRango = `${hora.toString().padStart(2, '0')}:00:00`;
  const horaFinRango = `${hora.toString().padStart(2, '0')}:59:59`;

  // Buscar citas en el mismo rango de hora, misma fecha, mismo terapeuta y mismo tipo de terapia
  // Excluir citas canceladas y la cita que se está editando (si existe)
  const whereClause = {
    fecha,
    id_terapeuta: idTerapeuta,
    tipo_terapia: tipoTerapia,
    estado: {
      [Op.ne]: 'Cancelada' // No contar citas canceladas
    },
    hora_inicio: {
      [Op.gte]: horaInicioRango,
      [Op.lte]: horaFinRango
    }
  };

  if (idCitaExcluir) {
    whereClause.id_cita = {
      [Op.ne]: idCitaExcluir
    };
  }

  const citasExistentes = await Citas.count({
    where: whereClause
  });

  if (citasExistentes >= capacidadMaxima) {
    throw new Error(
      `Capacidad máxima alcanzada para ${tipoTerapia === 'Fisica' ? 'Terapia Física' : 'Terapia Neurológica'} ` +
      `en la hora ${hora}:00. Máximo permitido: ${capacidadMaxima} paciente(s) por hora. ` +
      `Actualmente hay ${citasExistentes} cita(s) en esta hora.`
    );
  }

  return true;
};

const getCitas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchPaciente = req.query.searchPaciente || '';
    const searchTherapist = req.query.searchTherapist || '';
    const searchDate = req.query.searchDate || '';
    const offset = (page - 1) * limit;

    const where = {};
    if (searchDate) {
      where.fecha = searchDate;
    }
    if (req.query.id_terapeuta) {
      where.id_terapeuta = req.query.id_terapeuta;
    }
    if (req.query.id_paciente) {
      where.id_paciente = parseInt(req.query.id_paciente);
    }
    // Mostrar todas las citas por defecto (incluyendo canceladas)
    // Las citas canceladas se excluyen automáticamente en el cálculo de capacidad

    const pacienteWhere = {};
    const terapeutaWhere = {};
    
    if (searchPaciente) {
      const searchLower = searchPaciente.toLowerCase();
      pacienteWhere[Op.or] = [
        { nombre: { [Op.like]: `%${searchLower}%` } },
        { apellido: { [Op.like]: `%${searchLower}%` } }
      ];
    }

    if (searchTherapist) {
      const searchLower = searchTherapist.toLowerCase();
      terapeutaWhere[Op.or] = [
        { nombre: { [Op.like]: `%${searchLower}%` } },
        { apellido: { [Op.like]: `%${searchLower}%` } }
      ];
    }

    const includeOptions = [
      {
        model: db.paciente,
        attributes: ['nombre', 'apellido'],
        ...(Object.keys(pacienteWhere).length > 0 && { where: pacienteWhere })
      },
      {
        model: db.terapeuta,
        attributes: ['id_terapeuta', 'nombre', 'apellido'],
        ...(Object.keys(terapeutaWhere).length > 0 && { where: terapeutaWhere })
      }
    ];

    // Agregar servicios y recibos solo si los modelos existen
    try {
      if (db.servicios) {
        includeOptions.push({
          model: db.servicios,
          as: 'servicios',
          attributes: ['id_servicio', 'nombre', 'costo'],
          through: { attributes: [] },
          required: false
        });
      }
    } catch (e) {
      // Si no existe el modelo, continuar sin él
      console.warn('Error al incluir servicios:', e.message);
    }

    try {
      if (db.recibos) {
        includeOptions.push({
          model: db.recibos,
          as: 'Recibo',
          attributes: ['id_recibo', 'numero_recibo', 'fecha_cobro', 'estado', 'total'],
          required: false
        });
      }
    } catch (e) {
      // Si no existe el modelo, continuar sin él
      console.warn('Error al incluir recibos:', e.message);
    }

    let count, rows;
    try {
      const result = await Citas.findAndCountAll({
        where,
        include: includeOptions,
        limit,
        offset,
        distinct: true
      });
      count = result.count;
      rows = result.rows;
    } catch (includeError) {
      // Si hay error con los includes (tablas no creadas), intentar sin servicios y recibos
      console.warn('Error con includes, intentando sin servicios/recibos:', includeError.message);
      const basicIncludes = includeOptions.filter(inc => 
        inc.model !== db.servicios && inc.model !== db.recibos
      );
      const result = await Citas.findAndCountAll({
        where,
        include: basicIncludes,
        limit,
        offset,
        distinct: true
      });
      count = result.count;
      rows = result.rows;
    }

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({ 
      result: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error inesperado' });
  }
};
const insertCitas = async (req, res) => {
  try {
    const { fecha, hora_inicio, tipo_terapia, id_terapeuta, servicios = [] } = req.body;

    // Validar capacidad antes de crear la cita
    await validateCapacity(fecha, hora_inicio, tipo_terapia, id_terapeuta);

    // Calcular total de servicios
    let total = 0;
    if (servicios && servicios.length > 0) {
      const serviciosData = await db.servicios.findAll({
        where: {
          id_servicio: servicios,
          estado: true
        }
      });
      total = serviciosData.reduce((sum, servicio) => {
        return sum + parseFloat(servicio.costo || 0);
      }, 0);
    }

    // Crear cita con total
    const citaData = { ...req.body, total };
    const newCita = await Citas.create(citaData);

    // Asociar servicios si existen
    if (servicios && servicios.length > 0) {
      await newCita.setServicios(servicios);
    }

    // Recargar con relaciones
    const citaCompleta = await Citas.findByPk(newCita.id_cita, {
      include: [
        { model: db.paciente, attributes: ['nombre', 'apellido'] },
        { model: db.terapeuta, attributes: ['nombre', 'apellido'] },
        { model: db.servicios, as: 'servicios', attributes: ['id_servicio', 'nombre', 'costo'], through: { attributes: [] } }
      ]
    });

    res.status(201).json({ message: 'Cita creada exitosamente', data: citaCompleta });
  } catch (error) {
    console.error(error);
    // Si es error de validación de capacidad, retornar 400 (Bad Request)
    if (error.message.includes('Capacidad máxima alcanzada')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Insertar múltiples citas a la vez (mismo horario, diferentes pacientes)
const insertCitasMultiple = async (req, res) => {
  try {
    const { citas } = req.body;

    if (!citas || !Array.isArray(citas) || citas.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar un array de citas válido' });
    }

    // Validar que todas las citas tengan los mismos datos básicos (excepto paciente)
    const primeraCita = citas[0];
    const { fecha, hora_inicio, tipo_terapia, id_terapeuta } = primeraCita;

    if (!fecha || !hora_inicio || !tipo_terapia || !id_terapeuta) {
      return res.status(400).json({ error: 'Todas las citas deben tener fecha, hora_inicio, tipo_terapia e id_terapeuta' });
    }

    // Validar que todas las citas sean del mismo tipo y horario
    const todasIguales = citas.every(cita => 
      cita.fecha === fecha &&
      cita.hora_inicio === hora_inicio &&
      cita.tipo_terapia === tipo_terapia &&
      cita.id_terapeuta === id_terapeuta
    );

    if (!todasIguales) {
      return res.status(400).json({ error: 'Todas las citas deben tener la misma fecha, hora, tipo de terapia y terapeuta' });
    }

    // Validar capacidad para todas las citas
    const cantidadCitas = citas.length;
    const hora = getHourFromTime(hora_inicio);
    
    if (hora === null) {
      return res.status(400).json({ error: 'Hora de inicio inválida' });
    }

    const capacidadMaxima = tipo_terapia === 'Fisica' ? 3 : tipo_terapia === 'Neurologica' ? 2 : 0;
    
    if (capacidadMaxima === 0) {
      return res.status(400).json({ error: 'Tipo de terapia inválido' });
    }

    const horaInicioRango = `${hora.toString().padStart(2, '0')}:00:00`;
    const horaFinRango = `${hora.toString().padStart(2, '0')}:59:59`;

    // Contar citas existentes en esa hora
    const citasExistentes = await Citas.count({
      where: {
        fecha,
        id_terapeuta,
        tipo_terapia,
        estado: {
          [Op.ne]: 'Cancelada'
        },
        hora_inicio: {
          [Op.gte]: horaInicioRango,
          [Op.lte]: horaFinRango
        }
      }
    });

    const cuposDisponibles = capacidadMaxima - citasExistentes;

    if (cantidadCitas > cuposDisponibles) {
      return res.status(400).json({
        error: `No hay suficiente capacidad. Intenta crear ${cantidadCitas} cita(s) pero solo hay ${cuposDisponibles} cupo(s) disponible(s) ` +
               `para ${tipo_terapia === 'Fisica' ? 'Terapia Física' : 'Terapia Neurológica'} en la hora ${hora}:00. ` +
               `Máximo permitido: ${capacidadMaxima} paciente(s) por hora. ` +
               `Actualmente hay ${citasExistentes} cita(s) en esta hora.`
      });
    }

    // Validar que no haya pacientes duplicados
    const pacientesIds = citas.map(c => c.id_paciente);
    const pacientesUnicos = [...new Set(pacientesIds)];
    
    if (pacientesIds.length !== pacientesUnicos.length) {
      return res.status(400).json({ error: 'No se pueden crear múltiples citas para el mismo paciente en el mismo horario' });
    }

    // Validar que los pacientes no tengan ya una cita en ese horario
    const citasExistentesPacientes = await Citas.findAll({
      where: {
        fecha,
        id_terapeuta,
        tipo_terapia,
        estado: {
          [Op.ne]: 'Cancelada'
        },
        hora_inicio: {
          [Op.gte]: horaInicioRango,
          [Op.lte]: horaFinRango
        },
        id_paciente: {
          [Op.in]: pacientesIds
        }
      }
    });

    if (citasExistentesPacientes.length > 0) {
      const pacientesConCita = citasExistentesPacientes.map(c => c.id_paciente);
      return res.status(400).json({
        error: `Algunos pacientes ya tienen una cita programada en este horario. IDs de pacientes: ${pacientesConCita.join(', ')}`
      });
    }

    // Calcular total para cada cita basado en servicios
    let total = 0;
    if (primeraCita.servicios && primeraCita.servicios.length > 0) {
      const serviciosData = await db.servicios.findAll({
        where: {
          id_servicio: primeraCita.servicios,
          estado: true
        }
      });
      total = serviciosData.reduce((sum, servicio) => {
        return sum + parseFloat(servicio.costo || 0);
      }, 0);
    }

    // Agregar total a cada cita
    const citasConTotal = citas.map(cita => ({ ...cita, total }));

    // Crear todas las citas en una transacción
    const citasCreadas = await Citas.bulkCreate(citasConTotal, {
      validate: true,
      returning: true
    });

    // Asociar servicios a todas las citas
    if (primeraCita.servicios && primeraCita.servicios.length > 0) {
      for (const cita of citasCreadas) {
        await cita.setServicios(primeraCita.servicios);
      }
    }

    res.status(201).json({
      message: `Se crearon ${citasCreadas.length} cita(s) exitosamente`,
      data: citasCreadas,
      cantidad: citasCreadas.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error al crear las citas' });
  }
};

const updateCitas = async (req, res) => {
  try {
    const { cita_id } = req.query;
    const { servicios, ...citaData } = req.body;
    const cita = await Citas.findByPk(cita_id);
    
    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    // Si se está cambiando la hora, fecha, tipo de terapia o terapeuta, validar capacidad
    const fecha = citaData.fecha || cita.fecha;
    const horaInicio = citaData.hora_inicio || cita.hora_inicio;
    const tipoTerapia = citaData.tipo_terapia || cita.tipo_terapia;
    const idTerapeuta = citaData.id_terapeuta || cita.id_terapeuta;

    // Solo validar si la cita no está siendo cancelada
    if (citaData.estado !== 'Cancelada' && (!citaData.estado && cita.estado !== 'Cancelada')) {
      await validateCapacity(fecha, horaInicio, tipoTerapia, idTerapeuta, parseInt(cita_id));
    }

    // Calcular total si se están actualizando servicios
    if (servicios !== undefined) {
      let total = 0;
      if (servicios && servicios.length > 0) {
        const serviciosData = await db.servicios.findAll({
          where: {
            id_servicio: servicios,
            estado: true
          }
        });
        total = serviciosData.reduce((sum, servicio) => {
          return sum + parseFloat(servicio.costo || 0);
        }, 0);
      }
      citaData.total = total;
    }

    await cita.update(citaData);

    // Actualizar servicios si se proporcionaron
    if (servicios !== undefined) {
      await cita.setServicios(servicios || []);
    }

    // Recargar con relaciones
    const citaActualizada = await Citas.findByPk(cita_id, {
      include: [
        { model: db.paciente, attributes: ['nombre', 'apellido'] },
        { model: db.terapeuta, attributes: ['nombre', 'apellido'] },
        { model: db.servicios, as: 'servicios', attributes: ['id_servicio', 'nombre', 'costo'], through: { attributes: [] } },
        { model: db.recibos, as: 'Recibo', attributes: ['id_recibo', 'numero_recibo', 'fecha_cobro', 'estado', 'total'] }
      ]
    });

    res.status(200).json({ message: 'Cita actualizada exitosamente', data: citaActualizada });
  } catch (error) {
    console.error(error);
    // Si es error de validación de capacidad, retornar 400 (Bad Request)
    if (error.message.includes('Capacidad máxima alcanzada')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

const deleteCitas = async (req, res) => {
  try {
    const { cita_id } = req.query;
    const cita = await Citas.findByPk(cita_id);
    
    if (cita) {
      await cita.destroy();
      res.status(200).json({ message: 'Cita eliminada exitosamente' });
    } else {
      res.status(404).json({ error: 'Cita no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Endpoint para verificar capacidad disponible en una hora específica
const checkCapacity = async (req, res) => {
  try {
    const { fecha, hora_inicio, tipo_terapia, id_terapeuta, id_cita_excluir } = req.query;

    if (!fecha || !hora_inicio || !tipo_terapia || !id_terapeuta) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    const hora = getHourFromTime(hora_inicio);
    if (hora === null) {
      return res.status(400).json({ error: 'Hora de inicio inválida' });
    }

    const capacidadMaxima = tipo_terapia === 'Fisica' ? 3 : tipo_terapia === 'Neurologica' ? 2 : 0;
    
    if (capacidadMaxima === 0) {
      return res.status(400).json({ error: 'Tipo de terapia inválido' });
    }

    const horaInicioRango = `${hora.toString().padStart(2, '0')}:00:00`;
    const horaFinRango = `${hora.toString().padStart(2, '0')}:59:59`;

    const whereClause = {
      fecha,
      id_terapeuta: parseInt(id_terapeuta),
      tipo_terapia,
      estado: {
        [Op.ne]: 'Cancelada'
      },
      hora_inicio: {
        [Op.gte]: horaInicioRango,
        [Op.lte]: horaFinRango
      }
    };

    if (id_cita_excluir) {
      whereClause.id_cita = {
        [Op.ne]: parseInt(id_cita_excluir)
      };
    }

    const citasExistentes = await Citas.count({
      where: whereClause
    });

    const disponible = citasExistentes < capacidadMaxima;
    const cuposDisponibles = capacidadMaxima - citasExistentes;

    res.status(200).json({
      disponible,
      capacidadMaxima,
      citasExistentes,
      cuposDisponibles,
      hora: `${hora}:00`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getCitas, insertCitas, insertCitasMultiple, updateCitas, deleteCitas, checkCapacity };