'use strict'

const db = require('../config/db');
const  paciente= db.paciente;
const encargado = db.encargado;

async function getpacientes(req, res){
paciente.findAll({
    include:[{
        model: encargado,
        attributes: ['nombre','apellido']
    }]
})
.then(result=>{
res.status(200).send({result})
}).catch(error=> {
    res.status(500).send({message:error.message || "Sucedió un errror inesperado"})
});
}

const insertpacientes = async (req, res) => {
    try {
        const newpaciente = await paciente.create(req.body); 
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
            await pacienteToDelete.destroy({ where: { paciente_id } });

            await pacienteToDelete.destroy();
            res.status(200).json({ message: 'Paciente eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Paciente no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports={
    getpacientes,
    insertpacientes,
    updatepacientes,
    deletepacientes
}