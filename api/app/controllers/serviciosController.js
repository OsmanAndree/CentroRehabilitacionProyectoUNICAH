'use strict';

const db = require('../config/db');
const Servicios = db.servicios;
const { Op } = db.Sequelize;

const getServicios = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filtrar solo servicios activos por defecto
    if (!req.query.includeInactivos) {
      where.estado = true;
    }

    const { count, rows } = await Servicios.findAndCountAll({
      where,
      limit,
      offset,
      order: [['nombre', 'ASC']]
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

const insertServicio = async (req, res) => {
  try {
    const newServicio = await Servicios.create(req.body);
    res.status(201).json({ message: 'Servicio creado exitosamente', data: newServicio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateServicio = async (req, res) => {
  try {
    const { servicio_id } = req.query;
    const servicioData = req.body;
    const servicio = await Servicios.findByPk(servicio_id);

    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    await servicio.update(servicioData);
    res.status(200).json({ message: 'Servicio actualizado exitosamente', data: servicio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteServicio = async (req, res) => {
  try {
    const { servicio_id } = req.query;
    const servicio = await Servicios.findByPk(servicio_id);

    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    await servicio.destroy();
    res.status(200).json({ message: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getServicios, insertServicio, updateServicio, deleteServicio };

