'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('categorias', 'estabelecimento_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'estabelecimentos', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addIndex('categorias', ['estabelecimento_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('categorias', 'estabelecimento_id');
  },
};
