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

// NUEVA RUTA: Listar usuarios con su saldo y cuenta para la vista principal
router.get('/users-summary', async (req, res) => {
  try {
    const { data: { users }, error: uError } = await supabaseAdmin.auth.admin.listUsers();
    if (uError) return res.status(400).json({ error: uError.message });

    const { data: accounts, error: aError } = await supabaseAdmin
      .from('accounts')
      .select('user_id, account_number, balance');

    const combined = users.map(user => {
      const acc = accounts.find(a => a.user_id === user.id);
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'Sin nombre',
        role: user.user_metadata?.role || 'user',
        last_sign_in: user.last_sign_in_at,
        account_number: acc?.account_number || 'Sin cuenta',
        balance: acc?.balance || 0
      };
    });

    res.json(combined);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener resumen de usuarios' });
  }
});

// NUEVA RUTA: Detalle completo de un usuario (Movimientos + Auditoría)
router.get('/users/:id/detail', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: { user }, error: uError } = await supabaseAdmin.auth.admin.getUserById(id);
    if (uError) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { data: account, error: aError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', id)
      .single();

    let transactions = [];
    if (account) {
      const { data: txs } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('account_id', account.id)
        .order('created_at', { ascending: false });
      transactions = txs || [];
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        last_login: user.last_sign_in_at,
        created_at: user.created_at
      },
      account,
      transactions
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener detalle del usuario' });
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
 *   put:
 *     summary: Actualizar datos de un usuario (Solo Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado con éxito
 */
router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, role } = req.body;
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: { full_name, role }
    });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Usuario actualizado con éxito', user: data.user });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
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
