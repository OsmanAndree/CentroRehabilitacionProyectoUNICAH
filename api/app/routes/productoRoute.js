'use strict'

const express= require("express");
const productoController=require("../controllers/productoController");
const apiRoutes= express.Router();

apiRoutes.get("/getProductos", async (req, res)=> await productoController.getProductos(req,res)).
post("/insertProductos", async (req, res)=> await productoController.insertProductos(req, res)).
put("/updateProductos", async (req, res)=> await productoController.updateProductos(req, res)).
delete("/deleteProductos", async (req, res)=> await productoController.deleteProductos(req, res))
.put("/updateProductoStock", async (req, res)=> await productoController.updateProductoStock(req, res))

module.exports=apiRoutes;