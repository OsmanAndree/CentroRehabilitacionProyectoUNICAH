'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        id_terapeuta: {
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

        especialidad: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        telefono: {
            type: DataTypes.STRING(20),
            allowNull: false
        }
    };
    const options = {
        tableName: 'terapeutas',
        timestamps: false
    };
    return sequelize.define('terapeutas', attributes, options);
};