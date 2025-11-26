'use strict';

module.exports = (sequelize, DataTypes) => {
  const Recibos = sequelize.define('Recibos', {
    id_recibo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_cita: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Citas', key: 'id_cita' }
    },
    numero_recibo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    fecha_cobro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('Activo', 'Anulado'),
      allowNull: false,
      defaultValue: 'Activo'
    }
  }, {
    tableName: 'Recibos',
    timestamps: false
  });

  return Recibos;
};

