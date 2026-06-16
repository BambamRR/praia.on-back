'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Adiciona as colunas como nullable primeiro se não existirem
    const tableProd = await queryInterface.describeTable('produtos');
    if (!tableProd.establishment_id) {
      await queryInterface.addColumn('produtos', 'establishment_id', {
        type:       Sequelize.INTEGER,
        allowNull:  true,
        references: {
          model: 'Establishments',
          key:   'id',
        },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',
      });
    }

    const tableMesas = await queryInterface.describeTable('mesas');
    if (!tableMesas.establishment_id) {
      await queryInterface.addColumn('mesas', 'establishment_id', {
        type:       Sequelize.INTEGER,
        allowNull:  true,
        references: {
          model: 'Establishments',
          key:   'id',
        },
        onUpdate:   'CASCADE',
        onDelete:   'CASCADE',
      });
    }

    // 2. Garante que exista pelo menos um estabelecimento cadastrado
    const [establishments] = await queryInterface.sequelize.query(
      `SELECT id FROM "Establishments" LIMIT 1;`
    );

    let defaultEstId;
    if (establishments.length > 0) {
      defaultEstId = establishments[0].id;
    } else {
      const [newEst] = await queryInterface.sequelize.query(
        `INSERT INTO "Establishments" (name, slug, "createdAt", "updatedAt") 
         VALUES ('PraiOn Beach', 'praion-beach', NOW(), NOW()) RETURNING id;`
      );
      defaultEstId = newEst[0].id;
    }

    // 3. Associa registros existentes ao estabelecimento padrão
    await queryInterface.sequelize.query(
      `UPDATE produtos SET establishment_id = ${defaultEstId} WHERE establishment_id IS NULL;`
    );
    await queryInterface.sequelize.query(
      `UPDATE mesas SET establishment_id = ${defaultEstId} WHERE establishment_id IS NULL;`
    );

    // 4. Define allowNull para false (obrigatória) nas duas tabelas
    await queryInterface.changeColumn('produtos', 'establishment_id', {
      type:       Sequelize.INTEGER,
      allowNull:  false,
    });

    await queryInterface.changeColumn('mesas', 'establishment_id', {
      type:       Sequelize.INTEGER,
      allowNull:  false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('produtos', 'establishment_id');
    await queryInterface.removeColumn('mesas', 'establishment_id');
  },
};
