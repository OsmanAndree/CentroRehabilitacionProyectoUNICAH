'use strict'

const express = require("express");
const diagnosticoController = require("../controllers/diagnosticoController");
const apiRoutes = express.Router();

apiRoutes.get("/getDiagnosticos", async (req, res) => await diagnosticoController.getDiagnostico(req, res))
    .post("/insertDiagnosticos", async (req, res) => await diagnosticoController.insertDiagnostico(req, res))
    .put("/updateDiagnosticos", async (req, res) => await diagnosticoController.updateDiagnostico(req, res))
    .delete("/deleteDiagnosticos", async (req, res) => await diagnosticoController.deleteDiagnostico(req, res));

module.exports = apiRoutes;