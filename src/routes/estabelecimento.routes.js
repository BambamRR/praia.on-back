const { Router } = require('express');
const ctrl       = require('../controller/EstabelecimentoController');
const auth       = require('../middlewares/authMiddleware');

const router = Router();

/**
 * @openapi
 * /estabelecimentos:
 *   get:
 *     tags: [Estabelecimentos]
 *     summary: Lista todos os estabelecimentos (Super Admin)
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', auth, ctrl.listar);

/**
 * @openapi
 * /estabelecimentos:
 *   post:
 *     tags: [Estabelecimentos]
 *     summary: Cria novo estabelecimento (Super Admin)
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', auth, ctrl.criar);

/**
 * @openapi
 * /estabelecimentos/{id}:
 *   get:
 *     tags: [Estabelecimentos]
 *     summary: Detalhes do estabelecimento
 *     security: [{ bearerAuth: [] }]
 */
router.get('/:id', auth, ctrl.detalhes);

module.exports = router;
