'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('produtos', 'imagem', {
      type:         Sequelize.STRING(500),
      allowNull:    true,
      defaultValue: null,
      comment:      'URL da imagem do produto',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('produtos', 'imagem');
  },
};
