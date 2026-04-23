const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Usamos el cliente admin para poder actualizar saldos de cualquier usuario
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// CLAVE DE SEGURIDAD INTERBANCARIA (Comparte esta clave solo con tus compañeros)
const INTERBANK_KEY = "AERUM-BRIDGE-2026";

/**
 * Endpoint para recibir dinero de otros bancos
 * POST /api/interbank/receive
 */
router.post('/receive', async (req, res) => {
  const { account_number, amount, from_bank, description, api_key } = req.body;

  // 1. Validar Clave de Seguridad
  if (api_key !== INTERBANK_KEY) {
    return res.status(401).json({ error: 'API Key interbancaria inválida' });
  }

  // 2. Validar Datos
  if (!account_number || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Datos de transferencia incompletos o inválidos' });
  }

  try {
    // 3. Buscar la cuenta destino en Banco Aerum
    const { data: account, error: accError } = await supabaseAdmin
      .from('accounts')
      .select('id, balance')
      .eq('account_number', account_number)
      .single();

    if (accError || !account) {
      return res.status(404).json({ error: 'La cuenta destino no existe en Banco Aerum' });
    }

    // 4. Registrar la Transacción
    const { error: txError } = await supabaseAdmin.from('transactions').insert([{
      account_id: account.id,
      amount: parseFloat(amount),
      description: `[INTERBANCARIO] De: ${from_bank || 'Otro Banco'} - ${description || 'Sin descripción'}`,
      type: 'CREDITO'
    }]);

    if (txError) throw txError;

    // 5. Actualizar Saldo
    const { error: upError } = await supabaseAdmin
      .from('accounts')
      .update({ balance: account.balance + parseFloat(amount) })
      .eq('id', account.id);

    if (upError) throw upError;

    res.json({ 
      success: true, 
      message: 'Transferencia interbancaria recibida con éxito',
      new_balance: account.balance + parseFloat(amount)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno al procesar transferencia interbancaria' });
  }
});

module.exports = router;
