'use strict';

module.exports = {
  async up(queryInterface) {
    const perfis = ['administrador', 'fornecedor'];
    
    for (const nome of perfis) {
      const [existe] = await queryInterface.sequelize.query(
        `SELECT id FROM perfis WHERE nome = '${nome}' LIMIT 1`,
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (!existe) {
        await queryInterface.bulkInsert('perfis', [
          { nome, createdAt: new Date(), updatedAt: new Date() }
        ]);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('perfis', null, {});
  },
};
