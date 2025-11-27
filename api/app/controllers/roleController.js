'use strict';

const db = require('../config/db');
const { Op } = db.Sequelize;

/**
 * Obtener todos los roles con paginación
 */
const getRoles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        const where = {};
        if (search) {
            where[Op.or] = [
                { nombre: { [Op.like]: `%${search}%` } },
                { descripcion: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await db.roles.findAndCountAll({
            where,
            include: [{
                model: db.permissions,
                as: 'permissions',
                through: { attributes: [] }
            }],
            limit,
            offset,
            order: [['id_role', 'ASC']]
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
        res.status(500).send({ message: error.message || "Error obteniendo roles" });
    }
};

/**
 * Obtener todos los roles sin paginación (para selects)
 */
const getAllRoles = async (req, res) => {
    try {
        const roles = await db.roles.findAll({
            include: [{
                model: db.permissions,
                as: 'permissions',
                through: { attributes: [] }
            }],
            order: [['nombre', 'ASC']]
        });

        res.status(200).send({ result: roles });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error obteniendo roles" });
    }
};

/**
 * Obtener un rol por ID con sus permisos
 */
const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;

        const role = await db.roles.findByPk(id, {
            include: [{
                model: db.permissions,
                as: 'permissions',
                through: { attributes: [] }
            }]
        });

        if (!role) {
            return res.status(404).send({ message: 'Rol no encontrado' });
        }

        res.status(200).send({ result: role });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * Crear un nuevo rol
 */
const insertRole = async (req, res) => {
    try {
        const { nombre, descripcion, is_admin, permissions } = req.body;

        // Verificar si ya existe un rol con ese nombre
        const existingRole = await db.roles.findOne({ where: { nombre } });
        if (existingRole) {
            return res.status(400).send({ message: 'Ya existe un rol con ese nombre' });
        }

        // Crear el rol
        const newRole = await db.roles.create({
            nombre,
            descripcion,
            is_admin: is_admin || false
        });

        // Asignar permisos si se proporcionaron
        if (permissions && Array.isArray(permissions) && permissions.length > 0) {
            // permissions puede ser array de IDs o array de slugs
            const permissionRecords = await db.permissions.findAll({
                where: {
                    [Op.or]: [
                        { id_permission: { [Op.in]: permissions } },
                        { slug: { [Op.in]: permissions } }
                    ]
                }
            });

            await newRole.setPermissions(permissionRecords);
        }

        // Obtener el rol con sus permisos
        const roleWithPermissions = await db.roles.findByPk(newRole.id_role, {
            include: [{
                model: db.permissions,
                as: 'permissions',
                through: { attributes: [] }
            }]
        });

        res.status(201).send({
            message: 'Rol creado exitosamente',
            result: roleWithPermissions
        });
    } catch (error) {
        console.error('Error creando rol:', error);
        res.status(500).send({ message: error.message });
    }
};

/**
 * Actualizar un rol
 */
const updateRole = async (req, res) => {
    try {
        const { id_role } = req.query;
        const { nombre, descripcion, is_admin, permissions } = req.body;

        const role = await db.roles.findByPk(id_role);
        if (!role) {
            return res.status(404).send({ message: 'Rol no encontrado' });
        }

        // Verificar nombre duplicado (excepto el rol actual)
        if (nombre && nombre !== role.nombre) {
            const existingRole = await db.roles.findOne({ 
                where: { 
                    nombre,
                    id_role: { [Op.ne]: id_role }
                }
            });
            if (existingRole) {
                return res.status(400).send({ message: 'Ya existe un rol con ese nombre' });
            }
        }

        // Actualizar datos del rol
        await role.update({
            nombre: nombre || role.nombre,
            descripcion: descripcion !== undefined ? descripcion : role.descripcion,
            is_admin: is_admin !== undefined ? is_admin : role.is_admin,
            updated_at: new Date()
        });

        // Actualizar permisos si se proporcionaron
        if (permissions !== undefined && Array.isArray(permissions)) {
            const permissionRecords = await db.permissions.findAll({
                where: {
                    [Op.or]: [
                        { id_permission: { [Op.in]: permissions } },
                        { slug: { [Op.in]: permissions } }
                    ]
                }
            });

            await role.setPermissions(permissionRecords);
        }

        // Obtener el rol actualizado con sus permisos
        const updatedRole = await db.roles.findByPk(id_role, {
            include: [{
                model: db.permissions,
                as: 'permissions',
                through: { attributes: [] }
            }]
        });

        res.status(200).send({
            message: 'Rol actualizado exitosamente',
            result: updatedRole
        });
    } catch (error) {
        console.error('Error actualizando rol:', error);
        res.status(500).send({ message: error.message });
    }
};

/**
 * Eliminar un rol
 */
const deleteRole = async (req, res) => {
    try {
        const { id_role } = req.query;

        const role = await db.roles.findByPk(id_role);
        if (!role) {
            return res.status(404).send({ message: 'Rol no encontrado' });
        }

        // Verificar si hay usuarios con este rol
        const usersWithRole = await db.userRoles.count({ where: { id_role } });
        if (usersWithRole > 0) {
            return res.status(400).send({ 
                message: `No se puede eliminar el rol porque tiene ${usersWithRole} usuario(s) asignado(s)` 
            });
        }

        // Eliminar permisos asociados (tabla intermedia)
        await db.rolePermissions.destroy({ where: { id_role } });

        // Eliminar el rol
        await role.destroy();

        res.status(200).send({ message: 'Rol eliminado exitosamente' });
    } catch (error) {
        console.error('Error eliminando rol:', error);
        res.status(500).send({ message: error.message });
    }
};

/**
 * Asignar permisos a un rol
 */
const assignPermissions = async (req, res) => {
    try {
        const { id_role } = req.params;
        const { permissions } = req.body; // Array de IDs o slugs de permisos

        const role = await db.roles.findByPk(id_role);
        if (!role) {
            return res.status(404).send({ message: 'Rol no encontrado' });
        }

        if (!permissions || !Array.isArray(permissions)) {
            return res.status(400).send({ message: 'Se requiere un array de permisos' });
        }

        // Obtener los permisos
        const permissionRecords = await db.permissions.findAll({
            where: {
                [Op.or]: [
                    { id_permission: { [Op.in]: permissions } },
                    { slug: { [Op.in]: permissions } }
                ]
            }
        });

        // Reemplazar todos los permisos del rol
        await role.setPermissions(permissionRecords);

        // Obtener el rol actualizado
        const updatedRole = await db.roles.findByPk(id_role, {
            include: [{
                model: db.permissions,
                as: 'permissions',
                through: { attributes: [] }
            }]
        });

        res.status(200).send({
            message: 'Permisos asignados exitosamente',
            result: updatedRole
        });
    } catch (error) {
        console.error('Error asignando permisos:', error);
        res.status(500).send({ message: error.message });
    }
};

/**
 * Obtener usuarios de un rol específico
 */
const getRoleUsers = async (req, res) => {
    try {
        const { id_role } = req.params;

        const role = await db.roles.findByPk(id_role, {
            include: [{
                model: db.usuarios,
                as: 'usuarios',
                attributes: ['id_usuario', 'nombre', 'email', 'estado'],
                through: { attributes: [] }
            }]
        });

        if (!role) {
            return res.status(404).send({ message: 'Rol no encontrado' });
        }

        res.status(200).send({ result: role.usuarios });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

module.exports = {
    getRoles,
    getAllRoles,
    getRoleById,
    insertRole,
    updateRole,
    deleteRole,
    assignPermissions,
    getRoleUsers
};

