'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      nome: {
        type:      Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type:      Sequelize.STRING(150),
        allowNull: false,
        unique:    true,
      },
      senha: {
        type:      Sequelize.STRING(255),
        allowNull: false,
      },
      telefone: {
        type:      Sequelize.STRING(20),
        allowNull: true,
      },
      cpf: {
        type:      Sequelize.STRING(14),
        allowNull: true,
        unique:    true,
      },
      rg: {
        type:      Sequelize.STRING(20),
        allowNull: true,
      },
      endereco: {
        type:      Sequelize.STRING(255),
        allowNull: true,
      },
      perfil_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'perfis', key: 'id' },
        onUpdate:   'CASCADE',
        onDelete:   'RESTRICT',
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
    await queryInterface.dropTable('users');
  },
};
