'use strict';

const db = require('../config/db');
const terapeuta = db.terapeuta;

const getTerapeutas = async (req, res) => {
    terapeuta.findAll({
        where: { estado: true }
    })
        .then(result => {
            res.status(200).send({ result });
        })
        .catch(error => {
            res.status(500).send({ message: error.message || "Sucedió un error inesperado" });
        });
}

const insertTerapeutas = async (req, res) => {
    try {
        const newterapeuta = await terapeuta.create(req.body);
        res.status(201).json({ message: 'Terapeuta guardado exitosamente', data: newterapeuta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updateTerapeutas = async (req, res) => {
    try {
        const { terapeuta_id } = req.query;
        const terapeutaData = req.body;

        const terapeutaToUpdate = await terapeuta.findByPk(terapeuta_id);
        if (terapeutaToUpdate) {
            await terapeutaToUpdate.update(terapeutaData);
            res.status(200).json({ message: 'Terapeuta actualizado exitosamente', data: terapeutaToUpdate });
        } else {
            res.status(404).json({ error: 'Terapeuta no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const deleteTerapeutas = async (req, res) => {
    try {
        const { terapeuta_id } = req.query;

        const terapeutaToDelete = await terapeuta.findByPk(terapeuta_id);
        if (terapeutaToDelete) {
            await terapeutaToDelete.update({ estado: false });
            res.status(200).json({ message: 'Terapeuta eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Terapeuta no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getTerapeutas,
    insertTerapeutas,
    updateTerapeutas,
    deleteTerapeutas
};