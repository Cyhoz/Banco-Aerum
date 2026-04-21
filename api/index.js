const express = require('express');
const app = express();

// ENDPOINT DE DIAGNÓSTICO (Debe ir arriba para que funcione incluso si el backend falla)
app.get('/api/debug-vars', (req, res) => {
  res.json({
    supabaseUrlSet: !!process.env.SUPABASE_URL,
    supabaseUrlLength: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.length : 0,
    supabaseAnonKeySet: !!process.env.SUPABASE_ANON_KEY,
    allAvailableEnvs: Object.keys(process.env).filter(k => !k.includes('TOKEN') && !k.includes('SECRET')),
    vercelEnv: process.env.VERCEL_ENV || 'local'
  });
});

try {
  const backend = require('../backend/src/index.js');
  // Usar el backend como middleware
  app.use(backend);
} catch (error) {
  console.error('Error al cargar el backend:', error);
  app.use((req, res) => {
    res.status(500).json({
      error: 'Fallo crítico al iniciar el servidor de funciones',
      details: error.message,
      note: 'Si supabaseUrl is required, las variables de entorno NO están llegando al servidor.',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
}

module.exports = app;
