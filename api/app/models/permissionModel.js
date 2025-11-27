'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        id_permission: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Nombre legible: Ej: "Crear Pacientes"'
        },
        slug: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            comment: 'Identificador único: Ej: "pacientes.create"'
        },
        modulo: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: 'Módulo al que pertenece: Ej: "pacientes"'
        },
        descripcion: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        }
    };
    
    const options = {
        tableName: 'permissions',
        timestamps: false
    };
    
    return sequelize.define('permissions', attributes, options);
};

