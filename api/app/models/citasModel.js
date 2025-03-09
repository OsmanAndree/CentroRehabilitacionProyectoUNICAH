'use strict';

module.exports = (sequelize, DataTypes) => {
  const Citas = sequelize.define('Citas', {
    id_cita: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_paciente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Pacientes', key: 'id_paciente' }
    },
    id_terapeuta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Terapeutas', key: 'id_terapeuta' }
    },
    tipo_terapia: {
      type: DataTypes.ENUM('Fisica','Neurologica'),
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hora_inicio: {
      type: DataTypes.TIME,
      allowNull: false
    },
    hora_fin: {
      type: DataTypes.TIME,
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'Confirmada', 'Cancelada', 'Completada'),
      allowNull: false
    },
    duracion_min: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Citas',
    timestamps: false
  });

  return Citas;
};