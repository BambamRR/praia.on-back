'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Establishment = sequelize.define('Establishment', {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    name: {
      type:      DataTypes.STRING(150),
      allowNull: false,
    },
    slug: {
      type:      DataTypes.STRING(150),
      allowNull: false,
      unique:    true,
    },
  }, {
    tableName:  'Establishments',
    timestamps: true,
  });

  Establishment.associate = (models) => {
    Establishment.hasMany(models.Produto, {
      foreignKey: 'establishment_id',
      as:         'produtos',
    });
    Establishment.hasMany(models.Mesa, {
      foreignKey: 'establishment_id',
      as:         'mesas',
    });
  };

  return Establishment;
};
