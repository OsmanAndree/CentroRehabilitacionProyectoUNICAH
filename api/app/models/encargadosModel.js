'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        id_encargado: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        apellido: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        telefono: {
            type: DataTypes.STRING(20)
        },
        direccion: {
            type: DataTypes.TEXT
        }
    };
    const options = {
        tableName: 'encargados',
        timestamps: false
    };
    return sequelize.define('encargados', attributes, options);
};