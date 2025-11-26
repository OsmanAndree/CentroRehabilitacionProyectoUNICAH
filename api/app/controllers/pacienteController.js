'use strict'

const db = require('../config/db');
const paciente = db.paciente;
const encargado = db.encargado;

async function getpacientes(req, res) {
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
                { apellido: { [Op.like]: `%${search}%` } },
                { numero_identidad: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await paciente.findAndCountAll({
            where,
            include: [{
                model: encargado,
                attributes: ['nombre', 'apellido']
            }],
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

const insertpacientes = async (req, res) => {
    try {

        if (req.body.genero !== undefined && req.body.genero !== null) {
            const generoNum = Number(req.body.genero);
            if (![0, 1, 2].includes(generoNum)) {
                return res.status(400).json({ error: 'El género debe ser 0 (Masculino), 1 (Femenino) o 2 (Indefinido)' });
            }
        }

        const pacienteData = { ...req.body, estado: true };
        
        const newpaciente = await paciente.create(pacienteData);
        res.status(201).json({ message: 'Paciente guardado exitosamente', data: newpaciente });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updatepacientes = async (req, res) => {
    try {
        const { paciente_id } = req.query;
        const pacienteData = req.body;

        if (pacienteData.genero !== undefined && pacienteData.genero !== null) {
            const generoNum = Number(pacienteData.genero);
            if (![0, 1, 2].includes(generoNum)) {
                return res.status(400).json({ error: 'Genero Inválido' });
            }
        }

        const pacienteToUpdate = await paciente.findByPk(paciente_id);
        if (pacienteToUpdate) {
            await pacienteToUpdate.update(pacienteData);
            res.status(200).json({ message: 'Paciente actualizado exitosamente', data: pacienteToUpdate });
        } else {
            res.status(404).json({ error: 'Paciente no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const deletepacientes = async (req, res) => {
    try {
        const { paciente_id } = req.query;

        const pacienteToDelete = await paciente.findByPk(paciente_id);
        if (pacienteToDelete) {
            await pacienteToDelete.update({ estado: false });
            res.status(200).json({ message: 'Paciente eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Paciente no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const darAltaPaciente = async (req, res) => {
    try {
        const { paciente_id } = req.query;

        const pacienteToUpdate = await paciente.findByPk(paciente_id);
        if (pacienteToUpdate) {
            await pacienteToUpdate.update({ alta_medica: true });
            res.status(200).json({ 
                message: 'El paciente ha sido dado de alta exitosamente', 
                data: pacienteToUpdate 
            });
        } else {
            res.status(404).json({ error: 'Paciente no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getpacientes,
    insertpacientes,
    updatepacientes,
    deletepacientes,
    darAltaPaciente
}