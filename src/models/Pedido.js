'use strict';

const { DataTypes } = require('sequelize');

const STATUS_VALIDOS = ['novo', 'preparando', 'pronto', 'entregue', 'cancelado', 'finalizado'];

module.exports = (sequelize) => {
  const Pedido = sequelize.define('Pedido', {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    mesa_id: {
      type:      DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type:         DataTypes.ENUM(...STATUS_VALIDOS),
      allowNull:    false,
      defaultValue: 'novo',
      validate:     { isIn: [STATUS_VALIDOS] },
    },
    total: {
      type:         DataTypes.DECIMAL(10, 2),
      allowNull:    false,
      defaultValue: 0,
      get() {
        const val = this.getDataValue('total');
        return val ? parseFloat(val) : 0;
      },
    },
    observacao: {
      type:      DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName:  'pedidos',
    timestamps: true,
  });

  Pedido.STATUS_VALIDOS = STATUS_VALIDOS;

  Pedido.associate = (models) => {
    Pedido.belongsTo(models.Mesa, {
      foreignKey: 'mesa_id',
      as:         'mesa',
    });
    Pedido.hasMany(models.PedidoItem, {
      foreignKey: 'pedido_id',
      as:         'itens',
    });
  };

  return Pedido;
};
