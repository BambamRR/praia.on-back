'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('perfis', [
      { nome: 'administrador', createdAt: new Date(), updatedAt: new Date() },
      { nome: 'fornecedor',    createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('perfis', null, {});
  },
};
