const Joi = require('joi');

const criarItemSchema = Joi.object({
  nome:       Joi.string().trim().min(2).max(120).required(),
  descricao:  Joi.string().trim().max(500).allow('', null).default(null),
  preco:      Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Preço deve ser um valor positivo',
  }),
  imagem:     Joi.string().uri().allow('', null).default(null),
  disponivel: Joi.boolean().default(true),
});

const editarItemSchema = Joi.object({
  nome:       Joi.string().trim().min(2).max(120),
  descricao:  Joi.string().trim().max(500).allow('', null),
  preco:      Joi.number().positive().precision(2),
  imagem:     Joi.string().uri().allow('', null),
  disponivel: Joi.boolean(),
  categoria_id: Joi.number().integer().positive(),
}).min(1);

const disponibilidadeSchema = Joi.object({
  disponivel: Joi.boolean().required().messages({
    'any.required': 'Campo "disponivel" é obrigatório',
  }),
});

module.exports = { criarItemSchema, editarItemSchema, disponibilidadeSchema };
