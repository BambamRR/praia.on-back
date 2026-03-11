'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('produtos', {
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
      descricao: {
        type:      Sequelize.TEXT,
        allowNull: true,
      },
      preco: {
        type:      Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      imagem: {
        type:      Sequelize.STRING(500),
        allowNull: true,
      },
      disponivel: {
        type:         Sequelize.BOOLEAN,
        allowNull:    false,
        defaultValue: true,
      },
      categoria_id: {
        type:       Sequelize.INTEGER,
        allowNull:  false,
        references: { model: 'categorias', key: 'id' },
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
    await queryInterface.dropTable('produtos');
  },
};
