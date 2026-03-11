const logger = require('../config/logger');

/**
 * BaseController — todos os controllers herdam desta classe.
 * Fornece handleSuccess e handleError padronizados.
 *
 * Os controllers novos (singleton, arrow functions) usam formatResponse diretamente.
 * Os controllers legados (instanciados com DI) usam estes métodos de instância.
 */
class BaseController {
  handleSuccess(res, data, message = 'OK', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }

  handleError(error, res, context = '') {
    logger.error(`[${this.constructor.name}${context ? `.${context}` : ''}] ${error.message}`, {
      stack: error.stack,
    });

    const statusCode = error.isOperational ? error.statusCode : 500;
    const message    = error.isOperational
      ? error.message
      : process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : error.message;

    return res.status(statusCode).json({ success: false, message, code: error.code || 'INTERNAL_ERROR' });
  }
}

module.exports = BaseController;
