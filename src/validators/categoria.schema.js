const Joi = require('joi');

const criarCategoriaSchema = Joi.object({
  nome:  Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min':   'Nome deve ter ao menos 2 caracteres',
  }),
  ativo: Joi.boolean().default(true),
});

const editarCategoriaSchema = Joi.object({
  nome:  Joi.string().trim().min(2).max(100).messages({
    'string.min': 'Nome deve ter ao menos 2 caracteres',
  }),
  ativo: Joi.boolean(),
}).min(1);

module.exports = { criarCategoriaSchema, editarCategoriaSchema };
