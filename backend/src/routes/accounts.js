const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', authenticateToken, async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  console.log('--- FETCHING ACCOUNTS ---');
  console.log('User ID from token:', req.user.id);
  try {
    // 1. Intentar obtener cuentas existentes
    console.log('Querying DB for user:', req.user.id);
    let { data, error } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', req.user.id);
    
    console.log('DB Results found:', data?.length || 0);

    if (error) {
      console.error('DB Error:', error);
      return res.status(400).json({ error: error.message });
    }

    // 2. Si no hay cuentas, crear una automáticamente (Self-healing)
    if (!data || data.length === 0) {
      console.log(`EMERGENCIA: Auto-creando cuenta para usuario: ${req.user.id}`);
      const accountNumber = '99' + Math.floor(10000000 + Math.random() * 90000000);
      const { data: newAcc, error: createError } = await supabaseAdmin
        .from('accounts')
        .insert([
          { 
            user_id: req.user.id, 
            account_number: accountNumber, 
            balance: 50.00 
          }
        ])
        .select();

      if (createError) throw createError;
      data = newAcc;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('Error en /api/accounts:', err);
    res.status(500).json({ error: 'Error al procesar las cuentas' });
  }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Obtener detalle de una cuenta específica
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cuenta
 *     responses:
 *       200:
 *         description: Detalle de la cuenta obtenido con éxito
 *       404:
 *         description: Cuenta no encontrada
 */
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el detalle de la cuenta' });
  }
});

module.exports = router;
