'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Categoria = sequelize.define('Categoria', {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    nome: {
      type:      DataTypes.STRING(100),
      allowNull: false,
      validate:  { notEmpty: true },
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
    estabelecimento_id: {
      type:       DataTypes.INTEGER,
      allowNull:  true,
      references: { model: 'estabelecimentos', key: 'id' },
    },
  }, {
    tableName:  'categorias',
    timestamps: true,
  });

  Categoria.associate = (models) => {
    Categoria.hasMany(models.Produto, {
      foreignKey: 'categoria_id',
      as:         'itens',
    });
    Categoria.belongsTo(models.Estabelecimento, {
      foreignKey: 'estabelecimento_id',
      as:         'estabelecimento',
    });
  };

  return Categoria;
};
