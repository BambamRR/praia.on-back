const logger = require('../config/logger');
const AppError = require('../utils/AppError');

/**
 * Error Handler global — deve ser o último middleware.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  /* Erros de validação Sequelize */
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Erro de validação',
      code:    'VALIDATION_ERROR',
      errors:  messages,
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'campo';
    return res.status(409).json({
      success: false,
      message: `${field} já está em uso`,
      code:    'CONFLICT',
    });
  }

  /* Erros operacionais (AppError) */
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code:    'OPERATIONAL_ERROR',
    });
  }

  /* Erros inesperados — logar e retornar 500 */
  logger.error('Erro interno inesperado', {
    message: err.message,
    stack:   err.stack,
    path:    req.path,
    method:  req.method,
  });
  console.error('[errorHandler] Erro interno inesperado:', err);

  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message,
    code:    'INTERNAL_SERVER_ERROR',
  });
};

module.exports = errorHandler;
