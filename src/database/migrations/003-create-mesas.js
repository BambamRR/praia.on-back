'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mesas', {
      id: {
        type:          Sequelize.INTEGER,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      numero: {
        type:      Sequelize.INTEGER,
        allowNull: false,
        unique:    true,
      },
      status: {
        type:         Sequelize.ENUM('livre', 'ocupada', 'aguardando'),
        allowNull:    false,
        defaultValue: 'livre',
      },
      qr_code: {
        type:      Sequelize.STRING(255),
        allowNull: true,
      },
      capacidade: {
        type:         Sequelize.INTEGER,
        allowNull:    false,
        defaultValue: 4,
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
    await queryInterface.dropTable('mesas');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_mesas_status";');
  },
};
