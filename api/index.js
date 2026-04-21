// Diagnóstico y Proxy para Vercel
try {
  const app = require('../backend/src/index.js');

  // Middleware de diagnóstico para verificar variables en producción
  app.get('/api/debug-vars', (req, res) => {
    res.json({
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || 'local'
    });
  });

  module.exports = app;
} catch (error) {
  console.error('Error al cargar el backend:', error);
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Fallo crítico al iniciar el servidor de funciones',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  };
}
