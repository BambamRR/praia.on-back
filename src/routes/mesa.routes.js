const { Router } = require('express');
const ctrl = require('../controller/MesaController');
const auth = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { criarMesaSchema } = require('../validators/mesa.schema');

const router = Router();

/**
 * @openapi
 * /mesas:
 *   get:
 *     tags: [Mesas]
 *     summary: Lista todas as mesas com status
 */
router.get('/', auth, ctrl.listar);

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

router.post('/:mesaId/chamar-garcom', ctrl.chamarGarcom);

/**
 * @openapi
 * /mesas/{mesaId}/abrir-sessao:
 *   post:
 *     tags: [Mesas]
 *     summary: Abre uma nova sessão para a mesa (quando o cliente inicia o uso)
 */
router.post('/:mesaId/abrir-sessao', ctrl.abrirSessao);

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

/**
 * @openapi
 * /mesas/{mesaId}/finalizar-conta:
 *   post:
 *     tags: [Mesas]
 *     summary: Finaliza a conta e libera a mesa (admin)
 *     security: [{ bearerAuth: [] }]
 */
router.post('/:mesaId/finalizar-conta', auth, ctrl.finalizarConta);

module.exports = router;
