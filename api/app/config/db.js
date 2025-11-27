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

// Modelos principales
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
db.servicios = require('../models/serviciosModel')(sequelizeInstance, Sequelize);
db.citasServicios = require('../models/citasServiciosModel')(sequelizeInstance, Sequelize);
db.recibos = require('../models/recibosModel')(sequelizeInstance, Sequelize);
db.cierres = require('../models/cierresModel')(sequelizeInstance, Sequelize);

// Modelos de Roles y Permisos (Sistema tipo Spatie)
db.roles = require('../models/roleModel')(sequelizeInstance, Sequelize);
db.permissions = require('../models/permissionModel')(sequelizeInstance, Sequelize);
db.userRoles = require('../models/userRoleModel')(sequelizeInstance, Sequelize);
db.rolePermissions = require('../models/rolePermissionModel')(sequelizeInstance, Sequelize);

// =====================================================
// RELACIONES EXISTENTES
// =====================================================

db.paciente.belongsTo(db.encargado, { foreignKey: 'id_encargado' });
db.encargado.hasMany(db.paciente, { foreignKey: 'id_encargado' });

// Relaciones Citas-Servicios (muchos a muchos)
db.citas.belongsToMany(db.servicios, { through: db.citasServicios, foreignKey: 'id_cita', otherKey: 'id_servicio', as: 'servicios' });
db.servicios.belongsToMany(db.citas, { through: db.citasServicios, foreignKey: 'id_servicio', otherKey: 'id_cita', as: 'citas' });

// Relaciones Citas-Recibos (uno a uno)
db.citas.hasOne(db.recibos, { foreignKey: 'id_cita', as: 'Recibo' });
db.recibos.belongsTo(db.citas, { foreignKey: 'id_cita', as: 'Cita' });

// Relaciones Cierres-Usuarios
db.cierres.belongsTo(db.usuarios, { foreignKey: 'id_usuario', as: 'usuario' });
db.usuarios.hasMany(db.cierres, { foreignKey: 'id_usuario', as: 'cierres' });
// Relación para usuario que reabrió el cierre
db.cierres.belongsTo(db.usuarios, { foreignKey: 'id_usuario_reapertura', as: 'usuarioReapertura' });

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

// =====================================================
// RELACIONES DE ROLES Y PERMISOS (Sistema tipo Spatie)
// =====================================================

// Usuario <-> Roles (Muchos a Muchos)
db.usuarios.belongsToMany(db.roles, { 
    through: db.userRoles, 
    foreignKey: 'id_usuario', 
    otherKey: 'id_role',
    as: 'roles'
});
db.roles.belongsToMany(db.usuarios, { 
    through: db.userRoles, 
    foreignKey: 'id_role', 
    otherKey: 'id_usuario',
    as: 'usuarios'
});

// Roles <-> Permisos (Muchos a Muchos)
db.roles.belongsToMany(db.permissions, { 
    through: db.rolePermissions, 
    foreignKey: 'id_role', 
    otherKey: 'id_permission',
    as: 'permissions'
});
db.permissions.belongsToMany(db.roles, { 
    through: db.rolePermissions, 
    foreignKey: 'id_permission', 
    otherKey: 'id_role',
    as: 'roles'
});

module.exports = db;
