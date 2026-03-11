require('dotenv').config();

const app     = require('./app');
const { testConnection } = require('../database');
const models  = require('../models');
const iniciarJobs = require('../jobs');
const logger  = require('../config/logger');

const PORT = parseInt(process.env.PORT) || 3000;

const start = async () => {
  await testConnection();

  /* Iniciar jobs cron */
  iniciarJobs(models);

  app.listen(PORT, () => {
    logger.info(`🚀 PraiOn API rodando na porta ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    logger.info(`📖 Docs: http://localhost:${PORT}/api/docs`);
  });
};

start().catch((err) => {
  logger.error('Falha ao iniciar servidor', { error: err.message });
  process.exit(1);
});
