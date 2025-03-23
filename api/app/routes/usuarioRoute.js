'use strict';

const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.get('/getusuarios', usuarioController.getUsuarios);
router.post('/insertusuarios', usuarioController.insertUsuario);
router.put('/updateusuarios', usuarioController.updateUsuario);
router.delete('/deleteusuarios', usuarioController.deleteUsuario);
router.post('/login', usuarioController.loginUsuario);

module.exports = router;