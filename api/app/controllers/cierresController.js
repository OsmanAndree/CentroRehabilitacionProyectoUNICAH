'use strict';

const db = require('../config/db');
const Cierres = db.cierres;
const Citas = db.citas;
const Recibos = db.recibos;
const { Op } = db.Sequelize;

// Obtener datos del día para el cierre
const getDatosCierre = async (req, res) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
    
    // Obtener todas las citas del día
    const citasDelDia = await Citas.findAll({
      where: {
        fecha: fecha
      },
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
        },
        {
          model: db.recibos,
          as: 'Recibo',
          attributes: ['id_recibo', 'numero_recibo', 'fecha_cobro', 'total', 'estado']
        }
      ],
      order: [['hora_inicio', 'ASC']]
    });

    // Obtener recibos del día
    const recibosDelDia = await Recibos.findAll({
      where: {
        fecha_cobro: {
          [Op.gte]: `${fecha} 00:00:00`,
          [Op.lte]: `${fecha} 23:59:59`
        },
        estado: 'Activo'
      },
      include: [
        {
          model: Citas,
          as: 'Cita',
          attributes: ['id_cita', 'fecha', 'hora_inicio'],
          include: [
            {
              model: db.paciente,
              attributes: ['nombre', 'apellido']
            }
          ]
        }
      ],
      order: [['fecha_cobro', 'DESC']]
    });

    // Calcular totales
    const totalEsperado = citasDelDia.reduce((sum, cita) => {
      return sum + parseFloat(cita.total || 0);
    }, 0);

    const totalCobrado = recibosDelDia.reduce((sum, recibo) => {
      return sum + parseFloat(recibo.total || 0);
    }, 0);

    // Contar citas por estado
    const citasPorEstado = {
      total: citasDelDia.length,
      pagadas: citasDelDia.filter(c => c.Recibo && c.Recibo.estado === 'Activo').length,
      pendientes: citasDelDia.filter(c => c.estado === 'Pendiente').length,
      confirmadas: citasDelDia.filter(c => c.estado === 'Confirmada').length,
      completadas: citasDelDia.filter(c => c.estado === 'Completada').length,
      canceladas: citasDelDia.filter(c => c.estado === 'Cancelada').length
    };

    // Verificar si ya existe un cierre para este día
    const cierreExistente = await Cierres.findOne({
      where: {
        fecha_cierre: fecha
      }
    });

    res.status(200).json({
      fecha,
      totalEsperado,
      totalCobrado,
      diferencia: totalCobrado - totalEsperado,
      citasPorEstado,
      citas: citasDelDia,
      recibos: recibosDelDia,
      cierreExistente: cierreExistente ? true : false,
      cierreId: cierreExistente?.id_cierre || null
    });
  } catch (error) {
    console.error('Error obteniendo datos de cierre:', error);
    res.status(500).json({ error: error.message || 'Error inesperado' });
  }
};

// Crear un nuevo cierre
const crearCierre = async (req, res) => {
  try {
    const { fecha, observaciones, id_usuario } = req.body;
    const fechaCierre = fecha || new Date().toISOString().split('T')[0];

    // Verificar si ya existe un cierre para este día
    const cierreExistente = await Cierres.findOne({
      where: {
        fecha_cierre: fechaCierre
      }
    });

    if (cierreExistente) {
      return res.status(400).json({ error: 'Ya existe un cierre para esta fecha' });
    }

    // Obtener datos del día
    const citasDelDia = await Citas.findAll({
      where: {
        fecha: fechaCierre
      },
      include: [
        {
          model: db.recibos,
          as: 'Recibo',
          attributes: ['id_recibo', 'total', 'estado']
        }
      ]
    });

    const recibosDelDia = await Recibos.findAll({
      where: {
        fecha_cobro: {
          [Op.gte]: `${fechaCierre} 00:00:00`,
          [Op.lte]: `${fechaCierre} 23:59:59`
        },
        estado: 'Activo'
      }
    });

    // Calcular totales
    const totalEsperado = citasDelDia.reduce((sum, cita) => {
      return sum + parseFloat(cita.total || 0);
    }, 0);

    const totalCobrado = recibosDelDia.reduce((sum, recibo) => {
      return sum + parseFloat(recibo.total || 0);
    }, 0);

    const diferencia = totalCobrado - totalEsperado;

    // Contar citas por estado
    const citasPorEstado = {
      total: citasDelDia.length,
      pagadas: citasDelDia.filter(c => c.Recibo && c.Recibo.estado === 'Activo').length,
      pendientes: citasDelDia.filter(c => c.estado === 'Pendiente').length,
      confirmadas: citasDelDia.filter(c => c.estado === 'Confirmada').length,
      completadas: citasDelDia.filter(c => c.estado === 'Completada').length,
      canceladas: citasDelDia.filter(c => c.estado === 'Cancelada').length
    };

    // Crear cierre
    const nuevoCierre = await Cierres.create({
      fecha_cierre: fechaCierre,
      hora_cierre: new Date().toTimeString().split(' ')[0],
      total_esperado: totalEsperado,
      total_cobrado: totalCobrado,
      diferencia: diferencia,
      total_citas: citasPorEstado.total,
      citas_pagadas: citasPorEstado.pagadas,
      citas_pendientes: citasPorEstado.pendientes,
      citas_confirmadas: citasPorEstado.confirmadas,
      citas_completadas: citasPorEstado.completadas,
      citas_canceladas: citasPorEstado.canceladas,
      observaciones: observaciones || null,
      id_usuario: id_usuario || null
    });

    res.status(201).json({
      message: 'Cierre creado exitosamente',
      data: nuevoCierre
    });
  } catch (error) {
    console.error('Error creando cierre:', error);
    res.status(500).json({ error: error.message || 'Error inesperado' });
  }
};

// Obtener historial de cierres
const getCierres = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const fechaDesde = req.query.fechaDesde || null;
    const fechaHasta = req.query.fechaHasta || null;

    const where = {};
    if (fechaDesde && fechaHasta) {
      where.fecha_cierre = {
        [Op.between]: [fechaDesde, fechaHasta]
      };
    } else if (fechaDesde) {
      where.fecha_cierre = {
        [Op.gte]: fechaDesde
      };
    } else if (fechaHasta) {
      where.fecha_cierre = {
        [Op.lte]: fechaHasta
      };
    }

    const { count, rows } = await Cierres.findAndCountAll({
      where,
      include: [
        {
          model: db.usuarios,
          as: 'usuario',
          attributes: ['id_usuario', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_cierre', 'DESC'], ['hora_cierre', 'DESC']],
      limit,
      offset
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
    console.error('Error obteniendo cierres:', error);
    res.status(500).json({ error: error.message || 'Error inesperado' });
  }
};

// Obtener un cierre por ID
const getCierreById = async (req, res) => {
  try {
    const { cierre_id } = req.query;
    const cierre = await Cierres.findByPk(cierre_id, {
      include: [
        {
          model: db.usuarios,
          as: 'usuario',
          attributes: ['id_usuario', 'nombre', 'apellido']
        }
      ]
    });

    if (!cierre) {
      return res.status(404).json({ error: 'Cierre no encontrado' });
    }

    res.status(200).json({ result: cierre });
  } catch (error) {
    console.error('Error obteniendo cierre:', error);
    res.status(500).json({ error: error.message || 'Error inesperado' });
  }
};

module.exports = {
  getDatosCierre,
  crearCierre,
  getCierres,
  getCierreById
};

