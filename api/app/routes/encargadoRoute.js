'use strict'

const express = require("express");
const encargadoController = require("../controllers/encargadoController");
const { isAuth } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/checkPermission');

const apiRoutes = express.Router();

apiRoutes
    .get("/getencargados", 
        isAuth, 
        checkPermission('encargados.view'),
        async (req, res) => await encargadoController.getencargados(req, res))
    .post("/insertencargados", 
        isAuth, 
        checkPermission('encargados.create'),
        async (req, res) => await encargadoController.insertencargados(req, res))
    .put("/updateencargados", 
        isAuth, 
        checkPermission('encargados.update'),
        async (req, res) => await encargadoController.updateencargados(req, res))
    .delete("/deleteencargados", 
        isAuth, 
        checkPermission('encargados.delete'),
        async (req, res) => await encargadoController.deleteencargados(req, res));

module.exports = apiRoutes;
