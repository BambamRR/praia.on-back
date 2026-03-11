'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Perfil = sequelize.define('Perfil', {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    nome: {
      type:      DataTypes.STRING(50),
      allowNull: false,
      unique:    true,
      validate:  { notEmpty: true },
    },
  }, {
    tableName:  'perfis',
    timestamps: true,
  });

  Perfil.associate = (models) => {
    Perfil.hasMany(models.User, {
      foreignKey: 'perfil_id',
      as:         'usuarios',
    });
  };

  return Perfil;
};
