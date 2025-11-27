'use strict';

const express = require('express');
const router = express.Router();
const cierresController = require('../controllers/cierresController');
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

router
    .get('/getDatosCierre', 
        isAuth, 
        checkPermission('cierres.view'),
        cierresController.getDatosCierre)
    .post('/crearCierre', 
        isAuth, 
        checkPermission('cierres.create'),
        cierresController.crearCierre)
    .get('/getCierres', 
        isAuth, 
        checkPermission('cierres.view'),
        cierresController.getCierres)
    .get('/getCierreById', 
        isAuth, 
        checkPermission('cierres.view'),
        cierresController.getCierreById)
    // Verificar si el día está cerrado (usado por otros módulos)
    .get('/verificarCierre', 
        isAuth, 
        cierresController.verificarCierreActivo)
    // Reabrir un cierre (desbloquear el día)
    .put('/reabrirCierre/:id_cierre', 
        isAuth, 
        checkPermission('cierres.reabrir'),
        cierresController.reabrirCierre)
    // Eliminar un cierre
    .delete('/eliminarCierre/:id_cierre', 
        isAuth, 
        checkPermission('cierres.delete'),
        cierresController.eliminarCierre);

module.exports = router;
