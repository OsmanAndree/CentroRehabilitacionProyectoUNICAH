'use strict';

const db = require('../config/db');
const prestamo = db.prestamos;
const Paciente = db.paciente;
const Producto = db.productos;

async function getPrestamo(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;
        const { Op } = db.Sequelize;

        const pacienteWhere = {};
        const productoWhere = {};
        
        if (search) {
            const searchLower = search.toLowerCase();
            pacienteWhere[Op.or] = [
                { nombre: { [Op.like]: `%${searchLower}%` } },
                { apellido: { [Op.like]: `%${searchLower}%` } }
            ];
            productoWhere.nombre = { [Op.like]: `%${searchLower}%` };
        }

        const includeOptions = [
            {
                model: Paciente, 
                attributes: ['nombre', 'apellido'],
                ...(Object.keys(pacienteWhere).length > 0 && { where: pacienteWhere })
            },
            {
                model: Producto,
                attributes: ['nombre', 'descripcion'],
                ...(Object.keys(productoWhere).length > 0 && { where: productoWhere })
            }
        ];

        const { count, rows } = await prestamo.findAndCountAll({
            include: includeOptions,
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
        console.error(error);
        res.status(500).send({ message: error.message || "Sucedió un error inesperado" });
    }
}

const insertPrestamo = async (req, res) => {
    try {
        const newPrestamo = await prestamo.create(req.body);
        res.status(201).json({ message: 'Préstamo guardado exitosamente', data: newPrestamo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updatePrestamo = async (req, res) => {
    try {
        const { prestamo_id } = req.query;
        const prestamoData = req.body;

        const prestamoToUpdate = await prestamo.findByPk(prestamo_id);
        if (prestamoToUpdate) {
            await prestamoToUpdate.update(prestamoData);
            res.status(200).json({ message: 'Préstamo actualizado exitosamente', data: prestamoToUpdate });
        } else {
            res.status(404).json({ error: 'Préstamo no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const deletePrestamo = async (req, res) => {
    try {
        const { prestamo_id } = req.query;

        const prestamoToDelete = await prestamo.findByPk(prestamo_id);
        if (prestamoToDelete) {
            await prestamoToDelete.destroy();
            res.status(200).json({ message: 'Préstamo eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Préstamo no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPrestamo,
    insertPrestamo,
    updatePrestamo,
    deletePrestamo
};
