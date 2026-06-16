'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Check/Add estabelecimento_id to produtos table
    const tableProd = await queryInterface.describeTable('produtos');
    if (!tableProd.estabelecimento_id) {
      await queryInterface.addColumn('produtos', 'estabelecimento_id', {
        type:       Sequelize.INTEGER,
        allowNull:  true,
        references: {
          model: 'estabelecimentos',
          key:   'id',
        },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',
      });
    }

    // 2. Find a default establishment to link existing records
    const [estabelecimentos] = await queryInterface.sequelize.query(
      `SELECT id FROM estabelecimentos ORDER BY id ASC LIMIT 1;`
    );

    let defaultEstId;
    if (estabelecimentos.length > 0) {
      defaultEstId = estabelecimentos[0].id;
    } else {
      // Create a default establishment if none exists
      const [newEst] = await queryInterface.sequelize.query(
        `INSERT INTO estabelecimentos (nome, tipo, cidade, ativo, "createdAt", "updatedAt", slug) 
         VALUES ('PraiOn Beach', 'bar_praia', 'Recife', true, NOW(), NOW(), 'praion-beach') RETURNING id;`
      );
      defaultEstId = newEst[0].id;
    }

    // 3. Update existing null records in both tables to point to default establishment
    await queryInterface.sequelize.query(
      `UPDATE produtos SET estabelecimento_id = ${defaultEstId} WHERE estabelecimento_id IS NULL;`
    );
    await queryInterface.sequelize.query(
      `UPDATE mesas SET estabelecimento_id = ${defaultEstId} WHERE estabelecimento_id IS NULL;`
    );

    // 4. Set allowNull: false on both tables
    await queryInterface.changeColumn('produtos', 'estabelecimento_id', {
      type:       Sequelize.INTEGER,
      allowNull:  false,
    });

    await queryInterface.changeColumn('mesas', 'estabelecimento_id', {
      type:       Sequelize.INTEGER,
      allowNull:  false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert to nullable on mesas
    await queryInterface.changeColumn('mesas', 'estabelecimento_id', {
      type:       Sequelize.INTEGER,
      allowNull:  true,
    });

    // Remove from produtos
    await queryInterface.removeColumn('produtos', 'estabelecimento_id');
  },
};
