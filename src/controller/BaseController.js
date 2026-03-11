const formatResponse = require('../utils/formatResponse');
const logger         = require('../config/logger');

/**
 * BaseController — todos os controllers herdam desta classe.
 * Fornece handleSuccess e handleError padronizados.
 */
class BaseController {
  handleSuccess(res, data, message = 'OK', statusCode = 200) {
    return res.status(statusCode).json(formatResponse.success(data, message));
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

    return res.status(statusCode).json(formatResponse.error(message));
  }
}

module.exports = BaseController;
