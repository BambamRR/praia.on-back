const { Router } = require('express');
const ctrl        = require('../controller/ItemController');
const auth        = require('../middlewares/authMiddleware');
const validate    = require('../middlewares/validate');
const { criarItemSchema, editarItemSchema, disponibilidadeSchema } = require('../validators/item.schema');

/*
 * Este router é montado em dois contextos:
 *   1. /api/categorias/:categoriaId/itens  (criação vinculada à categoria)
 *   2. /api/itens                           (edição e remoção direta)
 *
 * O mergeParams:true garante acesso ao :categoriaId do router pai.
 */
const router = Router({ mergeParams: true });

/**
 * @openapi
 * /categorias/{categoriaId}/itens:
 *   post:
 *     tags: [Itens]
 *     summary: Cria item vinculado a uma categoria (admin)
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', auth, validate(criarItemSchema), ctrl.criar);

/**
 * @openapi
 * /itens/{id}:
 *   put:
 *     tags: [Itens]
 *     summary: Edita campos parciais de um item (admin)
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id', auth, validate(editarItemSchema), ctrl.editar);

/**
 * @openapi
 * /itens/{id}:
 *   delete:
 *     tags: [Itens]
 *     summary: Remove um item (admin)
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:id', auth, ctrl.remover);

/**
 * @openapi
 * /itens/{id}/disponibilidade:
 *   patch:
 *     tags: [Itens]
 *     summary: Altera disponibilidade de um item rapidamente (admin)
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/disponibilidade', auth, validate(disponibilidadeSchema), ctrl.alterarDisponibilidade);

module.exports = router;
