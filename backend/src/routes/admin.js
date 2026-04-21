const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authenticateToken = require('../middleware/authMiddleware');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Middleware para verificar si es administrador
const isAdmin = (req, res, next) => {
  const role = req.user.user_metadata?.role || req.user.role;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: Se requieren permisos de administrador' });
  }
  next();
};

router.use(authenticateToken);
router.use(isAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Gestión administrativa de usuarios
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Listar todos los usuarios (Solo Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users', async (req, res) => {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return res.status(400).json({ error: error.message });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al listar usuarios' });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Crear un nuevo usuario (Solo Admin)
 *     tags: [Admin]
 */
router.post('/users', async (req, res) => {
  const { email, password, full_name, role } = req.body;
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name, role: role || 'user' },
      email_confirm: true
    });

    if (error) return res.status(400).json({ error: error.message });
    
    // Crear cuenta bancaria inicial
    const accountNumber = '99' + Math.floor(10000000 + Math.random() * 90000000);
    await supabaseAdmin
      .from('accounts')
      .insert([
        { 
          user_id: user.id, 
          account_number: accountNumber, 
          balance: 50.00 
        }
      ]);

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al crear usuario' });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario (Solo Admin)
 *     tags: [Admin]
 */
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Primero eliminar cuenta y transacciones si fuera necesario (Supabase Cascade suele manejar esto si está configurado)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Usuario eliminado con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor al eliminar usuario' });
  }
});

module.exports = router;
