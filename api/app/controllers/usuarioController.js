'use strict';

const db = require('../config/db');
const usuario = db.usuarios;
const bcrypt = require('bcrypt');
const jwt = require('../services/services');

const getUsuarios = async (req, res) => {
    usuario.findAll()
        .then(result => {
            res.status(200).send({ result });
        })
        .catch(error => {
            res.status(500).send({ message: error.message || "Sucedió un error inesperado" });
        });
};

const insertUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol, estado } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUsuario = await usuario.create({ nombre, email, password: hashedPassword, rol, estado });
        res.status(201).json({ message: 'Usuario guardado exitosamente', data: newUsuario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updateUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.query;
        const { nombre, email, password, rol, estado } = req.body;

        const usuarioToUpdate = await usuario.findByPk(id_usuario);
        if (!usuarioToUpdate) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        let newPassword = usuarioToUpdate.password;
        if (password && password !== usuarioToUpdate.password) {
            newPassword = await bcrypt.hash(password, 10);
        }

        await usuarioToUpdate.update({
            nombre,
            email,
            password: newPassword,
            rol,
            estado
        });

        res.status(200).json({ message: 'Usuario actualizado exitosamente', data: usuarioToUpdate });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const deleteUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.query;

        const usuarioToDelete = await usuario.findByPk(id_usuario);
        if (usuarioToDelete) {
            await usuarioToDelete.destroy();
            res.status(200).json({ message: 'Usuario eliminado exitosamente' });
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await usuario.findOne({ where: { email, estado: true } });

        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.createToken(user);
        const rol = user.rol;
        var idRol;
        
        if (rol === 'Administrador') {
            idRol = 1;
        }else{
            idRol = 0;
        }
        console.log(idRol.toString());
        res.status(200).json({ message: 'Login exitoso', token , idRol });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getUsuarios,
    insertUsuario,
    updateUsuario,
    deleteUsuario,
    loginUsuario
};
