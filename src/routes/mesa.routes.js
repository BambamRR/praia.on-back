const { Router }    = require('express');
const ctrl          = require('../controller/MesaController');
const auth          = require('../middlewares/authMiddleware');
const validate      = require('../middlewares/validate');
const { criarMesaSchema } = require('../validators/mesa.schema');

const router = Router();

/**
 * @openapi
 * /mesas:
 *   get:
 *     tags: [Mesas]
 *     summary: Lista todas as mesas com status
 */
router.get('/', ctrl.listar);

/**
 * @openapi
 * /mesas:
 *   post:
 *     tags: [Mesas]
 *     summary: Cria nova mesa/QR Code (admin)
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', auth, validate(criarMesaSchema), ctrl.criar);

/**
 * @openapi
 * /mesas/{id}:
 *   delete:
 *     tags: [Mesas]
 *     summary: Remove mesa (admin) — rejeita se estiver ocupada
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', auth, ctrl.remover);

/**
 * @openapi
 * /mesas/{mesaId}/chamar-garcom:
 *   post:
 *     tags: [Mesas]
 *     summary: Chama garçom (emite evento Socket.io)
 */
router.post('/:mesaId/chamar-garcom', ctrl.chamarGarcom);

/**
 * @openapi
 * /mesas/{mesaId}/pedidos:
 *   get:
 *     tags: [Mesas]
 *     summary: Lista pedidos de uma mesa (admin)
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:mesaId/pedidos', auth, ctrl.getPedidosByMesa);

/**
 * @openapi
 * /mesas/{mesaId}/fechar-conta:
 *   post:
 *     tags: [Mesas]
 *     summary: Solicita fechamento da conta — gera resumo com taxa de serviço e emite Socket.io
 */
router.post('/:mesaId/fechar-conta', ctrl.fecharConta);

module.exports = router;
