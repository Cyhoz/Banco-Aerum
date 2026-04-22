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
  const { account_id, amount, description, type, recipient_account_number } = req.body;

  if (!account_id || !amount || !type) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    // 1. Verificar que la cuenta de origen pertenece al usuario
    const { data: senderAccount, error: senderError } = await supabase
      .from('accounts')
      .select('id, balance, account_number')
      .eq('id', account_id)
      .eq('user_id', req.user.id)
      .single();

    if (senderError || !senderAccount) {
      return res.status(403).json({ error: 'No tienes permiso sobre esta cuenta o no existe' });
    }

    if (type === 'TRANSFERENCIA') {
      if (!recipient_account_number) {
        return res.status(400).json({ error: 'Debes proporcionar un número de cuenta de destino' });
      }

      if (senderAccount.account_number === recipient_account_number) {
        return res.status(400).json({ error: 'No puedes transferir a tu propia cuenta' });
      }

      // 2. Buscar cuenta de destino
      const { data: recipientAccount, error: recipientError } = await supabase
        .from('accounts')
        .select('id, balance')
        .eq('account_number', recipient_account_number)
        .single();

      if (recipientError || !recipientAccount) {
        return res.status(404).json({ error: 'La cuenta de destino no existe en nuestra base de datos' });
      }

      if (senderAccount.balance < amount) {
        return res.status(400).json({ error: 'Saldo insuficiente para realizar la transferencia' });
      }

      // 3. Registrar transacción de salida (Emisor)
      await supabase.from('transactions').insert([{ 
        account_id: senderAccount.id, 
        amount, 
        description: description || `Transferencia enviada a ${recipient_account_number}`, 
        type: 'TRANSFERENCIA' 
      }]);

      // 4. Registrar transacción de entrada (Receptor)
      await supabase.from('transactions').insert([{ 
        account_id: recipientAccount.id, 
        amount, 
        description: `Transferencia recibida de ${senderAccount.account_number}`, 
        type: 'CREDITO' 
      }]);

      // 5. Actualizar saldos
      await supabase.from('accounts').update({ balance: senderAccount.balance - amount }).eq('id', senderAccount.id);
      await supabase.from('accounts').update({ balance: recipientAccount.balance + amount }).eq('id', recipientAccount.id);

      return res.status(201).json({ message: 'Transferencia realizada con éxito', newBalance: senderAccount.balance - amount });

    } else {
      // Lógica para DEPÓSITOS o RETIROS simples
      const isSubtraction = type === 'DEBITO' || type === 'RETIRO';
      const newBalance = isSubtraction ? senderAccount.balance - amount : senderAccount.balance + amount;

      if (isSubtraction && senderAccount.balance < amount) {
        return res.status(400).json({ error: 'Saldo insuficiente' });
      }

      const { data: transaction, error: tError } = await supabase
        .from('transactions')
        .insert([{ account_id, amount, description, type }])
        .select()
        .single();

      if (tError) return res.status(400).json({ error: tError.message });

      await supabase.from('accounts').update({ balance: newBalance }).eq('id', account_id);

      res.status(201).json({ message: 'Operación realizada con éxito', transaction, newBalance });
    }
  } catch (err) {
    console.error('Error procesando transacción:', err);
    res.status(500).json({ error: 'Error al procesar la operación' });
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
