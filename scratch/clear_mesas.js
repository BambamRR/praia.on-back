const { sequelize } = require('../src/models');

async function clearMesas() {
  console.log('--- Iniciando limpeza de dados de mesas ---');
  
  const transaction = await sequelize.transaction();
  
  try {
    // Desabilitar chaves estrangeiras temporariamente (opcional se usar cascade ou ordem correta)
    // No Postgres, o TRUNCATE CASCADE é bem eficiente.
    
    console.log('Limpando pedido_itens...');
    await sequelize.query('TRUNCATE TABLE "pedido_itens" RESTART IDENTITY CASCADE;', { transaction });
    
    console.log('Limpando pedidos...');
    await sequelize.query('TRUNCATE TABLE "pedidos" RESTART IDENTITY CASCADE;', { transaction });
    
    console.log('Limpando SessoesMesa...');
    await sequelize.query('TRUNCATE TABLE "SessoesMesa" RESTART IDENTITY CASCADE;', { transaction });
    
    console.log('Limpando mesas...');
    await sequelize.query('TRUNCATE TABLE "mesas" RESTART IDENTITY CASCADE;', { transaction });

    await transaction.commit();
    console.log('--- Limpeza concluída com sucesso! ---');
    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao limpar mesas:', error);
    process.exit(1);
  }
}

clearMesas();
