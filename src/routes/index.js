const { Router } = require('express');

const authRoutes      = require('./auth.routes');
const cardapioRoutes  = require('./cardapio.routes');
const mesaRoutes      = require('./mesa.routes');
const pedidoRoutes    = require('./pedido.routes');
const categoriaRoutes = require('./categoria.routes');
const itemRoutes      = require('./item.routes');
const uploadRoutes          = require('./upload.routes');
const estabelecimentoRoutes = require('./estabelecimento.routes');

const router = Router();

router.use('/auth',             authRoutes);
router.use('/cardapio',         cardapioRoutes);
router.use('/mesas',            mesaRoutes);
router.use('/pedidos',          pedidoRoutes);
router.use('/categorias',       categoriaRoutes);
router.use('/itens',            itemRoutes);
router.use('/upload',           uploadRoutes);
router.use('/estabelecimentos', estabelecimentoRoutes);

/* Health check */
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

module.exports = router;
