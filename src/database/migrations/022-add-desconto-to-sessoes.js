'use strict';

/** Adiciona a coluna `desconto` em SessoesMesa (desconto concedido no fechamento). */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('SessoesMesa', 'desconto', {
      type:         Sequelize.DECIMAL(10, 2),
      allowNull:    false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('SessoesMesa', 'desconto');
  },
};
