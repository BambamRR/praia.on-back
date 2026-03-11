const AppError = require('../utils/AppError');

/**
 * Middleware factory de validação Joi.
 * @param {import('joi').Schema} schema
 * @param {'body'|'query'|'params'} target
 */
const validate = (schema, target = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[target], {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join('; ');
    return next(new AppError(messages, 400));
  }

  req[target] = value;
  return next();
};

module.exports = validate;
