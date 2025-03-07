'use strict'

const express= require("express");
const pacienteController=require("../controllers/pacienteController");
const apiRoutes= express.Router();

apiRoutes.get("/getpacientes", async (req, res)=> await pacienteController.getpacientes(req,res)).
post("/insertpacientes", async (req, res)=> await pacienteController.insertpacientes(req, res)).
put("/updatepacientes", async (req, res)=> await pacienteController.updatepacientes(req, res)).
delete("/deletepacientes", async (req, res)=> await pacienteController.deletepacientes(req, res));

module.exports=apiRoutes;