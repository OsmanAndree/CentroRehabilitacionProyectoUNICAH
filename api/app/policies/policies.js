'use strict'

/**
 * Sistema de Políticas de Permisos
 * Define qué acciones puede realizar cada rol
 */

// Mapeo de roles: 'Administrador' = 1, 'Terapeuta' = 0, 'Encargado' = 2
const ROLES = {
    ADMINISTRADOR: 'Administrador',  // idRol: 1
    TERAPEUTA: 'Terapeuta',           // idRol: 0
    ENCARGADO: 'Encargado'            // idRol: 2 (si existe)
};

// Definición de permisos por recurso y acción
const PERMISSIONS = {
    // Pacientes
    pacientes: {
        view: [ROLES.ADMINISTRADOR, ROLES.TERAPEUTA, ROLES.ENCARGADO],
        create: [ROLES.ADMINISTRADOR, ROLES.TERAPEUTA],
        update: [ROLES.ADMINISTRADOR, ROLES.TERAPEUTA],
        delete: [ROLES.ADMINISTRADOR]
    },
    
    // Terapeutas
    terapeutas: {
        view: [ROLES.ADMINISTRADOR, ROLES.TERAPEUTA],
        create: [ROLES.ADMINISTRADOR],
        update: [ROLES.ADMINISTRADOR],
        delete: [ROLES.ADMINISTRADOR]
    },
    
    // Citas
    citas: {
        view: [ROLES.ADMINISTRADOR, ROLES.TERAPEUTA, ROLES.ENCARGADO],
        create: [ROLES.ADMINISTRADOR, ROLES.TERAPEUTA],
        update: [ROLES.ADMINISTRADOR, ROLES.TERAPEUTA],
        delete: [ROLES.ADMINISTRADOR]
    },
    
    // Encargados
    encargados: {
        view: [ROLES.ADMINISTRADOR, ROLES.TERAPEUTA, ROLES.ENCARGADO],
        create: [ROLES.ADMINISTRADOR, ROLES.TERAPEUTA],
        update: [ROLES.ADMINISTRADOR, ROLES.TERAPEUTA],
        delete: [ROLES.ADMINISTRADOR]
    },
    
    // Diagnósticos
    diagnosticos: {
        view: [ROLES.ADMINISTRADOR, ROLES.TERAPEUTA],
        create: [ROLES.ADMINISTRADOR, ROLES.TERAPEUTA],
        update: [ROLES.ADMINISTRADOR, ROLES.TERAPEUTA],
        delete: [ROLES.ADMINISTRADOR]
    },
    
    // Productos (solo Administrador)
    productos: {
        view: [ROLES.ADMINISTRADOR],
        create: [ROLES.ADMINISTRADOR],
        update: [ROLES.ADMINISTRADOR],
        delete: [ROLES.ADMINISTRADOR]
    },
    
    // Compras (solo Administrador)
    compras: {
        view: [ROLES.ADMINISTRADOR],
        create: [ROLES.ADMINISTRADOR],
        update: [ROLES.ADMINISTRADOR],
        delete: [ROLES.ADMINISTRADOR]
    },
    
    // Bodega (solo Administrador)
    bodega: {
        view: [ROLES.ADMINISTRADOR],
        create: [ROLES.ADMINISTRADOR],
        update: [ROLES.ADMINISTRADOR],
        delete: [ROLES.ADMINISTRADOR]
    },
    
    // Préstamos (solo Administrador)
    prestamos: {
        view: [ROLES.ADMINISTRADOR],
        create: [ROLES.ADMINISTRADOR],
        update: [ROLES.ADMINISTRADOR],
        delete: [ROLES.ADMINISTRADOR]
    },
    
    // Usuarios (solo Administrador)
    usuarios: {
        view: [ROLES.ADMINISTRADOR],
        create: [ROLES.ADMINISTRADOR],
        update: [ROLES.ADMINISTRADOR],
        delete: [ROLES.ADMINISTRADOR]
    }
};

/**
 * Verifica si un rol tiene permiso para realizar una acción en un recurso
 * @param {string} resource - Nombre del recurso (ej: 'pacientes', 'productos')
 * @param {string} action - Acción a realizar ('view', 'create', 'update', 'delete')
 * @param {string} userRole - Rol del usuario
 * @returns {boolean} - true si tiene permiso, false si no
 */
function hasPermission(resource, action, userRole) {
    if (!PERMISSIONS[resource] || !PERMISSIONS[resource][action]) {
        return false;
    }
    
    return PERMISSIONS[resource][action].includes(userRole);
}

/**
 * Obtiene todos los permisos de un rol
 * @param {string} userRole - Rol del usuario
 * @returns {object} - Objeto con todos los permisos del rol
 */
function getRolePermissions(userRole) {
    const permissions = {};
    
    Object.keys(PERMISSIONS).forEach(resource => {
        permissions[resource] = {};
        Object.keys(PERMISSIONS[resource]).forEach(action => {
            permissions[resource][action] = hasPermission(resource, action, userRole);
        });
    });
    
    return permissions;
}

module.exports = {
    ROLES,
    PERMISSIONS,
    hasPermission,
    getRolePermissions
};

