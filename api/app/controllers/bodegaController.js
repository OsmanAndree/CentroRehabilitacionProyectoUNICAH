'use strict';

const db = require('../config/db');
const { Op } = db.Sequelize;
const Bodega = db.bodegas;
const Producto = db.productos;

async function getBodegas(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const where = { estado: true };
        const includeWhere = {};
        if (search) {
            includeWhere.nombre = { [Op.like]: `%${search}%` };
        }

        const includeOptions = {
            model: Producto,
            as: 'producto', 
            attributes: ['id_producto', 'nombre']
        };
        
        if (search) {
            includeOptions.where = includeWhere;
        }

        const { count, rows } = await Bodega.findAndCountAll({
            where,
            include: [includeOptions],
            limit,
            offset,
            distinct: true
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

const insertBodega = async (req, res) => {
    try {
        const bodegaData = { ...req.body, estado: true };
        const newBodega = await Bodega.create(bodegaData);
        res.status(201).json({ message: 'Bodega guardada exitosamente', data: newBodega });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updateBodega = async (req, res) => {
    try {
        const { bodega_id } = req.query;
        const bodegaData = req.body;

        const bodegaToUpdate = await Bodega.findByPk(bodega_id);
        if (bodegaToUpdate) {
            await bodegaToUpdate.update(bodegaData);
            res.status(200).json({ message: 'Bodega actualizada exitosamente', data: bodegaToUpdate });
        } else {
            res.status(404).json({ error: 'Bodega no encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const deleteBodega = async (req, res) => {
    try {
        const { bodega_id } = req.query;

        const bodegaToDelete = await Bodega.findByPk(bodega_id);
        if (bodegaToDelete) {
            await bodegaToDelete.update({ estado: false })
            res.status(200).json({ message: 'Bodega eliminada exitosamente' });
        } else {
            res.status(404).json({ error: 'Bodega no encontrada' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getBodegas,
    insertBodega,
    updateBodega,
    deleteBodega
};