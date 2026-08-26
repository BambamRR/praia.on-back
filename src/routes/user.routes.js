const { Router } = require('express');
const models = require('../models');
const UserService = require('../service/UserService');
const UserController = require('../controller/UserController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const asyncErrorWrapper = require('../utils/asyncErrorWrapper');

const router = Router();
const userService = new UserService(models);
const userController = new UserController(userService);

// Todas as rotas de usuários exigem autenticação.
router.use(authMiddleware);

// Listagem (GET / e /perfis) liberada para admin e fornecedor —
// o controller filtra por estabelecimento para usuários não-master,
// então o fornecedor vê apenas os usuários do próprio estabelecimento.
router.get('/', roleMiddleware(['administrador', 'fornecedor']), asyncErrorWrapper((req, res) => userController.index(req, res)));
router.get('/perfis', roleMiddleware(['administrador', 'fornecedor']), asyncErrorWrapper((req, res) => userController.perfis(req, res)));

// Escrita (criar/editar/remover) restrita apenas ao perfil administrador.
router.use(roleMiddleware('administrador'));
router.post('/', asyncErrorWrapper((req, res) => userController.store(req, res)));
router.put('/:id', asyncErrorWrapper((req, res) => userController.update(req, res)));
router.delete('/:id', asyncErrorWrapper((req, res) => userController.destroy(req, res)));

module.exports = router;
