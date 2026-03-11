'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pedidos', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      mesa_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'mesas', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
      },
      status: {
        type:         Sequelize.ENUM('novo', 'preparando', 'pronto', 'entregue', 'cancelado'),
        allowNull:    false,
        defaultValue: 'novo',
      },
      total: {
        type:      Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable('pedidos');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_pedidos_status";');
  },
};
