'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove a constraint unique global de 'numero'
    //    (com multi-tenant, dois estabelecimentos podem ter Mesa 01)
    await queryInterface.removeConstraint('mesas', 'mesas_numero_key').catch(() => {
      // Ignora se não existir (nome pode variar)
    });

    // Remove pelo nome alternativo caso o banco use outro padrão
    await queryInterface.sequelize.query(
      `ALTER TABLE mesas DROP CONSTRAINT IF EXISTS "mesas_numero_key";`
    ).catch(() => {});

    // 2. Adiciona coluna estabelecimento_id
    await queryInterface.addColumn('mesas', 'estabelecimento_id', {
      type:       Sequelize.INTEGER,
      allowNull:  true,
      references: { model: 'estabelecimentos', key: 'id' },
      onUpdate:   'CASCADE',
      onDelete:   'SET NULL',
    });

    // 3. Cria constraint unique composta: mesmo número só pode existir 1x por estabelecimento
    await queryInterface.addConstraint('mesas', {
      fields: ['numero', 'estabelecimento_id'],
      type:   'unique',
      name:   'mesas_numero_estabelecimento_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('mesas', 'mesas_numero_estabelecimento_unique').catch(() => {});
    await queryInterface.removeColumn('mesas', 'estabelecimento_id');
    // Restaura unique simples
    await queryInterface.addConstraint('mesas', {
      fields: ['numero'],
      type:   'unique',
      name:   'mesas_numero_key',
    });
  },
};
