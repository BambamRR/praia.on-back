/**
 * Wrapper para route handlers async.
 * Captura rejeições e passa para next(err) → errorHandler.
 */
const asyncErrorWrapper = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncErrorWrapper;
