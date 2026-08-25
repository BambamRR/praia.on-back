/* Diagnóstico 2 — sessões fechadas com/sem pedidos finalizados + teste do serviço */
const models = require('../src/models');
const PedidoService = require('../src/service/PedidoService');

(async () => {
  const svc = new PedidoService(models);
  try {
    const [porSessao] = await models.sequelize.query(`
      SELECT s.id, s.fechado_em, m.numero,
             (SELECT COUNT(*) FROM pedidos p WHERE p.sessao_id = s.id) AS total_pedidos,
             (SELECT COUNT(*) FROM pedidos p WHERE p.sessao_id = s.id AND p.status = 'finalizado') AS pedidos_finalizados
      FROM "SessoesMesa" s JOIN mesas m ON m.id = s.mesa_id
      WHERE s.status = 'fechada'
      ORDER BY s.fechado_em DESC`);
    console.log('--- sessões fechadas (id | mesa | fechado_em | pedidos | finalizados) ---');
    porSessao.forEach((r) => console.log(`  ${r.id} | mesa ${r.numero} | ${r.fechado_em} | ${r.total_pedidos} | ${r.pedidos_finalizados}`));

    const sessoesComPedido = porSessao.filter((r) => Number(r.pedidos_finalizados) > 0).length;
    console.log('sessoes com >=1 pedido finalizado:', sessoesComPedido);

    console.log('\n--- teste serviço: sem filtro ---');
    const r1 = await svc.listarHistorico(null, { page: 1, limit: 10 });
    console.log('total:', r1.paginacao.total, '| pedidos retornados:', r1.pedidos.length,
      '| sessoes distintas:', new Set(r1.pedidos.map((p) => p.sessao_id)).size);

    console.log('\n--- teste serviço: dataInicio/dataFim = 2026-08-18 ---');
    const r2 = await svc.listarHistorico(null, { page: 1, limit: 10, dataInicio: '2026-08-18', dataFim: '2026-08-18' });
    console.log('total:', r2.paginacao.total, '| pedidos retornados:', r2.pedidos.length,
      '| sessoes distintas:', new Set(r2.pedidos.map((p) => p.sessao_id)).size);
    r2.pedidos.forEach((p) => console.log(`  pedido ${p.id} | sessao ${p.sessao_id} | status ${p.status}`));

    console.log('\n--- teste serviço: data = 2026-08-08 ---');
    const r3 = await svc.listarHistorico(null, { page: 1, limit: 10, data: '2026-08-08' });
    console.log('total:', r3.paginacao.total, '| pedidos retornados:', r3.pedidos.length,
      '| sessoes distintas:', new Set(r3.pedidos.map((p) => p.sessao_id)).size);
  } catch (e) {
    console.error('ERRO:', e);
  } finally {
    await models.sequelize.close();
  }
})();
