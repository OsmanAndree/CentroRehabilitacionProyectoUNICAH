'use strict';

const express = require('express');
const recibosController = require('../controllers/recibosController');
const router = express.Router();

router.get('/getRecibos', async (req, res) => await recibosController.getRecibos(req, res))
      .get('/getReciboById', async (req, res) => await recibosController.getReciboById(req, res))
      .post('/crearRecibo', async (req, res) => await recibosController.crearRecibo(req, res))
      .put('/anularRecibo', async (req, res) => await recibosController.anularRecibo(req, res));

module.exports = router;

