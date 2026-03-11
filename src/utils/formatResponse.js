/**
 * Utilitários de resposta HTTP padronizados.
 *
 * Assinatura: formatResponse.success(res, data, statusCode?)
 *             formatResponse.error(res, message, statusCode?, code?)
 *             formatResponse.paginated(res, data, total, page, limit)
 */

const success = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

const error = (res, message = 'Erro interno', statusCode = 500, code = 'INTERNAL_ERROR') =>
  res.status(statusCode).json({ success: false, message, code });

const paginated = (res, data, total, page, limit) =>
  res.status(200).json({
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
