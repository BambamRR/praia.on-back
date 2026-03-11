const { Router } = require('express');
const ctrl        = require('../controller/CategoriaController');
const auth        = require('../middlewares/authMiddleware');
const validate    = require('../middlewares/validate');
const { criarCategoriaSchema, editarCategoriaSchema } = require('../validators/categoria.schema');

const router = Router();

/**
 * @openapi
 * /categorias:
 *   get:
 *     tags: [Categorias]
 *     summary: Lista todas as categorias
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/', ctrl.listar);

/**
 * @openapi
 * /categorias:
 *   post:
 *     tags: [Categorias]
 *     summary: Cria uma categoria (admin)
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', auth, validate(criarCategoriaSchema), ctrl.criar);

/**
 * @openapi
 * /categorias/{id}:
 *   put:
 *     tags: [Categorias]
 *     summary: Atualiza uma categoria (admin)
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id', auth, validate(editarCategoriaSchema), ctrl.editar);

/**
 * @openapi
 * /categorias/{id}:
 *   delete:
 *     tags: [Categorias]
 *     summary: Remove uma categoria (admin) — rejeita se houver itens vinculados
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', auth, ctrl.remover);

/* Rota aninhada: itens de uma categoria */
const itemRoutes = require('./item.routes');
router.use('/:categoriaId/itens', (req, res, next) => {
  /* Propaga categoriaId para o router aninhado */
  req.params.categoriaId = req.params.categoriaId;
  next();
}, itemRoutes);

module.exports = router;
