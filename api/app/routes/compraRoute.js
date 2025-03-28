'use strict';

const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');

router.get('/getCompras', async (req, res) => await compraController.getCompras(req, res))
      .post('/createCompra', async (req, res) => await compraController.createCompra(req, res))
      .put('/updateCompra/:id_compra', async (req, res) => await compraController.updateCompra(req, res))
      .delete('/deleteCompra/:id_compra', async (req, res) => await compraController.deleteCompra(req, res));

module.exports = router;