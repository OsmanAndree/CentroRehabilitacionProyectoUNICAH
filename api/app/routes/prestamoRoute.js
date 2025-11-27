'use strict'

const express = require("express");
const prestamoController = require("../controllers/prestamoController");
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

const apiRoutes = express.Router();

apiRoutes
    .get("/getPrestamos", 
        isAuth, 
        checkPermission('prestamos.view'),
        async (req, res) => await prestamoController.getPrestamo(req, res))
    .post("/insertPrestamos", 
        isAuth, 
        checkPermission('prestamos.create'),
        async (req, res) => await prestamoController.insertPrestamo(req, res))
    .put("/updatePrestamos", 
        isAuth, 
        checkPermission('prestamos.update'),
        async (req, res) => await prestamoController.updatePrestamo(req, res))
    .delete("/deletePrestamos", 
        isAuth, 
        checkPermission('prestamos.delete'),
        async (req, res) => await prestamoController.deletePrestamo(req, res));

module.exports = apiRoutes;
