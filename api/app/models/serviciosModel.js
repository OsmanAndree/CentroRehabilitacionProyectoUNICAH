'use strict';

module.exports = (sequelize, DataTypes) => {
  const Servicios = sequelize.define('Servicios', {
    id_servicio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    costo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'Servicios',
    timestamps: false
  });

  return Servicios;
};

