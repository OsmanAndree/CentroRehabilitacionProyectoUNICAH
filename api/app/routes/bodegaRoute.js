'use strict'

const express = require("express");
const bodegaController = require("../controllers/bodegaController");
const apiRoutes = express.Router();

apiRoutes.get("/GetBodegas", async (req, res) => await bodegaController.getBodegas(req, res))
    .post("/InsertBodega", async (req, res) => await bodegaController.insertBodega(req, res))
    .put("/UpdateBodega", async (req, res) => await bodegaController.updateBodega(req, res))
    .delete("/DeleteBodega", async (req, res) => await bodegaController.deleteBodega(req, res));

module.exports = apiRoutes;