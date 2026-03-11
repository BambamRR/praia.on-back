const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 min

/**
 * Rate limiter geral: 100 req / 15 min por IP
 */
const generalLimiter = rateLimit({
  windowMs,
  max:     parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
    code:    'TOO_MANY_REQUESTS',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

/**
 * Rate limiter para auth: 10 req / 15 min por IP
 */
const authLimiter = rateLimit({
  windowMs,
  max:     parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: {
    success: false,
    message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
    code:    'TOO_MANY_AUTH_ATTEMPTS',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

module.exports = { generalLimiter, authLimiter };
