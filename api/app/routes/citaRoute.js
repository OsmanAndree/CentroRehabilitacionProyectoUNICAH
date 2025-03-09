'use strict';

const express = require('express');
const citasController = require('../controllers/citaController');
const router = express.Router();

router.get('/getCitas', async (req, res) => await citasController.getCitas(req, res))
      .post('/insertCita', async (req, res) => await citasController.insertCitas(req, res))
      .put('/updateCita', async (req, res) => await citasController.updateCitas(req, res))
      .delete('/deleteCita', async (req, res) => await citasController.deleteCitas(req, res));

module.exports = router;