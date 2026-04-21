const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authenticateToken = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Gestión de cuentas bancarias
 */

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Obtener todas las cuentas del usuario autenticado
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cuentas obtenida con éxito
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las cuentas' });
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
