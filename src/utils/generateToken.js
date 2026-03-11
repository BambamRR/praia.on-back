const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Gera um JWT assinado com payload dado.
 * @param {{ id: number, email: string, perfil_id: number }} payload
 * @returns {string}
 */
const generateToken = (payload) =>
  jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

module.exports = generateToken;
