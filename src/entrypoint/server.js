require('dotenv').config();

const http    = require('http');
const app     = require('./app');
const { testConnection } = require('../database');
const models  = require('../models');
const iniciarJobs = require('../jobs');
const logger  = require('../config/logger');
const { initSocket } = require('../config/socket');
const fs      = require('fs');
const path    = require('path');

/* Garante que o diretório de uploads exista */
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const PORT = parseInt(process.env.PORT) || 3000;

const start = async () => {
  await testConnection();

  /* Cria HTTP server à parte para suportar Socket.io */
  const httpServer = http.createServer(app);

  /* Inicializa Socket.io */
  const io = initSocket(httpServer);
  logger.info('🔌 Socket.io inicializado');

  /* Iniciar jobs cron */
  iniciarJobs(models);

  httpServer.listen(PORT, () => {
    logger.info(`🚀 PraiOn API rodando na porta ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    logger.info(`📖 Docs: http://localhost:${PORT}/api/docs`);
    logger.info(`📁 Uploads: http://localhost:${PORT}/uploads/`);
  });
};

start().catch((err) => {
  logger.error('Falha ao iniciar servidor', { error: err.message });
  process.exit(1);
});
