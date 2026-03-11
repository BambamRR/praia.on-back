const { Router }  = require('express');
const models       = require('../models');
const AuthService  = require('../service/AuthService');
const AuthController = require('../controller/AuthController');
const { authLimiter } = require('../middlewares/rateLimiter');
const validate     = require('../middlewares/validate');
const authMiddleware = require('../middlewares/authMiddleware');
const asyncErrorWrapper = require('../utils/asyncErrorWrapper');
const { registerSchema, loginSchema } = require('../validators/auth.schema');

const router = Router();

const authService    = new AuthService(models);
const authController = new AuthController(authService);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome:     { type: string, example: "João Silva" }
 *               email:    { type: string, example: "joao@email.com" }
 *               senha:    { type: string, example: "Senha@123" }
 *               telefone: { type: string, example: "11999999999" }
 *     responses:
 *       201: { description: Usuário criado }
 *       409: { description: E-mail já cadastrado }
 */
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncErrorWrapper((req, res) => authController.register(req, res))
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email: { type: string }
 *               senha: { type: string }
 *     responses:
 *       200: { description: Login OK, retorna token }
 *       401: { description: Credenciais inválidas }
 */
router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncErrorWrapper((req, res) => authController.login(req, res))
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Dados do usuário autenticado
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dados do usuário }
 *       401: { description: Token inválido }
 */
router.get(
  '/me',
  authMiddleware,
  asyncErrorWrapper((req, res) => authController.me(req, res))
);

module.exports = router;
