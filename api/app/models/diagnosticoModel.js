'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        id_diagnostico: {
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
            }
        },
        id_terapeuta: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'terapeutas',
                key: 'id_terapeuta'
            }
        },
        descripcion: {
            type: DataTypes.TEXT,
        },
        tratamiento: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    };
    const options = {
        tableName: 'diagnosticos',
        timestamps: false
    };
    return sequelize.define('diagnosticos', attributes, options);
};