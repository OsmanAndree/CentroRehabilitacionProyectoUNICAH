'use strict'

const db = require('../config/db');
const diagnostico= db.diagnostico;
const Paciente = db.paciente;
const Terapeuta = db.terapeuta;

async function getDiagnostico(req, res) {
    diagnostico.findAll({
        where: { estado: true },
        include: [
            {
                model: Paciente,
                attributes: ['nombre', 'apellido', 'fecha_nacimiento']
            },
            {
                model: Terapeuta,
                attributes: ['nombre', 'especialidad']
            }
        ]
    })
    .then(result => {
        res.status(200).send({ result });
    })
    .catch(error => {
        res.status(500).send({ message: error.message || "Sucedió un error inesperado" });
    });
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

module.exports={
    getDiagnostico,
    insertDiagnostico,
    updateDiagnostico,
    deleteDiagnostico
}