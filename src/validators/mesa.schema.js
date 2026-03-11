const Joi = require('joi');

const criarMesaSchema = Joi.object({
  numero:    Joi.number().integer().positive().required().messages({
    'number.positive': 'Número da mesa deve ser positivo',
    'any.required':    'Número da mesa é obrigatório',
  }),
  capacidade: Joi.number().integer().positive().max(30).default(4),
});

module.exports = { criarMesaSchema };
