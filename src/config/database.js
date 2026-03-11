require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT) || 5432,
    dialect:  'postgres',
    logging:  process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: process.env.DB_USER   || 'praion',
    password: process.env.DB_PASS   || 'praion123',
    database: process.env.DB_NAME   ? `${process.env.DB_NAME}_test` : 'praion_test',
    host:     process.env.DB_HOST   || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 5432,
    dialect:  'postgres',
    logging:  false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT) || 5432,
    dialect:  'postgres',
    logging:  false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },
  },
};
