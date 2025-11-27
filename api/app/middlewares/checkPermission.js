'use strict';

/**
 * Middleware de Verificación de Permisos
 * ======================================
 * Sistema dinámico de permisos similar a Spatie (Laravel)
 * 
 * Características:
 * - Gate de Admin: Si el usuario tiene un rol con is_admin=true, permite todo
 * - Verificación dinámica: Los permisos se verifican contra la base de datos
 * - Cache de permisos: Los permisos se cachean en req.userPermissions
 */

const db = require('../config/db');

/**
 * Obtiene todos los permisos de un usuario incluyendo si tiene gate de admin
 * @param {number} userId - ID del usuario
 * @returns {Object} - { isAdmin: boolean, permissions: string[] }
 */
async function getUserPermissions(userId) {
    try {
        const user = await db.usuarios.findByPk(userId, {
            include: [{
                model: db.roles,
                as: 'roles',
                include: [{
                    model: db.permissions,
                    as: 'permissions'
                }]
            }]
        });

        if (!user) {
            return { isAdmin: false, permissions: [], roles: [] };
        }

        // Verificar si tiene algún rol con gate de admin
        const isAdmin = user.roles.some(role => role.is_admin === true);

        // Obtener todos los slugs de permisos únicos
        const permissionsSet = new Set();
        const roleNames = [];

        user.roles.forEach(role => {
            roleNames.push(role.nombre);
            if (role.permissions) {
                role.permissions.forEach(permission => {
                    permissionsSet.add(permission.slug);
                });
            }
        });

        return {
            isAdmin,
            permissions: Array.from(permissionsSet),
            roles: roleNames,
            user: {
                id: user.id_usuario,
                nombre: user.nombre,
                email: user.email
            }
        };
    } catch (error) {
        console.error('Error obteniendo permisos del usuario:', error);
        return { isAdmin: false, permissions: [], roles: [] };
    }
}

/**
 * Middleware para cargar permisos del usuario en la request
 * Debe usarse después del middleware de autenticación
 */
function loadUserPermissions() {
    return async (req, res, next) => {
        try {
            const userId = req.body.userId;
            
            if (!userId) {
                return res.status(401).send({ message: 'Usuario no autenticado' });
            }

            // Cargar permisos y guardar en request
            const userPermissions = await getUserPermissions(userId);
            req.userPermissions = userPermissions;
            req.isAdmin = userPermissions.isAdmin;
            
            next();
        } catch (error) {
            return res.status(500).send({ message: 'Error cargando permisos', error: error.message });
        }
    };
}

/**
 * Middleware principal para verificar permisos
 * @param {string} requiredPermission - Slug del permiso requerido (ej: 'pacientes.create')
 * @returns {Function} - Middleware de Express
 * 
 * Uso:
 *   router.post('/ruta', auth, checkPermission('pacientes.create'), controller.method)
 */
function checkPermission(requiredPermission) {
    return async (req, res, next) => {
        try {
            const userId = req.body.userId;

            if (!userId) {
                return res.status(401).send({ message: 'Usuario no autenticado' });
            }

            // Si ya cargamos los permisos, usarlos
            let userPermissions = req.userPermissions;
            
            if (!userPermissions) {
                userPermissions = await getUserPermissions(userId);
                req.userPermissions = userPermissions;
                req.isAdmin = userPermissions.isAdmin;
            }

            // 🔓 GATE DE ADMIN: Si es admin, permite todo
            if (userPermissions.isAdmin) {
                return next();
            }

            // Verificar si tiene el permiso específico
            if (userPermissions.permissions.includes(requiredPermission)) {
                return next();
            }

            // No tiene el permiso
            return res.status(403).send({ 
                message: 'No tienes permiso para realizar esta acción',
                required: requiredPermission,
                userRoles: userPermissions.roles
            });

        } catch (error) {
            console.error('Error en checkPermission:', error);
            return res.status(500).send({ message: 'Error verificando permisos', error: error.message });
        }
    };
}

/**
 * Middleware para verificar múltiples permisos (OR - cualquiera de ellos)
 * @param {string[]} permissions - Array de slugs de permisos
 * @returns {Function} - Middleware de Express
 */
function checkAnyPermission(permissions) {
    return async (req, res, next) => {
        try {
            const userId = req.body.userId;

            if (!userId) {
                return res.status(401).send({ message: 'Usuario no autenticado' });
            }

            let userPermissions = req.userPermissions;
            
            if (!userPermissions) {
                userPermissions = await getUserPermissions(userId);
                req.userPermissions = userPermissions;
                req.isAdmin = userPermissions.isAdmin;
            }

            // Gate de Admin
            if (userPermissions.isAdmin) {
                return next();
            }

            // Verificar si tiene al menos uno de los permisos
            const hasAny = permissions.some(perm => 
                userPermissions.permissions.includes(perm)
            );

            if (hasAny) {
                return next();
            }

            return res.status(403).send({ 
                message: 'No tienes ninguno de los permisos requeridos',
                required: permissions,
                userRoles: userPermissions.roles
            });

        } catch (error) {
            return res.status(500).send({ message: 'Error verificando permisos', error: error.message });
        }
    };
}

/**
 * Middleware para verificar múltiples permisos (AND - todos requeridos)
 * @param {string[]} permissions - Array de slugs de permisos
 * @returns {Function} - Middleware de Express
 */
function checkAllPermissions(permissions) {
    return async (req, res, next) => {
        try {
            const userId = req.body.userId;

            if (!userId) {
                return res.status(401).send({ message: 'Usuario no autenticado' });
            }

            let userPermissions = req.userPermissions;
            
            if (!userPermissions) {
                userPermissions = await getUserPermissions(userId);
                req.userPermissions = userPermissions;
                req.isAdmin = userPermissions.isAdmin;
            }

            // Gate de Admin
            if (userPermissions.isAdmin) {
                return next();
            }

            // Verificar si tiene todos los permisos
            const hasAll = permissions.every(perm => 
                userPermissions.permissions.includes(perm)
            );

            if (hasAll) {
                return next();
            }

            const missing = permissions.filter(perm => 
                !userPermissions.permissions.includes(perm)
            );

            return res.status(403).send({ 
                message: 'Te faltan permisos para esta acción',
                missing,
                userRoles: userPermissions.roles
            });

        } catch (error) {
            return res.status(500).send({ message: 'Error verificando permisos', error: error.message });
        }
    };
}

/**
 * Middleware para verificar si es administrador (gate)
 */
function isAdmin() {
    return async (req, res, next) => {
        try {
            const userId = req.body.userId;

            if (!userId) {
                return res.status(401).send({ message: 'Usuario no autenticado' });
            }

            let userPermissions = req.userPermissions;
            
            if (!userPermissions) {
                userPermissions = await getUserPermissions(userId);
                req.userPermissions = userPermissions;
                req.isAdmin = userPermissions.isAdmin;
            }

            if (userPermissions.isAdmin) {
                return next();
            }

            return res.status(403).send({ 
                message: 'Esta acción requiere permisos de administrador'
            });

        } catch (error) {
            return res.status(500).send({ message: 'Error verificando permisos', error: error.message });
        }
    };
}

module.exports = {
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    isAdmin,
    loadUserPermissions,
    getUserPermissions
};

