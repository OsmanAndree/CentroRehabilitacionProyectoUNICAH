'use strict'

const Sequelize = require('sequelize');
require('dotenv').config();

const sequelizeInstance = new Sequelize(
    process.env.DB, process.env.USER, process.env.PASSWORD, {
        host: process.env.HOST,
        dialect: process.env.DIALECT,
        port: process.env.MY_SQL_PORT,
        dialectOption: {
            ConnectionTimeOut: 100000
        },
        pool: {
            max: parseInt(process.env.POOL_MAX),
            min: parseInt(process.env.POOL_MIN),
            acquire: parseInt(process.env.POOL_ACQUIRE),
            idle: parseInt(process.env.POOL_IDLE),
        }
    }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelizeInstance = sequelizeInstance;

db.paciente = require('../models/pacienteModel')(sequelizeInstance, Sequelize);
db.encargado = require('../models/encargadosModel')(sequelizeInstance, Sequelize);
db.bodegas = require('../models/bodegaModel')(sequelizeInstance, Sequelize);
db.productos = require('../models/productoModel')(sequelizeInstance, Sequelize);
db.terapeuta = require('../models/terapeutasModel')(sequelizeInstance, Sequelize);
db.diagnostico = require('../models/diagnosticoModel')(sequelizeInstance, Sequelize);
db.citas = require('../models/citasModel')(sequelizeInstance, Sequelize);
db.usuarios = require('../models/usuarioModel')(sequelizeInstance, Sequelize);
db.prestamos = require('../models/prestamoModel')(sequelizeInstance, Sequelize);
db.compras = require('../models/comprasModel')(sequelizeInstance, Sequelize);
db.detallecompras = require('../models/detallecomprasModel')(sequelizeInstance, Sequelize);


db.paciente.belongsTo(db.encargado, { foreignKey: 'id_encargado' });
db.encargado.hasMany(db.paciente, { foreignKey: 'id_encargado' });

db.bodegas.belongsTo(db.productos, { foreignKey: 'id_producto', as: 'producto' });
db.productos.hasMany(db.bodegas, { foreignKey: 'id_producto' });

db.diagnostico.belongsTo(db.paciente, { foreignKey: 'id_paciente' });
db.paciente.hasMany(db.diagnostico, { foreignKey: 'id_paciente' });

db.diagnostico.belongsTo(db.terapeuta, { foreignKey: 'id_terapeuta' });
db.terapeuta.hasMany(db.diagnostico, { foreignKey: 'id_terapeuta' });

db.citas.belongsTo(db.paciente, { foreignKey: 'id_paciente' });
db.paciente.hasMany(db.citas, { foreignKey: 'id_paciente' });

db.citas.belongsTo(db.terapeuta, { foreignKey: 'id_terapeuta' });
db.terapeuta.hasMany(db.citas, { foreignKey: 'id_terapeuta' });

db.prestamos.belongsTo(db.paciente, { foreignKey: 'id_paciente' });
db.paciente.hasMany(db.prestamos, { foreignKey: 'id_paciente' });

db.prestamos.belongsTo(db.productos, { foreignKey: 'id_producto' });
db.productos.hasMany(db.prestamos, { foreignKey: 'id_producto' });

db.compras.hasMany(db.detallecompras, { as: 'detalle', foreignKey: 'id_compra' });
db.detallecompras.belongsTo(db.compras, { foreignKey: 'id_compra' });

module.exports = db;