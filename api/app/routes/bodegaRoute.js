'use strict'

const express = require("express");
const bodegaController = require("../controllers/bodegaController");
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

const apiRoutes = express.Router();

apiRoutes
    .get("/GetBodegas", 
        isAuth, 
        checkPermission('bodega.view'),
        async (req, res) => await bodegaController.getBodegas(req, res))
    .post("/InsertBodega", 
        isAuth, 
        checkPermission('bodega.create'),
        async (req, res) => await bodegaController.insertBodega(req, res))
    .put("/UpdateBodega", 
        isAuth, 
        checkPermission('bodega.update'),
        async (req, res) => await bodegaController.updateBodega(req, res))
    .delete("/DeleteBodega", 
        isAuth, 
        checkPermission('bodega.delete'),
        async (req, res) => await bodegaController.deleteBodega(req, res));

module.exports = apiRoutes;
