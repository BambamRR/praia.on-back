'use strict';

const { sequelize } = require('../database');

const Perfil     = require('./Perfil')(sequelize);
const User       = require('./User')(sequelize);
const Mesa       = require('./Mesa')(sequelize);
const Categoria  = require('./Categoria')(sequelize);
const Produto    = require('./Produto')(sequelize);
const Pedido     = require('./Pedido')(sequelize);
const PedidoItem = require('./PedidoItem')(sequelize);

const models = { Perfil, User, Mesa, Categoria, Produto, Pedido, PedidoItem };

/* Registrar associações */
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = { sequelize, ...models };
