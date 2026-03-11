'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('perfis', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      nome: {
        type:      Sequelize.STRING(50),
        allowNull: false,
        unique:    true,
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
    await queryInterface.dropTable('perfis');
  },
};
