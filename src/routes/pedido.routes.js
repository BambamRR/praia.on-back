const { Router }   = require('express');
const models        = require('../models');
const PedidoService = require('../service/PedidoService');
const PedidoController = require('../controller/PedidoController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate      = require('../middlewares/validate');
const asyncErrorWrapper = require('../utils/asyncErrorWrapper');
const { createPedidoSchema, updateStatusSchema } = require('../validators/pedido.schema');

const router = Router();

const pedidoService    = new PedidoService(models);
const pedidoController = new PedidoController(pedidoService);

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Listar todos os pedidos (admin)
 *     tags: [Pedidos]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de pedidos }
 */
router.get(
  '/',
  authMiddleware,
  asyncErrorWrapper((req, res) => pedidoController.listarPedidos(req, res))
);

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Criar novo pedido
 *     tags: [Pedidos]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mesaId, itens, total]
 *             properties:
 *               mesaId: { type: integer, example: 5 }
 *               total:  { type: number,  example: 85.00 }
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:         { type: integer }
 *                     nome:       { type: string }
 *                     quantidade: { type: integer }
 *                     preco:      { type: number }
 *     responses:
 *       201: { description: Pedido criado }
 *       400: { description: Dados inválidos }
 */
router.post(
  '/',
  validate(createPedidoSchema),
  asyncErrorWrapper((req, res) => pedidoController.criarPedido(req, res))
);

/**
 * @swagger
 * /api/pedidos/{pedidoId}/status:
 *   patch:
 *     summary: Atualizar status de um pedido
 *     tags: [Pedidos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: pedidoId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [novo, preparando, pronto, entregue, cancelado]
 *     responses:
 *       200: { description: Status atualizado }
 *       404: { description: Pedido não encontrado }
 */
router.patch(
  '/:pedidoId/status',
  authMiddleware,
  validate(updateStatusSchema),
  asyncErrorWrapper((req, res) => pedidoController.atualizarStatus(req, res))
);

module.exports = router;
