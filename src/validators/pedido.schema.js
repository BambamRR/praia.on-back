const Joi = require('joi');

const itemSchema = Joi.object({
  id:         Joi.number().integer().positive().required(),
  nome:       Joi.string().required(),
  quantidade: Joi.number().integer().min(1).required(),
  preco:      Joi.number().positive().required(),
  observacao: Joi.string().max(500).optional().allow(''),
});

const createPedidoSchema = Joi.object({
  mesaId:    Joi.number().integer().positive().required().messages({
    'number.base': 'mesaId deve ser um número',
    'any.required': 'mesaId é obrigatório',
  }),
  itens:     Joi.array().items(itemSchema).min(1).required().messages({
    'array.min':  'Pedido deve ter ao menos 1 item',
    'any.required': 'itens são obrigatórios',
  }),
  total:     Joi.number().positive().required(),
  observacao: Joi.string().max(500).optional().allow(''),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('novo', 'preparando', 'pronto', 'entregue', 'cancelado')
    .required()
    .messages({
      'any.only': 'Status inválido. Valores aceitos: novo, preparando, pronto, entregue, cancelado',
    }),
});

module.exports = { createPedidoSchema, updateStatusSchema };
