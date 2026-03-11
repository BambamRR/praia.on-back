const { Router } = require('express');
const asyncErrorWrapper  = require('../utils/asyncErrorWrapper');
const auth               = require('../middlewares/authMiddleware');
const validate           = require('../middlewares/validate');
const models             = require('../models');

/* Controllers */
const CardapioService    = require('../service/CardapioService');
const CardapioController = require('../controller/CardapioController');
const CategoriaCtrl      = require('../controller/CategoriaController');
const ItemCtrl           = require('../controller/ItemController');

/* Validators */
const { criarCategoriaSchema, editarCategoriaSchema } = require('../validators/categoria.schema');
const { criarItemSchema, editarItemSchema, disponibilidadeSchema } = require('../validators/item.schema');

const cardapioService    = new CardapioService(models);
const cardapioController = new CardapioController(cardapioService);

const router = Router();

/* ─────────────────────────────────────────────────────────────────────
 * GET /api/cardapio
 * Lista pública do cardápio (categorias + itens disponíveis)
 * ───────────────────────────────────────────────────────────────────── */
router.get('/', asyncErrorWrapper((req, res) => cardapioController.getCardapio(req, res)));

/* ─────────────────────────────────────────────────────────────────────
 * CATEGORIAS  →  /api/cardapio/categorias
 * ───────────────────────────────────────────────────────────────────── */

/** GET  /api/cardapio/categorias */
router.get('/categorias', CategoriaCtrl.listar);

/** POST /api/cardapio/categorias  (admin) */
router.post('/categorias', auth, validate(criarCategoriaSchema), CategoriaCtrl.criar);

/** PUT  /api/cardapio/categorias/:id  (admin) */
router.put('/categorias/:id', auth, validate(editarCategoriaSchema), CategoriaCtrl.editar);

/** DELETE /api/cardapio/categorias/:id  (admin) */
router.delete('/categorias/:id', auth, CategoriaCtrl.remover);

/* ─────────────────────────────────────────────────────────────────────
 * ITENS  →  /api/cardapio/categorias/:categoriaId/itens
 *           /api/cardapio/itens/:id
 * ───────────────────────────────────────────────────────────────────── */

/** POST /api/cardapio/categorias/:categoriaId/itens  (admin) */
router.post('/categorias/:categoriaId/itens', auth, validate(criarItemSchema), ItemCtrl.criar);

/** PUT   /api/cardapio/itens/:id  (admin) */
router.put('/itens/:id', auth, validate(editarItemSchema), ItemCtrl.editar);

/** DELETE /api/cardapio/itens/:id  (admin) */
router.delete('/itens/:id', auth, ItemCtrl.remover);

/** PATCH /api/cardapio/itens/:id/disponibilidade  (admin) */
router.patch('/itens/:id/disponibilidade', auth, validate(disponibilidadeSchema), ItemCtrl.alterarDisponibilidade);

module.exports = router;
