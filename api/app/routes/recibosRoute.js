'use strict';

const express = require('express');
const recibosController = require('../controllers/recibosController');
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

const router = express.Router();

router
    .get('/getRecibos', 
        isAuth, 
        checkPermission('recibos.view'),
        async (req, res) => await recibosController.getRecibos(req, res))
    .get('/getReciboById', 
        isAuth, 
        checkPermission('recibos.view'),
        async (req, res) => await recibosController.getReciboById(req, res))
    .post('/crearRecibo', 
        isAuth, 
        checkPermission('recibos.create'),
        async (req, res) => await recibosController.crearRecibo(req, res))
    .put('/anularRecibo', 
        isAuth, 
        checkPermission('recibos.update'), // Anular es una actualización del estado
        async (req, res) => await recibosController.anularRecibo(req, res));

module.exports = router;
