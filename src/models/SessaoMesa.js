'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SessaoMesa = sequelize.define('SessaoMesa', {
    id: {
      type:          DataTypes.INTEGER,
      primaryKey:    true,
      autoIncrement: true,
    },
    session_token: {
      type:         DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull:    false,
      unique:       true,
    },
    mesa_id: {
      type:      DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type:         DataTypes.ENUM('aberta', 'aguardando_fechamento', 'fechada'),
      allowNull:    false,
      defaultValue: 'aberta',
    },
    aberto_em: {
      type:         DataTypes.DATE,
      allowNull:    false,
      defaultValue: DataTypes.NOW,
    },
    fechado_em: {
      type:      DataTypes.DATE,
      allowNull: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      get() {
        const val = this.getDataValue('total');
        return val ? parseFloat(val) : 0;
      },
    },
    metodo_pagamento: {
      type:      DataTypes.STRING(50),
      allowNull: true,
    },
  }, {
    tableName:  'SessoesMesa',
    timestamps: true,
  });

  SessaoMesa.associate = (models) => {
    SessaoMesa.belongsTo(models.Mesa, { foreignKey: 'mesa_id', as: 'mesa' });
    SessaoMesa.hasMany(models.Pedido, { foreignKey: 'sessao_id', as: 'pedidos' });
  };

  return SessaoMesa;
};
