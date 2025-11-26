'use strict';

const db = require('../config/db');
const terapeuta = db.terapeuta;

const getTerapeutas = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;
        const { Op } = db.Sequelize;

        const where = { estado: true };
        if (search) {
            where[Op.or] = [
                { nombre: { [Op.like]: `%${search}%` } },
                { apellido: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await terapeuta.findAndCountAll({
            where,
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).send({ 
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
        res.status(500).send({ message: error.message || "Sucedió un error inesperado" });
    }
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