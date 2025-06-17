const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gerenciamento de Usuários',
      version: '1.0.0',
      description: 'API RESTful em JavaScript com Node.js para gerenciamento de usuários',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./src/routes/*.js'], // arquivos que contêm anotações do Swagger
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
