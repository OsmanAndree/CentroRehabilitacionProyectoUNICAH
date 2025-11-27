'use strict';

const express = require('express');
const citasController = require('../controllers/citaController');
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

const router = express.Router();

router
    .get('/getCitas', 
        isAuth, 
        checkPermission('citas.view'),
        async (req, res) => await citasController.getCitas(req, res))
    .get('/checkCapacity', 
        isAuth, 
        checkPermission('citas.view'),
        async (req, res) => await citasController.checkCapacity(req, res))
    .post('/insertCita', 
        isAuth, 
        checkPermission('citas.create'),
        async (req, res) => await citasController.insertCitas(req, res))
    .post('/insertCitasMultiple', 
        isAuth, 
        checkPermission('citas.create'),
        async (req, res) => await citasController.insertCitasMultiple(req, res))
    .put('/updateCita', 
        isAuth, 
        checkPermission('citas.update'),
        async (req, res) => await citasController.updateCitas(req, res))
    .delete('/deleteCita', 
        isAuth, 
        checkPermission('citas.delete'),
        async (req, res) => await citasController.deleteCitas(req, res));

module.exports = router;
