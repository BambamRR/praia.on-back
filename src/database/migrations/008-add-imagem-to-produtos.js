'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verifica se a coluna já existe antes de tentar adicionar
    // (compatível com todas as versões do PostgreSQL)
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'produtos' AND column_name = 'imagem';
    `);

    if (results.length === 0) {
      await queryInterface.addColumn('produtos', 'imagem', {
        type:         Sequelize.STRING(500),
        allowNull:    true,
        defaultValue: null,
      });
    } else {
      console.log('Coluna "imagem" já existe em "produtos" — migration ignorada.');
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('produtos', 'imagem');
  },
};

