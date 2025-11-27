'use strict';

const express = require('express');
const roleController = require('../controllers/roleController');
const { isAuth } = require('../middlewares/auth');
const { checkPermission, isAdmin } = require('../middlewares/checkPermission');

const apiRoutes = express.Router();

// Rutas de roles
// GET /roles - Listar roles con paginación
apiRoutes.get('/getroles', 
    isAuth, 
    checkPermission('roles.view'),
    async (req, res) => await roleController.getRoles(req, res)
);

// GET /roles/all - Listar todos los roles sin paginación (para selects)
apiRoutes.get('/getallroles', 
    isAuth,
    async (req, res) => await roleController.getAllRoles(req, res)
);

// GET /roles/:id - Obtener un rol por ID
apiRoutes.get('/getrole/:id', 
    isAuth, 
    checkPermission('roles.view'),
    async (req, res) => await roleController.getRoleById(req, res)
);

// POST /roles - Crear un nuevo rol
apiRoutes.post('/insertrole', 
    isAuth, 
    checkPermission('roles.create'),
    async (req, res) => await roleController.insertRole(req, res)
);

// PUT /roles - Actualizar un rol
apiRoutes.put('/updaterole', 
    isAuth, 
    checkPermission('roles.update'),
    async (req, res) => await roleController.updateRole(req, res)
);

// DELETE /roles - Eliminar un rol
apiRoutes.delete('/deleterole', 
    isAuth, 
    checkPermission('roles.delete'),
    async (req, res) => await roleController.deleteRole(req, res)
);

// POST /roles/:id_role/permissions - Asignar permisos a un rol
apiRoutes.post('/role/:id_role/permissions', 
    isAuth, 
    checkPermission('roles.update'),
    async (req, res) => await roleController.assignPermissions(req, res)
);

// GET /roles/:id_role/users - Obtener usuarios de un rol
apiRoutes.get('/role/:id_role/users', 
    isAuth, 
    checkPermission('roles.view'),
    async (req, res) => await roleController.getRoleUsers(req, res)
);

module.exports = apiRoutes;

