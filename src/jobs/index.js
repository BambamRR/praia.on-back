const logger = require('../config/logger');

const { iniciarLimpeza }      = require('./limpezaPedidosAntigos');
const { iniciarNotificacao }  = require('./notificacaoMesasAguardando');

const iniciarJobs = (models) => {
  if (process.env.NODE_ENV === 'test') return;

  iniciarLimpeza(models);
  iniciarNotificacao(models);

  logger.info('⏰ Jobs agendados iniciados');
};

module.exports = iniciarJobs;
