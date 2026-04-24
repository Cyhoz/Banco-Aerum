const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Banca en Línea API',
      version: '1.0.0',
      description: 'Documentación de la API para el sistema de Banca en Línea con Supabase',
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Servidor Local (Desarrollo)',
      },
      {
        url: '/api',
        description: 'Servidor de Producción (Vercel)',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Ruta a los archivos de rutas para extraer las anotaciones
};

const specs = swaggerJsdoc(options);

module.exports = specs;
