'use strict'

const express = require("express");
const productoController = require("../controllers/productoController");
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

const apiRoutes = express.Router();

apiRoutes
    .get("/getProductos", 
        isAuth, 
        checkPermission('productos.view'),
        async (req, res) => await productoController.getProductos(req, res))
    .post("/insertProductos", 
        isAuth, 
        checkPermission('productos.create'),
        async (req, res) => await productoController.insertProductos(req, res))
    .put("/updateProductos", 
        isAuth, 
        checkPermission('productos.update'),
        async (req, res) => await productoController.updateProductos(req, res))
    .delete("/deleteProductos", 
        isAuth, 
        checkPermission('productos.delete'),
        async (req, res) => await productoController.deleteProductos(req, res))
    .put("/updateProductoStock", 
        isAuth, 
        checkPermission('productos.update'),
        async (req, res) => await productoController.updateProductoStock(req, res));

module.exports = apiRoutes;
