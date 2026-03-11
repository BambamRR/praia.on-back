'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Produto = sequelize.define('Produto', {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    nome: {
      type:      DataTypes.STRING(150),
      allowNull: false,
      validate:  { notEmpty: true },
    },
    descricao: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
    preco: {
      type:      DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate:  { min: 0 },
      get() {
        const val = this.getDataValue('preco');
        return val ? parseFloat(val) : 0;
      },
    },
    imagem: {
      type:      DataTypes.STRING(500),
      allowNull: true,
    },
    disponivel: {
      type:         DataTypes.BOOLEAN,
      allowNull:    false,
      defaultValue: true,
    },
    categoria_id: {
      type:      DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName:  'produtos',
    timestamps: true,
  });

  Produto.associate = (models) => {
    Produto.belongsTo(models.Categoria, {
      foreignKey: 'categoria_id',
      as:         'categoria',
    });
  };

  return Produto;
};
