const swaggerJsdoc = require('swagger-jsdoc');

const serverUrl = process.env.API_BASE_URL || '/';

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ReRead - User Service',
      version: '1.0.0',
      description: 'User authentication, profile, and saved search management for the ReRead platform',
    },
    servers: [{ url: serverUrl }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.js'],
});
