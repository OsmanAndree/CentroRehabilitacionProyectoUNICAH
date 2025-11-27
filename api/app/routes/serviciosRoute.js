'use strict';

const express = require('express');
const serviciosController = require('../controllers/serviciosController');
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

const router = express.Router();

router
    .get('/getServicios', 
        isAuth, 
        checkPermission('servicios.view'),
        async (req, res) => await serviciosController.getServicios(req, res))
    .post('/insertServicio', 
        isAuth, 
        checkPermission('servicios.create'),
        async (req, res) => await serviciosController.insertServicio(req, res))
    .put('/updateServicio', 
        isAuth, 
        checkPermission('servicios.update'),
        async (req, res) => await serviciosController.updateServicio(req, res))
    .delete('/deleteServicio', 
        isAuth, 
        checkPermission('servicios.delete'),
        async (req, res) => await serviciosController.deleteServicio(req, res));

module.exports = router;
