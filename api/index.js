const express = require('express');
const app = express();

try {
  const backend = require('../backend/src/index.js');
  // Usar el backend como middleware
  app.use(backend);
} catch (error) {
  console.error('Error al cargar el backend:', error);
  app.use((req, res) => {
    res.status(500).json({
      error: 'Error interno en el servidor de funciones',
      message: 'No se pudo iniciar el servicio bancario. Contacte al administrador.'
    });
  });
}

module.exports = app;
