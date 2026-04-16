'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Postgres query para adicionar valor ao ENUM
      await queryInterface.sequelize.query("ALTER TYPE \"enum_pedidos_status\" ADD VALUE IF NOT EXISTS 'finalizado';");
    } catch (error) {
      console.log('Erro ao atualizar ENUM (possivelmente não é Postgres ou valor já existe):', error.message);
      // Fallback ou ignorar se não for Postgres (SQLite lida com enums como strings/constraints)
    }
  },

  async down(queryInterface, Sequelize) {
    // Remover valor de ENUM em Postgres exige recriar o tipo, o que é arriscado.
    // Deixamos sem ação no down para integridade dos dados.
  }
};
