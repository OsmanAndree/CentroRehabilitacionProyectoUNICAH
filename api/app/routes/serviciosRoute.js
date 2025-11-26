'use strict';

const express = require('express');
const serviciosController = require('../controllers/serviciosController');
const router = express.Router();

router.get('/getServicios', async (req, res) => await serviciosController.getServicios(req, res))
      .post('/insertServicio', async (req, res) => await serviciosController.insertServicio(req, res))
      .put('/updateServicio', async (req, res) => await serviciosController.updateServicio(req, res))
      .delete('/deleteServicio', async (req, res) => await serviciosController.deleteServicio(req, res));

module.exports = router;

