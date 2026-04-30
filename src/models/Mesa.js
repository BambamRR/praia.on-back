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
    estabelecimento_id: {
      type:      DataTypes.INTEGER,
      allowNull: true,
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
    Mesa.belongsTo(models.Estabelecimento, {
      foreignKey: 'estabelecimento_id',
      as:         'estabelecimento',
    });
  };

  return Mesa;
};
