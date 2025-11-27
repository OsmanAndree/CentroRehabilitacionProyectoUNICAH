'use strict'

const express = require("express");
const diagnosticoController = require("../controllers/diagnosticoController");
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

const apiRoutes = express.Router();

apiRoutes
    .get("/getDiagnosticos", 
        isAuth, 
        checkPermission('diagnosticos.view'),
        async (req, res) => await diagnosticoController.getDiagnostico(req, res))
    .post("/insertDiagnosticos", 
        isAuth, 
        checkPermission('diagnosticos.create'),
        async (req, res) => await diagnosticoController.insertDiagnostico(req, res))
    .put("/updateDiagnosticos", 
        isAuth, 
        checkPermission('diagnosticos.update'),
        async (req, res) => await diagnosticoController.updateDiagnostico(req, res))
    .delete("/deleteDiagnosticos", 
        isAuth, 
        checkPermission('diagnosticos.delete'),
        async (req, res) => await diagnosticoController.deleteDiagnostico(req, res))
    .put("/updateAlta", 
        isAuth, 
        checkPermission('diagnosticos.update'),
        async (req, res) => await diagnosticoController.udpadteAlta(req, res));

module.exports = apiRoutes;
