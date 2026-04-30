require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { sequelize } = require('../models');

async function clearDatabase() {
  console.log('--- Iniciando limpeza do banco de dados ---');
  
  const transaction = await sequelize.transaction();
  
  try {
    // Desabilitar chaves estrangeiras temporariamente
    await sequelize.query('SET CONSTRAINTS ALL DEFERRED', { transaction });

    console.log('Limpando todas as tabelas (CASCADE)...');
    // Nomes das tabelas sincronizados com as migrações (Cuidado com Case Sensitivity no Postgres)
    await sequelize.query('TRUNCATE TABLE "pedido_itens", "pedidos", "SessoesMesa", "mesas", "produtos", "categorias", "users", "estabelecimentos" RESTART IDENTITY CASCADE', { transaction });

    await transaction.commit();
    console.log('--- Banco de dados limpo com sucesso! ---');
    console.log('Tabelas limpas: pedido_itens, pedidos, sessoes_mesa, mesas, produtos, categorias, users, estabelecimentos.');
    console.log('\nIMPORTANTE: Agora você deve rodar "npm run seed" para restaurar os perfis e o usuário admin.');
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Erro ao limpar banco de dados:', error);
  } finally {
    process.exit();
  }
}

clearDatabase();
