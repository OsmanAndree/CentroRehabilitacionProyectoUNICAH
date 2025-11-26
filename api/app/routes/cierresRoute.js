'use strict';

const express = require('express');
const router = express.Router();
const cierresController = require('../controllers/cierresController');

router.get('/getDatosCierre', cierresController.getDatosCierre);
router.post('/crearCierre', cierresController.crearCierre);
router.get('/getCierres', cierresController.getCierres);
router.get('/getCierreById', cierresController.getCierreById);

module.exports = router;

