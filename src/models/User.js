'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    nome: {
      type:      DataTypes.STRING(100),
      allowNull: false,
      validate:  { notEmpty: true, len: [2, 100] },
    },
    email: {
      type:      DataTypes.STRING(150),
      allowNull: false,
      unique:    true,
      validate:  { isEmail: true },
    },
    senha: {
      type:      DataTypes.STRING(255),
      allowNull: false,
    },
    telefone: {
      type:      DataTypes.STRING(20),
      allowNull: true,
    },
    cpf: {
      type:      DataTypes.STRING(14),
      allowNull: true,
      unique:    true,
    },
    rg: {
      type:      DataTypes.STRING(20),
      allowNull: true,
    },
    endereco: {
      type:      DataTypes.STRING(255),
      allowNull: true,
    },
    perfil_id: {
      type:      DataTypes.INTEGER,
      allowNull: false,
    },
    estabelecimento_id: {
      type:      DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName:  'users',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['senha'] },
    },
    scopes: {
      withPassword: { attributes: {} },
    },
  });

  User.associate = (models) => {
    User.belongsTo(models.Perfil, {
      foreignKey: 'perfil_id',
      as:         'perfil',
    });
    User.belongsTo(models.Estabelecimento, {
      foreignKey: 'estabelecimento_id',
      as:         'estabelecimento',
    });
  };

  return User;
};
