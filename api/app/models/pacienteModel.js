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
            allowNull: true,
            references: {
                model: 'encargados',
                key: 'id_encargado'
            }
        },
        estado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
       
        genero: {
            type: DataTypes.INTEGER, 
            allowNull: true,         
            validate: {              
                isIn: [[0, 1, 2]]    
            }
        },
        lugar_procedencia: {
            type: DataTypes.STRING(100), 
            allowNull: true
        },
        numero_identidad: {
            type: DataTypes.STRING(20),  
            allowNull: true
        }
    };

    const options = {
        tableName: 'pacientes',
        timestamps: false
    };

    return sequelize.define('pacientes', attributes, options);
};