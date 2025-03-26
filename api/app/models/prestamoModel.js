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
        }
    };

    const options = {
        tableName: 'prestamos',
        timestamps: false
    };

    return sequelize.define('prestamos', attributes, options);
};