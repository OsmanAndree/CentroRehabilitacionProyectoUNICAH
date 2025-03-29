'use strict';

const { DataTypes } = require('sequelize');
const { defaultValueSchemable, toDefaultValue } = require('sequelize/lib/utils');

module.exports = (sequelize) => {
    const attributes = {
        id_producto: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        descripcion: {
            type: DataTypes.TEXT
        },
        categoria: {
            type: DataTypes.STRING(50)
        },
        cantidad_disponible: {
            type: DataTypes.INTEGER
        }, 
        estado: {
            type: DataTypes.BOOLEAN, 
            allowNull: false,
            defaultValue: true
        }  
    };
    const options = {
        tableName: 'productos',
        timestamps: false
    };
    return sequelize.define('productos', attributes, options);
};