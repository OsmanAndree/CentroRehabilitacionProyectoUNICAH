'use strict';

const express = require('express');
const router = express.Router();
const terapeutaController = require('../controllers/terapeutasController');
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

router
    .get('/getTerapeutas', 
        isAuth, 
        checkPermission('terapeutas.view'),
        terapeutaController.getTerapeutas)
    .post('/insertTerapeutas', 
        isAuth, 
        checkPermission('terapeutas.create'),
        terapeutaController.insertTerapeutas)
    .put('/updateTerapeutas', 
        isAuth, 
        checkPermission('terapeutas.update'),
        terapeutaController.updateTerapeutas)
    .delete('/deleteTerapeutas', 
        isAuth, 
        checkPermission('terapeutas.delete'),
        terapeutaController.deleteTerapeutas);

module.exports = router;
