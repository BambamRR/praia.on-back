const Joi = require('joi');

const registerSchema = Joi.object({
  nome:     Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Nome é obrigatório',
    'string.min':   'Nome deve ter no mínimo 2 caracteres',
  }),
  email:    Joi.string().email().required().messages({
    'string.email': 'E-mail inválido',
    'string.empty': 'E-mail é obrigatório',
  }),
  senha:    Joi.string().min(6).required().messages({
    'string.min':   'Senha deve ter no mínimo 6 caracteres',
    'string.empty': 'Senha é obrigatória',
  }),
  telefone: Joi.string().max(20).optional().allow(''),
  cpf:      Joi.string().max(14).optional().allow(''),
  rg:       Joi.string().max(20).optional().allow(''),
  endereco: Joi.string().max(255).optional().allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'E-mail inválido',
    'string.empty': 'E-mail é obrigatório',
  }),
  senha: Joi.string().required().messages({
    'string.empty': 'Senha é obrigatória',
  }),
});

module.exports = { registerSchema, loginSchema };
