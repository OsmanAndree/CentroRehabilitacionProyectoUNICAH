'use strict';

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

// Rutas públicas
router.post('/login', usuarioController.loginUsuario);

// Rutas protegidas
router.get('/getusuarios', 
    isAuth, 
    checkPermission('usuarios.view'),
    usuarioController.getUsuarios
);

router.post('/insertusuarios', 
    isAuth, 
    checkPermission('usuarios.create'),
    usuarioController.insertUsuario
);

router.put('/updateusuarios', 
    isAuth, 
    checkPermission('usuarios.update'),
    usuarioController.updateUsuario
);

router.delete('/deleteusuarios', 
    isAuth, 
    checkPermission('usuarios.delete'),
    usuarioController.deleteUsuario
);

// Rutas de asignación de roles
router.post('/usuario/:id_usuario/roles', 
    isAuth, 
    checkPermission('usuarios.update'),
    usuarioController.assignRoles
);

router.get('/usuario/:id_usuario/roles', 
    isAuth, 
    checkPermission('usuarios.view'),
    usuarioController.getUserRoles
);

module.exports = router;