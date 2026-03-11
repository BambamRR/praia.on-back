'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pedido_itens', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      pedido_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'pedidos', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',
      },
      produto_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'produtos', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      nome: {
        type:      Sequelize.STRING(150),
        allowNull: false,
      },
      quantidade: {
        type:      Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      preco_unitario: {
        type:      Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      subtotal: {
        type:      Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      observacao: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pedido_itens');
  },
};
