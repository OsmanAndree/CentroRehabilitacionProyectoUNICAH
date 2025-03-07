'use strict';

const express = require('express');
const router = express.Router();
const terapeutaController = require('../controllers/terapeutasController');

router.get('/getTerapeutas', terapeutaController.getTerapeutas);
router.post('/insertTerapeutas', terapeutaController.insertTerapeutas);
router.put('/updateTerapeutas', terapeutaController.updateTerapeutas);
router.delete('/deleteTerapeutas', terapeutaController.deleteTerapeutas);

module.exports = router;