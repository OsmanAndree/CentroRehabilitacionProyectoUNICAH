'use strict';

const express = require('express');
const permissionController = require('../controllers/permissionController');
const { isAuth } = require('../middlewares/auth');
const { checkPermission, isAdmin } = require('../middlewares/checkPermission');

const apiRoutes = express.Router();

// GET /permissions - Listar permisos con paginación
apiRoutes.get('/getpermissions', 
    isAuth, 
    checkPermission('roles.view'),
    async (req, res) => await permissionController.getPermissions(req, res)
);

// GET /permissions/grouped - Listar permisos agrupados por módulo
apiRoutes.get('/getpermissionsgrouped', 
    isAuth, 
    checkPermission('roles.view'),
    async (req, res) => await permissionController.getPermissionsGrouped(req, res)
);

// GET /permissions/modules - Listar módulos disponibles
apiRoutes.get('/getmodules', 
    isAuth,
    async (req, res) => await permissionController.getModules(req, res)
);

// GET /permissions/my - Obtener permisos del usuario actual
apiRoutes.get('/mypermissions', 
    isAuth,
    async (req, res) => await permissionController.getMyPermissions(req, res)
);

// GET /permissions/:id - Obtener un permiso por ID
apiRoutes.get('/getpermission/:id', 
    isAuth, 
    checkPermission('roles.view'),
    async (req, res) => await permissionController.getPermissionById(req, res)
);

// POST /permissions - Crear un permiso personalizado (solo admin)
apiRoutes.post('/insertpermission', 
    isAuth, 
    isAdmin(),
    async (req, res) => await permissionController.insertPermission(req, res)
);

// PUT /permissions - Actualizar un permiso
apiRoutes.put('/updatepermission', 
    isAuth, 
    isAdmin(),
    async (req, res) => await permissionController.updatePermission(req, res)
);

// DELETE /permissions - Eliminar un permiso
apiRoutes.delete('/deletepermission', 
    isAuth, 
    isAdmin(),
    async (req, res) => await permissionController.deletePermission(req, res)
);

module.exports = apiRoutes;

