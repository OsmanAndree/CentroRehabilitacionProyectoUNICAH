'use strict';

const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');

router.get('/getCompras', async (req, res) => await compraController.getCompras(req, res));
router.post('/createCompra', async (req, res) => await compraController.createCompra(req, res));
router.put('/updateCompra', async (req, res) => await compraController.updateCompra(req, res));
router.delete('/deleteCompra', async (req, res) => await compraController.deleteCompra(req, res));

module.exports = router;