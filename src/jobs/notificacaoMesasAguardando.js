const cron   = require('node-cron');
const { Op } = require('sequelize');
const logger  = require('../config/logger');

/**
 * Job: verifica mesa com pedido "novo" há mais de 15 min e loga alerta.
 * Executa a cada 5 minutos.
 */
const iniciarNotificacao = (models) => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const quinzeMinAtras = new Date(Date.now() - 15 * 60 * 1000);

      const pedidosAguardando = await models.Pedido.findAll({
        where: {
          status:    'novo',
          createdAt: { [Op.lt]: quinzeMinAtras },
        },
        include: [{ model: models.Mesa, as: 'mesa', attributes: ['numero'] }],
      });

      if (pedidosAguardando.length > 0) {
        pedidosAguardando.forEach((p) => {
          logger.warn(`[Job] Pedido #${p.id} — Mesa ${p.mesa?.numero} aguardando há mais de 15 min`);
        });
      }
    } catch (err) {
      logger.error('[Job] Erro ao verificar mesas aguardando', { error: err.message });
    }
  });
};

module.exports = { iniciarNotificacao };
