const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

/**
 * Gera o hash bcrypt de uma senha em texto puro.
 * @param {string} plain
 * @returns {Promise<string>}
 */
const hashPassword = async (plain) => bcrypt.hash(plain, SALT_ROUNDS);

/**
 * Compara senha em texto puro com o hash armazenado.
 * @param {string} plain
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (plain, hash) => bcrypt.compare(plain, hash);

module.exports = { hashPassword, comparePassword };
