const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'PraiOn API',
      version:     '1.0.0',
      description: 'Backend da plataforma PraiOn — sistema de atendimento digital para restaurantes e bares de praia.',
      contact:     { name: 'PraiOn Dev Team' },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Desenvolvimento' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js', './src/docs/*.yaml'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
