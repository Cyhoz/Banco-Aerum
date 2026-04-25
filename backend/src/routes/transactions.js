const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const authenticateToken = require('../middleware/authMiddleware');
const axios = require('axios');

// Clave compartida para la clase (en un entorno real iría en .env)
const SHARED_SECRET = process.env.INTERBANK_SECRET || 'CLAVE_SECRETA_CLASE_2026';

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
    const { data, error } = await supabaseAdmin
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
 * /api/transactions/interbank/receive:
 *   post:
 *     summary: Recibir transferencia de otro banco (Solo con Secret Key)
 *     tags: [Transactions]
 */
router.post('/interbank/receive', async (req, res) => {
  const { monto, cuenta_destino, banco_origen, clave_secreta, descripcion } = req.body;

  if (clave_secreta !== SHARED_SECRET) {
    return res.status(401).json({ error: 'Llave de seguridad inválida' });
  }

  try {
    // 1. Buscar cuenta local
    const { data: recipient, error: rError } = await supabaseAdmin
      .from('accounts')
      .select('id, balance')
      .eq('account_number', cuenta_destino)
      .single();

    if (rError || !recipient) {
      return res.status(404).json({ error: 'Cuenta no encontrada en Banco Aerum' });
    }

    // 2. Registrar transacción de entrada
    await supabaseAdmin.from('transactions').insert([{ 
      account_id: recipient.id, 
      amount: monto, 
      description: descripcion || `Recibido de ${banco_origen}`, 
      type: 'CREDITO' 
    }]);

    // 3. Sumar saldo
    await supabaseAdmin.from('accounts').update({ balance: recipient.balance + monto }).eq('id', recipient.id);

    res.json({ success: true, message: 'Transferencia interbancaria recibida con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error procesando recepción interbancaria' });
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
  const { account_id, amount, description, type, recipient_account_number, external_url } = req.body;

  if (!account_id || !amount || !type) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const { data: senderAccount, error: senderError } = await supabaseAdmin
      .from('accounts')
      .select('id, balance, account_number')
      .eq('id', account_id)
      .eq('user_id', req.user.id)
      .single();

    if (senderError || !senderAccount) {
      return res.status(403).json({ error: 'No tienes permiso sobre esta cuenta o no existe' });
    }

    if (senderAccount.balance < amount) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // --- ESCUDO DE SEGURIDAD: EVITAR CARGOS PEQUEÑOS (COMO LOS $6) ---
    if (amount < 10) {
      return res.status(400).json({ error: 'El monto mínimo de transferencia es de $10. Operación cancelada por seguridad.' });
    }

    if (type === 'TRANSFERENCIA') {
      if (!recipient_account_number) {
        return res.status(400).json({ error: 'Debes proporcionar un número de cuenta' });
      }

      // Auditing metadata
      const userAgent = req.headers['user-agent'] || 'Desconocido';
      const auditData = {
        browser: req.body.browser || userAgent,
        device: req.body.device || 'Desconocido',
        location: req.body.location || 'Desconocido'
      };

      // --- LÓGICA INTERBANCARIA (EXTERNA) ---
      if (external_url) {
        try {
          // Intentar enviar al otro banco
          const response = await axios.post(`${external_url}/api/transactions/interbank/receive`, {
            monto: amount,
            cuenta_destino: recipient_account_number,
            banco_origen: 'Banco Aerum',
            clave_secreta: SHARED_SECRET,
            descripcion: description
          });

          if (response.data.success) {
             // Registrar salida local con auditoría
             await supabaseAdmin.from('transactions').insert([{ 
                account_id: senderAccount.id, 
                amount, 
                description: `Transferencia Interbancaria a cuenta ${recipient_account_number}`, 
                type: 'TRANSFERENCIA',
                browser: auditData.browser,
                device: auditData.device,
                location: auditData.location
             }]);
             // Restar saldo
             await supabaseAdmin.from('accounts').update({ balance: senderAccount.balance - amount }).eq('id', senderAccount.id);
             return res.json({ message: 'Transferencia interbancaria enviada con éxito', newBalance: senderAccount.balance - amount });
          }
        } catch (err) {
          return res.status(400).json({ error: 'El banco destino no respondió o rechazó la operación: ' + (err.response?.data?.error || err.message) });
        }
      }

      // --- LÓGICA LOCAL ---
      if (senderAccount.account_number === recipient_account_number) {
        return res.status(400).json({ error: 'No puedes transferir a tu propia cuenta' });
      }

      const { data: recipientAccount, error: recipientError } = await supabaseAdmin
        .from('accounts')
        .select('id, balance')
        .eq('account_number', recipient_account_number)
        .single();

      if (recipientError || !recipientAccount) {
        return res.status(404).json({ error: 'La cuenta no existe en Banco Aerum' });
      }

      // Emisor
      await supabaseAdmin.from('transactions').insert([{ 
        account_id: senderAccount.id, 
        amount, 
        description: description || `Transferencia enviada a ${recipient_account_number}`, 
        type: 'TRANSFERENCIA',
        browser: auditData.browser,
        device: auditData.device,
        location: auditData.location
      }]);

      // Receptor (Auditoría opcional aquí, pero la guardamos del emisor para rastreo)
      await supabaseAdmin.from('transactions').insert([{ 
        account_id: recipientAccount.id, 
        amount, 
        description: `Transferencia recibida de ${senderAccount.account_number}`, 
        type: 'CREDITO',
        browser: 'Sistema (Interno)',
        device: 'Servidor',
        location: 'Red Aerum'
      }]);

      await supabaseAdmin.from('accounts').update({ balance: senderAccount.balance - amount }).eq('id', senderAccount.id);
      await supabaseAdmin.from('accounts').update({ balance: recipientAccount.balance + amount }).eq('id', recipientAccount.id);

      return res.status(201).json({ message: 'Transferencia realizada con éxito', newBalance: senderAccount.balance - amount });

    } else {
      const isSubtraction = type === 'DEBITO' || type === 'RETIRO';
      const newBalance = isSubtraction ? senderAccount.balance - amount : senderAccount.balance + amount;

      // Auditing metadata para depósitos/retiros
      const userAgent = req.headers['user-agent'] || 'Desconocido';
      const auditData = {
        browser: req.body.browser || userAgent,
        device: req.body.device || 'Desconocido',
        location: req.body.location || 'Desconocido'
      };

      const { data: transaction, error: tError } = await supabaseAdmin
        .from('transactions')
        .insert([{ 
          account_id, 
          amount, 
          description, 
          type,
          browser: auditData.browser,
          device: auditData.device,
          location: auditData.location
        }])
        .select()
        .single();

      if (tError) return res.status(400).json({ error: tError.message });
      
      console.log(`--- ACTUALIZANDO SALDO ---`);
      console.log(`Cuenta ID: ${account_id}`);
      console.log(`Nuevo Saldo Calculado: ${newBalance}`);
      
      const { error: uError } = await supabaseAdmin.from('accounts').update({ balance: newBalance }).eq('id', account_id);
      if (uError) console.error('Error actualizando saldo:', uError.message);
      
      res.status(201).json({ message: 'Operación realizada con éxito', transaction, newBalance });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error interno en la operación' });
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

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('*, accounts(account_number, user_id)')
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener todas las transacciones' });
  }
});

module.exports = router;
