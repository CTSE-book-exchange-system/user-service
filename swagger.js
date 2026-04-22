const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 3001;
const serverUrl = process.env.API_BASE_URL || `http://localhost:${PORT}`;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Service API',
      version: '1.0.0',
      description: 'API documentation for the ReRead user service.',
    },
    servers: [
      {
        url: serverUrl,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { oneOf: [{ type: 'string' }, { type: 'array' }] },
            statusCode: { type: 'integer', example: 400 },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
        SavedSearch: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            user_id: { type: 'string', example: '1' },
            module_code: { type: 'string', example: 'CS101' },
            keyword: { type: 'string', example: 'algorithms' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            name: { type: 'string', example: 'Jane Student' },
            email: { type: 'string', format: 'email', example: 'jane@example.com' },
            university: { type: 'string', example: 'Example University' },
            course: { type: 'string', example: 'Computer Science' },
            year: { type: 'integer', example: 2 },
            role: { type: 'string', example: 'student' },
          },
        },
      },
    },
    paths: {
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Check service health',
          responses: {
            200: {
              description: 'Service is healthy',
            },
          },
        },
      },
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Jane Student' },
                    email: { type: 'string', format: 'email', example: 'jane@example.com' },
                    password: { type: 'string', format: 'password', example: 'Password1' },
                    university: { type: 'string', example: 'Example University' },
                    course: { type: 'string', example: 'Computer Science' },
                    year: { type: 'integer', example: 2 },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User registered',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            400: {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Log in with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email', example: 'jane@example.com' },
                    password: { type: 'string', format: 'password', example: 'Password1' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
          },
        },
      },
      '/api/auth/validate': {
        post: {
          tags: ['Auth'],
          summary: 'Validate a JWT',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token'],
                  properties: {
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Token is valid',
            },
            401: {
              description: 'Token is invalid',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ApiError' },
                },
              },
            },
          },
        },
      },
      '/api/auth/google': {
        get: {
          tags: ['Auth'],
          summary: 'Start Google OAuth sign-in',
          responses: {
            302: {
              description: 'Redirects to Google OAuth',
            },
            503: {
              description: 'Google OAuth is not configured',
            },
          },
        },
      },
      '/api/auth/google/callback': {
        get: {
          tags: ['Auth'],
          summary: 'Handle Google OAuth callback',
          responses: {
            302: {
              description: 'Redirects to the frontend OAuth callback page',
            },
            503: {
              description: 'Google OAuth is not configured',
            },
          },
        },
      },
      '/api/users/search': {
        get: {
          tags: ['Users'],
          summary: 'Search users',
          parameters: [
            {
              in: 'query',
              name: 'university',
              schema: { type: 'string' },
            },
            {
              in: 'query',
              name: 'course',
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Users fetched',
            },
          },
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get a user by ID',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'User fetched',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/User' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            404: {
              description: 'User not found',
            },
          },
        },
        put: {
          tags: ['Users'],
          summary: 'Update a user profile',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: 'Jane Student' },
                    course: { type: 'string', example: 'Computer Science' },
                    year: { type: 'integer', example: 2 },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'User updated',
            },
            401: {
              description: 'Missing or invalid token',
            },
            403: {
              description: 'Not allowed to update this user',
            },
          },
        },
      },
      '/api/users/{id}/saved-searches': {
        get: {
          tags: ['Saved Searches'],
          summary: 'Get saved searches for a user',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: {
              description: 'Saved searches fetched',
            },
            403: {
              description: 'Not allowed to view saved searches for this user',
            },
          },
        },
        post: {
          tags: ['Saved Searches'],
          summary: 'Create a saved search for a user',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    moduleCode: { type: 'string', example: 'CS101' },
                    keyword: { type: 'string', example: 'algorithms' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Saved search created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/SavedSearch' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid saved search request',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
