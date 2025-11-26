'use strict';

const db = require('../config/db');
const Citas = db.citas;

const getCitas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchPaciente = req.query.searchPaciente || '';
    const searchTherapist = req.query.searchTherapist || '';
    const searchDate = req.query.searchDate || '';
    const offset = (page - 1) * limit;
    const { Op } = db.Sequelize;

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

    const { count, rows } = await Citas.findAndCountAll({
      where,
      include: includeOptions,
      limit,
      offset,
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
    res.status(500).json({ message: error.message || 'Error inesperado' });
  }
};
const insertCitas = async (req, res) => {
  try {
    const newCita = await Citas.create(req.body);
    res.status(201).json({ message: 'Cita creada exitosamente', data: newCita });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const updateCitas = async (req, res) => {
  try {
    const { cita_id } = req.query;
    const citaData = req.body;
    const cita = await Citas.findByPk(cita_id);
    
    if (cita) {
      await cita.update(citaData);
      res.status(200).json({ message: 'Cita actualizada exitosamente', data: cita });
    } else {
      res.status(404).json({ error: 'Cita no encontrada' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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

module.exports = { getCitas, insertCitas, updateCitas, deleteCitas };