/**
 * Formata respostas HTTP padronizadas.
 */

const success = (data, message = 'OK') => ({
  success: true,
  message,
  data,
});

const error = (message = 'Erro interno', code = 'INTERNAL_ERROR') => ({
  success: false,
  message,
  code,
});

const paginated = (data, total, page, limit) => ({
  success: true,
  data,
  pagination: {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  },
});

module.exports = { success, error, paginated };
