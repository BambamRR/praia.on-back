const { Router } = require('express');
const ctrl       = require('../controller/EstabelecimentoController');
const auth       = require('../middlewares/authMiddleware');
const role       = require('../middlewares/roleMiddleware');

const router = Router();

router.use(auth);

// Listagem e detalhes permitidos para admin e fornecedor
router.get('/', role(['administrador', 'fornecedor']), ctrl.listar);
router.get('/:id', role(['administrador', 'fornecedor']), ctrl.detalhes);

// Criação e edição restritas apenas ao Admin Master
router.post('/', role('administrador'), ctrl.criar);
router.put('/:id', role('administrador'), ctrl.editar);
router.delete('/:id', role('administrador'), ctrl.deletar);

module.exports = router;
