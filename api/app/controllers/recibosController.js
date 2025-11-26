'use strict';

const db = require('../config/db');
const Recibos = db.recibos;
const Citas = db.citas;
const { Op } = db.Sequelize;

const getRecibos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchDate = req.query.searchDate || '';
    const offset = (page - 1) * limit;

    const where = {};
    if (searchDate) {
      where.fecha_cobro = {
        [Op.gte]: `${searchDate} 00:00:00`,
        [Op.lte]: `${searchDate} 23:59:59`
      };
    }

    if (req.query.estado) {
      where.estado = req.query.estado;
    }

    const includeOptions = [
      {
        model: Citas,
        as: 'Cita',
        attributes: ['id_cita', 'fecha', 'hora_inicio', 'hora_fin', 'tipo_terapia', 'total', 'estado'],
        include: [
          {
            model: db.paciente,
            attributes: ['id_paciente', 'nombre', 'apellido']
          },
          {
            model: db.terapeuta,
            attributes: ['id_terapeuta', 'nombre', 'apellido']
          },
          {
            model: db.servicios,
            as: 'servicios',
            attributes: ['id_servicio', 'nombre', 'costo'],
            through: { attributes: [] }
          }
        ]
      }
    ];

    const { count, rows } = await Recibos.findAndCountAll({
      where,
      include: includeOptions,
      limit,
      offset,
      order: [['fecha_cobro', 'DESC']],
      distinct: true
    });

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
    res.status(500).json({ error: error.message || 'Error inesperado' });
  }
};

const getReciboById = async (req, res) => {
  try {
    const { recibo_id } = req.query;
    const recibo = await Recibos.findByPk(recibo_id, {
      include: [
        {
          model: Citas,
          as: 'Cita',
          attributes: ['id_cita', 'fecha', 'hora_inicio', 'hora_fin', 'tipo_terapia', 'total'],
          include: [
            {
              model: db.paciente,
              attributes: ['id_paciente', 'nombre', 'apellido']
            },
            {
              model: db.terapeuta,
              attributes: ['id_terapeuta', 'nombre', 'apellido']
            },
            {
              model: db.servicios,
              as: 'servicios',
              attributes: ['id_servicio', 'nombre', 'costo'],
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!recibo) {
      return res.status(404).json({ error: 'Recibo no encontrado' });
    }

    res.status(200).json({ result: recibo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearRecibo = async (req, res) => {
  try {
    const { id_cita } = req.body;

    // Verificar que la cita existe
    const cita = await Citas.findByPk(id_cita, {
      include: [
        {
          model: db.servicios,
          as: 'servicios',
          attributes: ['id_servicio', 'nombre', 'costo'],
          through: { attributes: [] }
        }
      ]
    });

    if (!cita) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    // Verificar que la cita no esté cancelada
    if (cita.estado === 'Cancelada') {
      return res.status(400).json({ error: 'No se puede cobrar una cita cancelada' });
    }

    // Verificar que no tenga recibo ya
    const reciboExistente = await Recibos.findOne({ where: { id_cita } });
    if (reciboExistente) {
      return res.status(400).json({ error: 'Esta cita ya tiene un recibo generado' });
    }

    // Generar número de recibo
    const ultimoRecibo = await Recibos.findOne({
      order: [['id_recibo', 'DESC']]
    });
    
    const numeroRecibo = ultimoRecibo 
      ? `REC-${String(ultimoRecibo.id_recibo + 1).padStart(6, '0')}`
      : 'REC-000001';

    // Calcular total si no está calculado
    let total = parseFloat(cita.total) || 0;
    if (total === 0 && cita.servicios && cita.servicios.length > 0) {
      total = cita.servicios.reduce((sum, servicio) => {
        return sum + parseFloat(servicio.costo || 0);
      }, 0);
    }

    // Crear recibo
    const nuevoRecibo = await Recibos.create({
      id_cita,
      numero_recibo: numeroRecibo,
      fecha_cobro: new Date(),
      total: total,
      estado: 'Activo'
    });

    // Actualizar estado de la cita a "Completada"
    await cita.update({ estado: 'Completada' });

    // Obtener el recibo completo con todas las relaciones
    const reciboCompleto = await Recibos.findByPk(nuevoRecibo.id_recibo, {
      include: [
        {
          model: Citas,
          as: 'Cita',
          attributes: ['id_cita', 'fecha', 'hora_inicio', 'hora_fin', 'tipo_terapia', 'total', 'estado'],
          include: [
            {
              model: db.paciente,
              attributes: ['id_paciente', 'nombre', 'apellido']
            },
            {
              model: db.terapeuta,
              attributes: ['id_terapeuta', 'nombre', 'apellido']
            },
            {
              model: db.servicios,
              as: 'servicios',
              attributes: ['id_servicio', 'nombre', 'costo'],
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    res.status(201).json({
      message: 'Recibo creado exitosamente',
      data: reciboCompleto
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const anularRecibo = async (req, res) => {
  try {
    const { recibo_id } = req.query;
    const recibo = await Recibos.findByPk(recibo_id);

    if (!recibo) {
      return res.status(404).json({ error: 'Recibo no encontrado' });
    }

    if (recibo.estado === 'Anulado') {
      return res.status(400).json({ error: 'El recibo ya está anulado' });
    }

    await recibo.update({ estado: 'Anulado' });

    // Revertir estado de la cita a "Confirmada" o "Pendiente"
    const cita = await Citas.findByPk(recibo.id_cita);
    if (cita) {
      const nuevoEstado = cita.estado === 'Completada' ? 'Confirmada' : cita.estado;
      await cita.update({ estado: nuevoEstado });
    }

    res.status(200).json({ message: 'Recibo anulado exitosamente', data: recibo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getRecibos, getReciboById, crearRecibo, anularRecibo };

