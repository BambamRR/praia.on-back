'use strict';

/**
 * Migration 019 — Corrige a arquitetura multi-tenant:
 *
 * Problema: a migration 018 adicionou establishment_id em mesas/produtos
 * apontando para uma tabela "Establishments" nova, em paralelo com a tabela
 * "estabelecimentos" já existente. Isso gerou conflito de FK.
 *
 * Solução: remover as colunas duplicadas e adicionar "slug" diretamente
 * na tabela "estabelecimentos" existente, que já é usada pelo sistema todo.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove establishment_id de mesas (se existir)
    const tableMesas = await queryInterface.describeTable('mesas');
    if (tableMesas.establishment_id) {
      await queryInterface.removeColumn('mesas', 'establishment_id');
    }

    // 2. Remove establishment_id de produtos (se existir)
    const tableProd = await queryInterface.describeTable('produtos');
    if (tableProd.establishment_id) {
      await queryInterface.removeColumn('produtos', 'establishment_id');
    }

    // 3. Adiciona slug em estabelecimentos (nullable primeiro)
    const tableEst = await queryInterface.describeTable('estabelecimentos');
    if (!tableEst.slug) {
      await queryInterface.addColumn('estabelecimentos', 'slug', {
        type:      Sequelize.STRING(200),
        allowNull: true,
        unique:    true,
      });
    }

    // 4. Gera slugs a partir do nome para registros existentes
    // Converte: "Bar da Praia" → "bar-da-praia"
    await queryInterface.sequelize.query(`
      UPDATE estabelecimentos
      SET slug = lower(
        regexp_replace(
          regexp_replace(
            regexp_replace(trim(nome), '[^a-zA-Z0-9\\s-]', '', 'g'),
          '\\s+', '-', 'g'),
        '-+', '-', 'g')
      )
      WHERE slug IS NULL;
    `);

    // 5. Garante unicidade: se houver slugs duplicados, adiciona o id
    await queryInterface.sequelize.query(`
      UPDATE estabelecimentos e1
      SET slug = e1.slug || '-' || e1.id
      WHERE EXISTS (
        SELECT 1 FROM estabelecimentos e2
        WHERE e2.slug = e1.slug AND e2.id < e1.id
      );
    `);
  },

  async down(queryInterface) {
    const tableEst = await queryInterface.describeTable('estabelecimentos');
    if (tableEst.slug) {
      await queryInterface.removeColumn('estabelecimentos', 'slug');
    }
  },
};
