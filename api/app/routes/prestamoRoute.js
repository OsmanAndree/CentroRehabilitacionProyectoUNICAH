'use strict'

const express = require("express");
const prestamoController = require("../controllers/prestamoController");
const apiRoutes = express.Router();

apiRoutes.get("/getPrestamos", async (req, res) => await prestamoController.getPrestamo(req, res))
    .post("/insertPrestamos", async (req, res) => await prestamoController.insertPrestamo(req, res))
    .put("/updatePrestamos", async (req, res) => await prestamoController.updatePrestamo(req, res))
    .delete("/deletePrestamos", async (req, res) => await prestamoController.deletePrestamo(req, res));

module.exports = apiRoutes;