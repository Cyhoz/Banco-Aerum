const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso no proporcionado' });
  }

  // 1. Intentar validar como Token Propio (JWT Secret)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    // Si falla, pasamos al siguiente método de validación
    console.log('No es un token propio, probando con Supabase...');
  }

  // 2. Intentar validar como Token de Supabase
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({ error: 'Token inválido, alterado o expirado' });
    }

    // Normalizar el objeto user para que coincida con el formato del JWT propio
    req.user = {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
      role: user.user_metadata?.role || 'user'
    };
    
    next();
  } catch (err) {
    console.error('Auth Error:', err.message);
    return res.status(403).json({ error: 'Error de autenticación' });
  }
};

module.exports = authenticateToken;
