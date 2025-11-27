'use strict';

const db = require('../config/db');
const usuario = db.usuarios;
const bcrypt = require('bcrypt');
const jwt = require('../services/services');
const { Op } = db.Sequelize;

const getUsuarios = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { nombre: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await usuario.findAndCountAll({
            where,
            include: [{
                model: db.roles,
                as: 'roles',
                attributes: ['id_role', 'nombre', 'is_admin'],
                through: { attributes: [] }
            }],
            limit,
            offset,
            order: [['id_usuario', 'DESC']]
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
};

const insertUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol, estado, roles } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUsuario = await usuario.create({ 
            nombre, 
            email, 
            password: hashedPassword, 
            rol, // Campo legacy - mantener por compatibilidad
            estado 
        });

        // Asignar roles si se proporcionaron
        if (roles && Array.isArray(roles) && roles.length > 0) {
            const roleRecords = await db.roles.findAll({
                where: { id_role: { [Op.in]: roles } }
            });
            await newUsuario.setRoles(roleRecords);
        } else {
            // Si no se proporcionaron roles, asignar basado en el campo legacy 'rol'
            const defaultRole = await db.roles.findOne({ where: { nombre: rol } });
            if (defaultRole) {
                await newUsuario.setRoles([defaultRole]);
            }
        }

        // Obtener usuario con roles
        const usuarioConRoles = await usuario.findByPk(newUsuario.id_usuario, {
            include: [{
                model: db.roles,
                as: 'roles',
                attributes: ['id_role', 'nombre', 'is_admin'],
                through: { attributes: [] }
            }]
        });

        res.status(201).json({ message: 'Usuario guardado exitosamente', data: usuarioConRoles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const updateUsuario = async (req, res) => {
    try {
        const { id_usuario } = req.query;
        const { nombre, email, password, rol, estado, roles } = req.body;

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
            rol, // Campo legacy
            estado
        });

        // Actualizar roles si se proporcionaron
        if (roles !== undefined && Array.isArray(roles)) {
            const roleRecords = await db.roles.findAll({
                where: { id_role: { [Op.in]: roles } }
            });
            await usuarioToUpdate.setRoles(roleRecords);
        }

        // Obtener usuario con roles actualizados
        const usuarioActualizado = await usuario.findByPk(id_usuario, {
            include: [{
                model: db.roles,
                as: 'roles',
                attributes: ['id_role', 'nombre', 'is_admin'],
                through: { attributes: [] }
            }]
        });

        res.status(200).json({ message: 'Usuario actualizado exitosamente', data: usuarioActualizado });

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
            // Eliminar relaciones con roles
            await db.userRoles.destroy({ where: { id_usuario } });
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
        
        // Buscar usuario con sus roles y permisos
        const user = await usuario.findOne({ 
            where: { email, estado: 'Activo' },
            include: [{
                model: db.roles,
                as: 'roles',
                include: [{
                    model: db.permissions,
                    as: 'permissions',
                    through: { attributes: [] }
                }]
            }]
        });

        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Verificar si es admin (tiene algún rol con is_admin = true)
        const isAdmin = user.roles.some(role => role.is_admin === true);

        // Obtener todos los permisos únicos del usuario
        const permissionsSet = new Set();
        user.roles.forEach(role => {
            if (role.permissions) {
                role.permissions.forEach(permission => {
                    permissionsSet.add(permission.slug);
                });
            }
        });

        // Agrupar permisos por módulo para el frontend
        const permissionsByModule = {};
        user.roles.forEach(role => {
            if (role.permissions) {
                role.permissions.forEach(perm => {
                    const [modulo, action] = perm.slug.split('.');
                    if (!permissionsByModule[modulo]) {
                        permissionsByModule[modulo] = [];
                    }
                    if (!permissionsByModule[modulo].includes(action)) {
                        permissionsByModule[modulo].push(action);
                    }
                });
            }
        });

        const token = jwt.createToken({
            user_id: user.id_usuario,
            nombre: user.nombre,
            rol: user.rol // Campo legacy
        });

        // Legacy: mantener idRol para compatibilidad con frontend existente
        // 1 = Admin, 0 = Otros
        const idRol = isAdmin ? 1 : 0;

        res.status(200).json({ 
            message: 'Login exitoso', 
            token,
            idRol, // Legacy
            user: {
                id: user.id_usuario,
                nombre: user.nombre,
                email: user.email
            },
            roles: user.roles.map(r => ({ 
                id: r.id_role, 
                nombre: r.nombre, 
                is_admin: r.is_admin 
            })),
            isAdmin,
            permissions: Array.from(permissionsSet),
            permissionsByModule
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Asignar roles a un usuario
 */
const assignRoles = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const { roles } = req.body; // Array de IDs de roles

        const user = await usuario.findByPk(id_usuario);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        if (!roles || !Array.isArray(roles)) {
            return res.status(400).json({ error: 'Se requiere un array de roles' });
        }

        const roleRecords = await db.roles.findAll({
            where: { id_role: { [Op.in]: roles } }
        });

        await user.setRoles(roleRecords);

        // Obtener usuario con roles actualizados
        const usuarioActualizado = await usuario.findByPk(id_usuario, {
            include: [{
                model: db.roles,
                as: 'roles',
                attributes: ['id_role', 'nombre', 'is_admin'],
                through: { attributes: [] }
            }]
        });

        res.status(200).json({ 
            message: 'Roles asignados exitosamente', 
            data: usuarioActualizado 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtener roles de un usuario específico
 */
const getUserRoles = async (req, res) => {
    try {
        const { id_usuario } = req.params;

        const user = await usuario.findByPk(id_usuario, {
            attributes: ['id_usuario', 'nombre', 'email'],
            include: [{
                model: db.roles,
                as: 'roles',
                include: [{
                    model: db.permissions,
                    as: 'permissions',
                    through: { attributes: [] }
                }]
            }]
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Obtener permisos únicos
        const permissionsSet = new Set();
        user.roles.forEach(role => {
            if (role.permissions) {
                role.permissions.forEach(perm => {
                    permissionsSet.add(perm.slug);
                });
            }
        });

        res.status(200).json({ 
            user: {
                id: user.id_usuario,
                nombre: user.nombre,
                email: user.email
            },
            roles: user.roles.map(r => ({
                id: r.id_role,
                nombre: r.nombre,
                is_admin: r.is_admin,
                permissions: r.permissions.map(p => p.slug)
            })),
            allPermissions: Array.from(permissionsSet)
        });
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
    loginUsuario,
    assignRoles,
    getUserRoles
};
