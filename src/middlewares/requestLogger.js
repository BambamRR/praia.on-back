const logger = require('../config/logger');

/**
 * Loga cada requisição HTTP com método, path, status e tempo.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level    = res.statusCode >= 500 ? 'error'
                   : res.statusCode >= 400 ? 'warn'
                   : 'http';

    logger[level](`${req.method} ${req.originalUrl} ${res.statusCode} — ${duration}ms`, {
      ip:     req.ip,
      ua:     req.headers['user-agent'],
      userId: req.user?.id || null,
    });
  });

  next();
};

module.exports = requestLogger;
