require('dotenv').config();

module.exports = {
  secret:    process.env.JWT_SECRET    || 'praion_dev_secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
