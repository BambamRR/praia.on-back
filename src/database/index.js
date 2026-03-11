const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');
const logger   = require('../config/logger');

const env    = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host:           config.host,
    port:           config.port,
    dialect:        config.dialect,
    logging:        config.logging,
    pool:           config.pool,
    dialectOptions: config.dialectOptions,
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`✅ PostgreSQL conectado [${env}] — ${config.host}:${config.port}/${config.database}`);
  } catch (error) {
    logger.error('❌ Falha ao conectar ao PostgreSQL', { error: error.message });
    process.exit(1);
  }
};

module.exports = { sequelize, Sequelize, testConnection };
