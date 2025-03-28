'use strict'

const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    const attributes = {
        id_detallecompra: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_compra: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        id_producto: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cantidad: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        costo_unitario: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    };
    const options = {
        tableName: 'detallecompras',
        timestamps: false
    };
    return sequelize.define('detallecompras', attributes, options);
}