const { Router }  = require('express');
const models       = require('../models');
const MesaService  = require('../service/MesaService');
const MesaController = require('../controller/MesaController');
const authMiddleware = require('../middlewares/authMiddleware');
const asyncErrorWrapper = require('../utils/asyncErrorWrapper');

const router = Router({ mergeParams: true });

const mesaService    = new MesaService(models);
const mesaController = new MesaController(mesaService);

/**
 * @swagger
 * /api/mesas/{mesaId}/chamar-garcom:
 *   post:
 *     summary: Chamar garçom para uma mesa
 *     tags: [Mesas]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: mesaId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Garçom chamado com sucesso }
 *       404: { description: Mesa não encontrada }
 */
router.post(
  '/:mesaId/chamar-garcom',
  asyncErrorWrapper((req, res) => mesaController.chamarGarcom(req, res))
);

/**
 * @swagger
 * /api/mesas/{mesaId}/pedidos:
 *   get:
 *     summary: Pedidos de uma mesa (ordem decrescente)
 *     tags: [Mesas]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: mesaId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de pedidos da mesa }
 */
router.get(
  '/:mesaId/pedidos',
  authMiddleware,
  asyncErrorWrapper((req, res) => mesaController.getPedidosByMesa(req, res))
);

module.exports = router;
