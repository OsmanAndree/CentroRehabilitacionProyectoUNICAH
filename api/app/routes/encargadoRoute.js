'use strict'

const express= require("express");
const encargadoController=require("../controllers/encargadoController");
const apiRoutes= express.Router();

apiRoutes.get("/getencargados", async (req, res)=> await encargadoController.getencargados(req,res)).
post("/insertencargados", async (req, res)=> await encargadoController.insertencargados(req, res)).
put("/updateencargados", async (req, res)=> await encargadoController.updateencargados(req, res)).
delete("/deleteencargados", async (req, res)=> await encargadoController.deleteencargados(req, res));

module.exports=apiRoutes;