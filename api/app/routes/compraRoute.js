'use strict';

const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

router
    .get('/getCompras', 
        isAuth, 
        checkPermission('compras.view'),
        async (req, res) => await compraController.getCompras(req, res))
    .post('/createCompra', 
        isAuth, 
        checkPermission('compras.create'),
        async (req, res) => await compraController.createCompra(req, res))
    .put('/updateCompra', 
        isAuth, 
        checkPermission('compras.update'),
        async (req, res) => await compraController.updateCompra(req, res))
    .delete('/deleteCompra', 
        isAuth, 
        checkPermission('compras.delete'),
        async (req, res) => await compraController.deleteCompra(req, res));

module.exports = router;
