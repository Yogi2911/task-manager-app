const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'A simple Task Manager REST API with full CRUD operations, documented with Swagger/OpenAPI.',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local development server',
      },
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          required: ['title'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Auto-generated unique identifier',
              readOnly: true,
            },
            title: {
              type: 'string',
              description: 'Title of the task',
              example: 'Buy groceries',
            },
            description: {
              type: 'string',
              description: 'Optional detailed description',
              example: 'Milk, eggs, bread',
            },
            completed: {
              type: 'boolean',
              description: 'Whether the task is completed',
              default: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              readOnly: true,
            },
          },
        },
        TaskInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', example: 'Buy groceries' },
            description: { type: 'string', example: 'Milk, eggs, bread' },
            completed: { type: 'boolean', example: false },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
