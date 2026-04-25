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
        url: 'https://banco-aerum.vercel.app',
        description: 'Servidor de Producción (Vercel)',
      },
      {
        url: 'http://localhost:5001',
        description: 'Servidor Local (Desarrollo)',
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
  apis: [require('path').join(__dirname, '../routes/*.js')], // Ruta absoluta para compatibilidad con Vercel
};

const specs = swaggerJsdoc(options);

module.exports = specs;
