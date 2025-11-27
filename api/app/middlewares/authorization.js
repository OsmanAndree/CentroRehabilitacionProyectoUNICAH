'use strict'

const { hasPermission } = require('../policies/policies');

/**
 * Middleware de autorización basado en políticas
 * Verifica si el usuario tiene permiso para realizar una acción en un recurso
 * 
 * @param {string} resource - Nombre del recurso (ej: 'pacientes', 'productos')
 * @param {string} action - Acción a realizar ('view', 'create', 'update', 'delete')
 * @returns {Function} - Middleware de Express
 */
function authorize(resource, action) {
    return (req, res, next) => {
        // Verificar que el usuario esté autenticado (debe pasar por isAuth primero)
        if (!req.user || !req.user.rol) {
            return res.status(403).send({ 
                message: 'Usuario no autenticado o sin rol asignado' 
            });
        }

        // Verificar permiso
        if (!hasPermission(resource, action, req.user.rol)) {
            return res.status(403).send({ 
                message: `No tienes permiso para ${action} en ${resource}` 
            });
        }

        next();
    };
}

/**
 * Middleware para verificar múltiples permisos (OR lógico)
 * El usuario necesita tener al menos uno de los permisos especificados
 * 
 * @param {Array} permissions - Array de objetos {resource, action}
 * @returns {Function} - Middleware de Express
 */
function authorizeAny(permissions) {
    return (req, res, next) => {
        if (!req.user || !req.user.rol) {
            return res.status(403).send({ 
                message: 'Usuario no autenticado o sin rol asignado' 
            });
        }

        const hasAnyPermission = permissions.some(({ resource, action }) => 
            hasPermission(resource, action, req.user.rol)
        );

        if (!hasAnyPermission) {
            return res.status(403).send({ 
                message: 'No tienes los permisos necesarios para esta acción' 
            });
        }

        next();
    };
}

module.exports = {
    authorize,
    authorizeAny
};

