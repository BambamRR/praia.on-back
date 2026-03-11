'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Mesa = sequelize.define('Mesa', {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    numero: {
      type:      DataTypes.INTEGER,
      allowNull: false,
      unique:    true,
      validate:  { min: 1 },
    },
    status: {
      type:         DataTypes.ENUM('livre', 'ocupada', 'aguardando'),
      allowNull:    false,
      defaultValue: 'livre',
    },
    qr_code: {
      type:      DataTypes.STRING(255),
      allowNull: true,
    },
    capacidade: {
      type:         DataTypes.INTEGER,
      allowNull:    false,
      defaultValue: 4,
      validate:     { min: 1 },
    },
  }, {
    tableName:  'mesas',
    timestamps: true,
  });

  Mesa.associate = (models) => {
    Mesa.hasMany(models.Pedido, {
      foreignKey: 'mesa_id',
      as:         'pedidos',
    });
  };

  return Mesa;
};
