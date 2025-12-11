'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        id_prestamo: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_paciente: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'pacientes',
                key: 'id_paciente'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'productos',
                key: 'id_producto'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        fecha_prestamo: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        fecha_devolucion: {
            type: DataTypes.DATEONLY
        },
        estado: {
            type: DataTypes.ENUM('Prestado', 'Devuelto'),
            allowNull: false,
            defaultValue: 'Prestado'
        },
        periodo_prestamo: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Periodo del préstamo (ej: "30 días", "1 mes", etc.)'
        },
        tipo: {
            type: DataTypes.ENUM('Prestamo', 'Donacion'),
            allowNull: false,
            defaultValue: 'Prestamo'
        },
        referencia1_nombre: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        referencia1_direccion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        referencia1_telefono: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        referencia2_nombre: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        referencia2_direccion: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        referencia2_telefono: {
            type: DataTypes.STRING(20),
            allowNull: true
        }
    };

    const options = {
        tableName: 'prestamos',
        timestamps: false
    };

    return sequelize.define('prestamos', attributes, options);
};