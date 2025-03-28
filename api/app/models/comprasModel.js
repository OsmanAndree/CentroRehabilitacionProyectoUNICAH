'use strict'

const { DataTypes } = require('sequelize')	

module.exports = (sequelize) => {
    const attributes = {
        id_compra: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fecha: {
            type: DataTypes.DATE,
            allowNull: false
        },
        donante: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        total: {
            type: DataTypes.FLOAT,
            allowNull: false
        }, 
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    };

    const options = {
        tableName: 'compras',
        timestamps: false
    };
    return sequelize.define('compras', attributes, options);
}

