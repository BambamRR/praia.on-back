'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PedidoItem = sequelize.define('PedidoItem', {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    pedido_id:     { type: DataTypes.INTEGER,      allowNull: false },
    produto_id:    { type: DataTypes.INTEGER,      allowNull: false },
    nome: {
      type:      DataTypes.STRING(150),
      allowNull: false,
    },
    quantidade: {
      type:         DataTypes.INTEGER,
      allowNull:    false,
      defaultValue: 1,
      validate:     { min: 1 },
    },
    preco_unitario: {
      type:      DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const val = this.getDataValue('preco_unitario');
        return val ? parseFloat(val) : 0;
      },
    },
    subtotal: {
      type:      DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const val = this.getDataValue('subtotal');
        return val ? parseFloat(val) : 0;
      },
    },
    observacao: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName:  'pedido_itens',
    timestamps: true,
  });

  PedidoItem.associate = (models) => {
    PedidoItem.belongsTo(models.Pedido,  { foreignKey: 'pedido_id',  as: 'pedido'  });
    PedidoItem.belongsTo(models.Produto, { foreignKey: 'produto_id', as: 'produto' });
  };

  return PedidoItem;
};
