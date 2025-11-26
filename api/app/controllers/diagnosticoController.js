'use strict'

const db = require('../config/db');
const diagnostico= db.diagnostico;
const Paciente = db.paciente;
const Terapeuta = db.terapeuta;

async function getDiagnostico(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;
        const { Op } = db.Sequelize;

        const where = { estado: true };
        
        // Filtro por id_paciente si se proporciona
        if (req.query.id_paciente) {
            where.id_paciente = parseInt(req.query.id_paciente);
        }
        
        const pacienteWhere = {};
        const terapeutaWhere = {};
        
        if (search) {
            const searchLower = search.toLowerCase();
            pacienteWhere[Op.or] = [
                { nombre: { [Op.like]: `%${searchLower}%` } },
                { apellido: { [Op.like]: `%${searchLower}%` } }
            ];
            terapeutaWhere.nombre = { [Op.like]: `%${searchLower}%` };
        }

        const includeOptions = [
            {
                model: Paciente,
                attributes: ['nombre', 'apellido', 'fecha_nacimiento', 'alta_medica'],
                ...(Object.keys(pacienteWhere).length > 0 && { where: pacienteWhere })
            },
            {
                model: Terapeuta,
                attributes: ['nombre', 'apellido', 'especialidad'],
                ...(Object.keys(terapeutaWhere).length > 0 && { where: terapeutaWhere })
            }
        ];

        const { count, rows } = await diagnostico.findAndCountAll({
            where,
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
        res.status(500).send({ message: error.message || "Sucedió un error inesperado" });
    }
}

const insertDiagnostico = async (req, res) => {
    try {
        const diagnosticoData = { ...req.body, estado: true };
        const newdiagnostico = await diagnostico.create(diagnosticoData); 
        res.status(201).json({ message: 'Diagnóstico guardado exitosamente', data: newdiagnostico });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updateDiagnostico = async (req, res) => {
    try {
        const { diagnostico_id } = req.query;
        const diagnosticoData = { ...req.body, estado: true };

        const diagnosticoToUpdate = await diagnostico.findByPk(diagnostico_id);
        if (diagnosticoToUpdate) {
            await diagnosticoToUpdate.update(diagnosticoData);
            res.status(200).json({ message: 'Diagnóstico actualizado exitosamente', data: diagnosticoToUpdate });
        } else {
            res.status(404).json({ error: 'Diagnóstico no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const deleteDiagnostico = async (req, res) => {
    try {
        const { diagnostico_id } = req.query;

        const diagnosticoToDelete = await diagnostico.findByPk(diagnostico_id);
        if (diagnosticoToDelete) {
            await diagnosticoToDelete.update({ estado: false });
            res.status(200).json({ message: 'Diagnóstico eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Diagnóstico no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const udpadteAlta = async (req, res) => {
    try {
        const { diagnostico_id } = req.query;
        const diagnosticoToUpdate = await diagnostico.findByPk(diagnostico_id);

        if (diagnosticoToUpdate) {
            // Actualizar el paciente, no el diagnóstico
            const pacienteToUpdate = await Paciente.findByPk(diagnosticoToUpdate.id_paciente);
            if (pacienteToUpdate) {
                await pacienteToUpdate.update({ alta_medica: true });
                res.status(200).json({ 
                    message: 'El paciente ha sido dado de alta exitosamente', 
                    data: pacienteToUpdate 
                });
            } else {
                res.status(404).json({ error: 'Paciente no encontrado' });
            }
        } else {
            res.status(404).json({ error: 'Diagnóstico no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}


module.exports={
    getDiagnostico,
    insertDiagnostico,
    updateDiagnostico,
    deleteDiagnostico,
    udpadteAlta
}