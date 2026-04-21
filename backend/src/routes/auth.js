const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación de usuarios
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               full_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado con éxito
 *       400:
 *         description: Error en los datos proporcionados
 */
router.post('/signup', async (req, res) => {
  const { email, password, full_name } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name
        }
      }
    });

    if (error) return res.status(400).json({ error: error.message });

    // Crear una cuenta bancaria inicial para el usuario
    if (data.user) {
      const accountNumber = '99' + Math.floor(10000000 + Math.random() * 90000000);
      const { error: accError } = await supabase
        .from('accounts')
        .insert([
          { 
            user_id: data.user.id, 
            account_number: accountNumber, 
            balance: 50.00 // Saldo inicial de cortesía
          }
        ]);
      
      if (accError) {
        console.error('Error creating initial account:', accError.message);
      }
    }

    res.status(201).json({ message: 'Usuario registrado con éxito', user: data.user });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor durante el registro' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       400:
 *         description: Credenciales inválidas
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return res.status(400).json({ error: error.message });

    // Verificar si el usuario ya tiene una cuenta bancaria, si no, crearla
    const { data: accounts } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', data.user.id);
    
    if (!accounts || accounts.length === 0) {
      const accountNumber = '99' + Math.floor(10000000 + Math.random() * 90000000);
      await supabase
        .from('accounts')
        .insert([
          { 
            user_id: data.user.id, 
            account_number: accountNumber, 
            balance: 50.00 
          }
        ]);
    }

    res.status(200).json({ 
      message: 'Inicio de sesión exitoso', 
      token: data.session.access_token,
      user: data.user 
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor durante el inicio de sesión' });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 */
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor al cerrar sesión' });
  }
});

module.exports = router;
