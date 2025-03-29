'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        id_paciente: {
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
        fecha_nacimiento: {
            type: DataTypes.DATE,
            allowNull: false
        },
        telefono: {
            type: DataTypes.STRING(20)
        },
        direccion: {
            type: DataTypes.TEXT
        },
        id_encargado: {
            type: DataTypes.INTEGER,
            references: {
                model: 'encargados',
                key: 'id_encargado'
            }
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    };
    const options = {
        tableName: 'pacientes',
        timestamps: false
    };
    return sequelize.define('pacientes', attributes, options);
};