'use strict'

const express = require('express');
const cors = require('cors');
const App = express();

const pacienteRoutes = require("./routes/pacienteRoute.js");
const encargadoRoutes = require("./routes/encargadoRoute.js");
const bodegaRoutes = require("./routes/bodegaRoute.js");
const productoRoutes = require("./routes/productoRoute.js");
const terapeutaRoutes = require("./routes/terapeutaRoute.js");
const diagnosticoRoutes = require("./routes/diagnosticoRoute.js");
const citasRoutes = require("./routes/citaRoute.js");

App.use(
    cors({
        origin: "*", 
    })
);

App.use(cors());
App.use(express.json({ limit: '10mb' }));
App.use(express.urlencoded({ extended: false }));

App.use("/Api/pacientes", pacienteRoutes);
App.use("/Api/encargados", encargadoRoutes);	
App.use("/Api/bodega", bodegaRoutes);	
App.use("/Api/productos", productoRoutes);
App.use("/Api/terapeutas", terapeutaRoutes);
App.use("/Api/diagnostico", diagnosticoRoutes)
App.use("/Api/citas", citasRoutes);

module.exports = App;