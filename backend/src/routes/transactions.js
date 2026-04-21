const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authenticateToken = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Registro e historial de transacciones
 */

/**
 * @swagger
 * /api/transactions/{account_id}:
 *   get:
 *     summary: Obtener historial de transacciones de una cuenta
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: account_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la cuenta
 *     responses:
 *       200:
 *         description: Lista de transacciones obtenida con éxito
 */
router.get('/:account_id', authenticateToken, async (req, res) => {
  const { account_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', account_id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las transacciones' });
  }
});

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Registrar una nueva transacción
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - account_id
 *               - amount
 *               - type
 *             properties:
 *               account_id:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [DEBITO, CREDITO, TRANSFERENCIA, RETIRO]
 *     responses:
 *       201:
 *         description: Transacción registrada con éxito
 */
router.post('/', authenticateToken, async (req, res) => {
  const { account_id, amount, description, type } = req.body;

  try {
    // 1. Registrar la transacción
    const { data: transaction, error: tError } = await supabase
      .from('transactions')
      .insert([{ account_id, amount, description, type }])
      .select()
      .single();

    if (tError) return res.status(400).json({ error: tError.message });

    // 2. Actualizar el saldo de la cuenta (Lógica simplificada)
    const { data: account, error: aError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', account_id)
      .single();

    if (!aError) {
      const newBalance = type === 'DEBITO' || type === 'RETIRO' || type === 'TRANSFERENCIA_ENVIADA'
        ? account.balance - amount
        : account.balance + amount;

      await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', account_id);
    }

    res.status(201).json({ message: 'Transacción registrada con éxito', transaction });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la transacción' });
  }
});

/**
 * @swagger
 * /api/transactions/admin/all:
 *   get:
 *     summary: (ADMIN) Obtener todas las transacciones de todos los usuarios
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de transacciones obtenida con éxito
 */
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    // Verificar si el usuario es admin (Lógica simple basada en metadatos o email específico)
    // En un entorno real, usaríamos un middleware de autorización más robusto.
    const isAdmin = req.user.user_metadata?.role === 'admin' || req.user.email.includes('admin');
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acceso denegado: Se requieren permisos de administrador' });
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*, accounts(account_number)')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener todas las transacciones' });
  }
});

module.exports = router;
