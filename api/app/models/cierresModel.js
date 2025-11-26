'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Cierres = sequelize.define('Cierres', {
    id_cierre: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    fecha_cierre: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hora_cierre: {
      type: DataTypes.TIME,
      allowNull: false
    },
    total_esperado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    total_cobrado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    diferencia: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    total_citas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    citas_pagadas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    citas_pendientes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    citas_confirmadas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    citas_completadas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    citas_canceladas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id_usuario'
      }
    }
  }, {
    tableName: 'cierres',
    timestamps: false
  });

  return Cierres;
};

