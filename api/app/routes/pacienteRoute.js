'use strict'

const express = require("express");
const pacienteController = require("../controllers/pacienteController");
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

const apiRoutes = express.Router();

apiRoutes
    .get("/getpacientes", 
        isAuth, 
        checkPermission('pacientes.view'),
        async (req, res) => await pacienteController.getpacientes(req, res))
    .post("/insertpacientes", 
        isAuth, 
        checkPermission('pacientes.create'),
        async (req, res) => await pacienteController.insertpacientes(req, res))
    .put("/updatepacientes", 
        isAuth, 
        checkPermission('pacientes.update'),
        async (req, res) => await pacienteController.updatepacientes(req, res))
    .delete("/deletepacientes", 
        isAuth, 
        checkPermission('pacientes.delete'),
        async (req, res) => await pacienteController.deletepacientes(req, res))
    .put("/darAlta", 
        isAuth, 
        checkPermission('pacientes.update'),
        async (req, res) => await pacienteController.darAltaPaciente(req, res));

module.exports = apiRoutes;
