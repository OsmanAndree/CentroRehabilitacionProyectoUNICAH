'use strict';

module.exports = (sequelize, DataTypes) => {
  const CitasServicios = sequelize.define('CitasServicios', {
    id_cita_servicio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_cita: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Citas', key: 'id_cita' }
    },
    id_servicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Servicios', key: 'id_servicio' }
    }
  }, {
    tableName: 'CitasServicios',
    timestamps: false
  });

  return CitasServicios;
};

