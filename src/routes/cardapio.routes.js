const { Router } = require('express');
const models     = require('../models');
const CardapioService    = require('../service/CardapioService');
const CardapioController = require('../controller/CardapioController');
const asyncErrorWrapper  = require('../utils/asyncErrorWrapper');

const router = Router();

const cardapioService    = new CardapioService(models);
const cardapioController = new CardapioController(cardapioService);

/**
 * @swagger
 * /api/cardapio:
 *   get:
 *     summary: Busca o cardápio completo
 *     tags: [Cardápio]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de categorias com produtos
 *         content:
 *           application/json:
 *             example:
 *               categorias:
 *                 - id: 1
 *                   nome: Porções
 *                   itens:
 *                     - id: 1
 *                       nome: Camarão Frito
 *                       descricao: Porção de 500g
 *                       preco: 85.00
 *                       imagem: url.jpg
 *                       disponivel: true
 */
router.get(
  '/',
  asyncErrorWrapper((req, res) => cardapioController.getCardapio(req, res))
);

module.exports = router;
