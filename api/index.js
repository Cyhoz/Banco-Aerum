// Diagnóstico y Proxy para Vercel
try {
  const app = require('../backend/src/index.js');

  // Middleware de diagnóstico avanzado
  app.get('/api/debug-vars', (req, res) => {
    const envKeys = Object.keys(process.env).filter(k => 
      !k.includes('TOKEN') && !k.includes('SECRET') && !k.includes('KEY') && !k.includes('PASSWORD')
    );
    res.json({
      supabaseUrlSet: !!process.env.SUPABASE_URL,
      supabaseUrlLength: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.length : 0,
      supabaseAnonKeySet: !!process.env.SUPABASE_ANON_KEY,
      allAvailableEnvs: envKeys,
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
