'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SessoesMesa', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      session_token: {
        type:      Sequelize.UUID,
        allowNull: false,
        unique:    true,
      },
      mesa_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'mesas', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',
      },
      status: {
        type:         Sequelize.ENUM('aberta', 'aguardando_fechamento', 'fechada'),
        allowNull:    false,
        defaultValue: 'aberta',
      },
      aberto_em: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      fechado_em: {
        type:      Sequelize.DATE,
        allowNull: true,
      },
      total: {
        type:         Sequelize.DECIMAL(10, 2),
        allowNull:    false,
        defaultValue: 0,
      },
      metodo_pagamento: {
        type:      Sequelize.STRING(50),
        allowNull: true,
      },
      createdAt: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('SessoesMesa');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_SessoesMesa_status";'
    );
  },
};
