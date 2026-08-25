/* Diagnóstico temporário do histórico — conta sessões fechadas vs pedidos finalizados */
const { sequelize } = require('../src/database');

(async () => {
  try {
    const [sessoes] = await sequelize.query(`SELECT COUNT(*) AS total FROM "SessoesMesa" WHERE status = 'fechada'`);
    const [finalizados] = await sequelize.query(`SELECT COUNT(*) AS total FROM pedidos WHERE status = 'finalizado'`);
    const [porMesa] = await sequelize.query(`SELECT mesa_id, COUNT(*) AS n FROM "SessoesMesa" WHERE status = 'fechada' GROUP BY mesa_id ORDER BY n DESC`);
    const [comData] = await sequelize.query(`SELECT COUNT(*) AS total, MIN(fechado_em) AS min_f, MAX(fechado_em) AS max_f FROM "SessoesMesa" WHERE status = 'fechada' AND fechado_em IS NOT NULL`);
    const [semData] = await sequelize.query(`SELECT COUNT(*) AS total FROM "SessoesMesa" WHERE status = 'fechada' AND fechado_em IS NULL`);
    const [mesasNum] = await sequelize.query(`SELECT m.numero, s.id AS sessao_id, s.fechado_em FROM "SessoesMesa" s JOIN mesas m ON m.id = s.mesa_id WHERE s.status = 'fechada' ORDER BY s.fechado_em DESC`);

    console.log('sessoes fechadas:', JSON.stringify(sessoes));
    console.log('pedidos finalizados:', JSON.stringify(finalizados));
    console.log('fechadas por mesa:', JSON.stringify(porMesa));
    console.log('com fechado_em:', JSON.stringify(comData));
    console.log('sem fechado_em:', JSON.stringify(semData));
    console.log('detalhe (mesa, sessao, fechado_em):');
    mesasNum.forEach((r) => console.log(`  mesa ${r.numero} | sessao ${r.sessao_id} | ${r.fechado_em}`));
  } catch (e) {
    console.error('ERRO:', e.message);
  } finally {
    await sequelize.close();
  }
})();
