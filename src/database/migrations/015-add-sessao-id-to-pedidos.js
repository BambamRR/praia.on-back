'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pedidos', 'sessao_id', {
      type:       Sequelize.INTEGER,
      allowNull:  true, // Nullable inicialmente para não quebrar pedidos antigos
      references: { model: 'SessoesMesa', key: 'id' },
      onUpdate:   'CASCADE',
      onDelete:   'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('pedidos', 'sessao_id');
  },
};
