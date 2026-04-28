'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'estabelecimento_id', {
      type:       Sequelize.INTEGER,
      allowNull:  true,   // null = super admin (vê tudo); preenchido = admin do estabelecimento
      references: { model: 'estabelecimentos', key: 'id' },
      onUpdate:   'CASCADE',
      onDelete:   'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'estabelecimento_id');
  },
};
