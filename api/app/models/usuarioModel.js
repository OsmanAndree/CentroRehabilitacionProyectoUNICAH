'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const attributes = {
        id_usuario: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        rol: {
            type: DataTypes.ENUM('Administrador', 'Terapeuta', 'Encargado'),
            allowNull: false,
            defaultValue: 'Encargado'
        },
        estado: {
            type: DataTypes.ENUM('Activo', 'Inactivo'),
            allowNull: false,
            defaultValue: 'Activo'
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        }
    };
    
    const options = {
        tableName: 'usuarios',
        timestamps: false
    };
    
    return sequelize.define('usuarios', attributes, options);
};
