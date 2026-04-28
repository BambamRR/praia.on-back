'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('estabelecimentos', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      nome: {
        type:      Sequelize.STRING(150),
        allowNull: false,
      },
      tipo: {
        type:         Sequelize.ENUM('bar_praia', 'quiosque', 'restaurante', 'outro'),
        allowNull:    false,
        defaultValue: 'bar_praia',
      },
      cidade: {
        type:      Sequelize.STRING(100),
        allowNull: false,
      },
      estado: {
        type:      Sequelize.CHAR(2),
        allowNull: true,
      },
      cnpj: {
        type:      Sequelize.STRING(18),
        allowNull: true,
        unique:    true,
      },
      telefone: {
        type:      Sequelize.STRING(20),
        allowNull: true,
      },
      descricao: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      ativo: {
        type:         Sequelize.BOOLEAN,
        allowNull:    false,
        defaultValue: true,
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
    await queryInterface.dropTable('estabelecimentos');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_estabelecimentos_tipo";'
    );
  },
};
