const cron   = require('node-cron');
const { Op } = require('sequelize');
const logger  = require('../config/logger');

/**
 * Job: remove pedidos cancelados com mais de 30 dias.
 * Executa todo dia às 02:00.
 */
const iniciarLimpeza = (models) => {
  cron.schedule('0 2 * * *', async () => {
    logger.info('[Job] Iniciando limpeza de pedidos antigos cancelados...');
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);

      const deletados = await models.Pedido.destroy({
        where: {
          status:    'cancelado',
          createdAt: { [Op.lt]: dataLimite },
        },
      });

      logger.info(`[Job] Limpeza concluída: ${deletados} pedido(s) removido(s).`);
    } catch (err) {
      logger.error('[Job] Erro na limpeza de pedidos', { error: err.message });
    }
  });
};

module.exports = { iniciarLimpeza };
