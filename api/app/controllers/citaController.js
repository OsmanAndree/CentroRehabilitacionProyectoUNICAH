'use strict';

const db = require('../config/db');
const Citas = db.citas;

const getCitas = async (req, res) => {
  try {
    const { fecha, id_terapeuta } = req.query;
    const where = {};
    if (fecha) {
      where.fecha = fecha;
    }
    if (id_terapeuta) {
      where.id_terapeuta = id_terapeuta;
    }
    const result = await Citas.findAll({
      where,
      include: [
        {
          model: db.paciente,
          attributes: ['nombre', 'apellido']
        },
        {
          model: db.terapeuta,
          attributes: ['id_terapeuta', 'nombre', 'apellido']
        }
      ]
    });
    res.status(200).json({ result });
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