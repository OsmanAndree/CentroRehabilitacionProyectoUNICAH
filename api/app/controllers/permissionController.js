'use strict';

const db = require('../config/db');
const { Op } = db.Sequelize;

/**
 * Obtener todos los permisos con paginación
 */
const getPermissions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const search = req.query.search || '';
        const modulo = req.query.modulo || '';
        const offset = (page - 1) * limit;

        const where = {};
        
        if (search) {
            where[Op.or] = [
                { nombre: { [Op.like]: `%${search}%` } },
                { slug: { [Op.like]: `%${search}%` } }
            ];
        }
        
        if (modulo) {
            where.modulo = modulo;
        }

        const { count, rows } = await db.permissions.findAndCountAll({
            where,
            limit,
            offset,
            order: [['modulo', 'ASC'], ['slug', 'ASC']]
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
        res.status(500).send({ message: error.message || "Error obteniendo permisos" });
    }
};

/**
 * Obtener todos los permisos agrupados por módulo (para el UI de asignación)
 */
const getPermissionsGrouped = async (req, res) => {
    try {
        const permissions = await db.permissions.findAll({
            order: [['modulo', 'ASC'], ['slug', 'ASC']]
        });

        // Agrupar por módulo
        const grouped = permissions.reduce((acc, perm) => {
            const modulo = perm.modulo;
            if (!acc[modulo]) {
                acc[modulo] = {
                    modulo,
                    nombre: modulo.charAt(0).toUpperCase() + modulo.slice(1),
                    permissions: []
                };
            }
            acc[modulo].permissions.push(perm);
            return acc;
        }, {});

        res.status(200).send({ 
            result: Object.values(grouped)
        });
    } catch (error) {
        res.status(500).send({ message: error.message || "Error obteniendo permisos" });
    }
};

/**
 * Obtener todos los módulos disponibles
 */
const getModules = async (req, res) => {
    try {
        const modules = await db.permissions.findAll({
            attributes: [[db.Sequelize.fn('DISTINCT', db.Sequelize.col('modulo')), 'modulo']],
            order: [['modulo', 'ASC']]
        });

        res.status(200).send({ 
            result: modules.map(m => m.modulo)
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * Obtener un permiso por ID
 */
const getPermissionById = async (req, res) => {
    try {
        const { id } = req.params;

        const permission = await db.permissions.findByPk(id, {
            include: [{
                model: db.roles,
                as: 'roles',
                attributes: ['id_role', 'nombre'],
                through: { attributes: [] }
            }]
        });

        if (!permission) {
            return res.status(404).send({ message: 'Permiso no encontrado' });
        }

        res.status(200).send({ result: permission });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * Crear un permiso personalizado
 */
const insertPermission = async (req, res) => {
    try {
        const { nombre, slug, modulo, descripcion } = req.body;

        // Verificar si ya existe
        const existing = await db.permissions.findOne({ where: { slug } });
        if (existing) {
            return res.status(400).send({ message: 'Ya existe un permiso con ese slug' });
        }

        const newPermission = await db.permissions.create({
            nombre,
            slug,
            modulo,
            descripcion
        });

        res.status(201).send({
            message: 'Permiso creado exitosamente',
            result: newPermission
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * Actualizar un permiso
 */
const updatePermission = async (req, res) => {
    try {
        const { id_permission } = req.query;
        const { nombre, descripcion } = req.body;

        const permission = await db.permissions.findByPk(id_permission);
        if (!permission) {
            return res.status(404).send({ message: 'Permiso no encontrado' });
        }

        // Solo permitir actualizar nombre y descripción (slug y modulo son inmutables)
        await permission.update({
            nombre: nombre || permission.nombre,
            descripcion: descripcion !== undefined ? descripcion : permission.descripcion
        });

        res.status(200).send({
            message: 'Permiso actualizado exitosamente',
            result: permission
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * Eliminar un permiso
 */
const deletePermission = async (req, res) => {
    try {
        const { id_permission } = req.query;

        const permission = await db.permissions.findByPk(id_permission);
        if (!permission) {
            return res.status(404).send({ message: 'Permiso no encontrado' });
        }

        // Verificar si está asignado a algún rol
        const rolesWithPermission = await db.rolePermissions.count({ 
            where: { id_permission } 
        });
        
        if (rolesWithPermission > 0) {
            return res.status(400).send({ 
                message: `No se puede eliminar porque está asignado a ${rolesWithPermission} rol(es)` 
            });
        }

        await permission.destroy();

        res.status(200).send({ message: 'Permiso eliminado exitosamente' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

/**
 * Obtener los permisos del usuario actual
 */
const getMyPermissions = async (req, res) => {
    try {
        const userId = req.body.userId;

        const user = await db.usuarios.findByPk(userId, {
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
            return res.status(404).send({ message: 'Usuario no encontrado' });
        }

        // Verificar si es admin
        const isAdmin = user.roles.some(role => role.is_admin === true);

        // Obtener permisos únicos
        const permissionsSet = new Set();
        const permissionsList = [];

        user.roles.forEach(role => {
            if (role.permissions) {
                role.permissions.forEach(permission => {
                    if (!permissionsSet.has(permission.slug)) {
                        permissionsSet.add(permission.slug);
                        permissionsList.push({
                            slug: permission.slug,
                            nombre: permission.nombre,
                            modulo: permission.modulo
                        });
                    }
                });
            }
        });

        // Agrupar permisos por módulo
        const grouped = permissionsList.reduce((acc, perm) => {
            const modulo = perm.modulo;
            if (!acc[modulo]) {
                acc[modulo] = [];
            }
            acc[modulo].push(perm.slug.split('.')[1]); // Solo la acción
            return acc;
        }, {});

        res.status(200).send({
            user: {
                id: user.id_usuario,
                nombre: user.nombre,
                email: user.email
            },
            roles: user.roles.map(r => ({ id: r.id_role, nombre: r.nombre, is_admin: r.is_admin })),
            isAdmin,
            permissions: Array.from(permissionsSet),
            permissionsByModule: grouped
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

module.exports = {
    getPermissions,
    getPermissionsGrouped,
    getModules,
    getPermissionById,
    insertPermission,
    updatePermission,
    deletePermission,
    getMyPermissions
};

