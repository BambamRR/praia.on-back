'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Estabelecimento = sequelize.define('Estabelecimento', {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    nome: {
      type:      DataTypes.STRING(150),
      allowNull: false,
    },
    tipo: {
      type:         DataTypes.ENUM('bar_praia', 'quiosque', 'restaurante', 'outro'),
      allowNull:    false,
      defaultValue: 'bar_praia',
    },
    cidade: {
      type:      DataTypes.STRING(100),
      allowNull: false,
    },
    estado: {
      type:      DataTypes.CHAR(2),
      allowNull: true,
    },
    cnpj: {
      type:      DataTypes.STRING(18),
      allowNull: true,
      unique:    true,
    },
    telefone: {
      type:      DataTypes.STRING(20),
      allowNull: true,
    },
    descricao: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    ativo: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: true,
    },
  }, {
    tableName:  'estabelecimentos',
    timestamps: true,
  });

  Estabelecimento.associate = (models) => {
    Estabelecimento.hasMany(models.User, {
      foreignKey: 'estabelecimento_id',
      as:         'usuarios',
    });
    Estabelecimento.hasMany(models.Mesa, {
      foreignKey: 'estabelecimento_id',
      as:         'mesas',
    });
  };

  return Estabelecimento;
};
