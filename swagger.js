const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 3001;

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ReRead - User Service',
      version: '1.0.0',
      description: 'User authentication, profile, and saved search management for the ReRead platform',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.js'],
});
