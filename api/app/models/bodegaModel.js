'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        id_bodega: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'productos',
                key: 'id_producto'
            }
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        ubicacion: {
            type: DataTypes.STRING(100)
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    };
    const options = {
        tableName: 'bodega',
        timestamps: false
    };
    return sequelize.define('bodega', attributes, options);
};