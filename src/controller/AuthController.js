const BaseController = require('./BaseController');
const logger         = require('../config/logger');

class AuthController extends BaseController {
  constructor(authService) {
    super();
    this.authService = authService;
  }

  /**
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const result = await this.authService.register(req.body);
      logger.info(`Auth: novo usuário registrado — ${req.body.email}`);
      return this.handleSuccess(res, result, 'Usuário registrado com sucesso', 201);
    } catch (error) {
      return this.handleError(error, res, 'register');
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, senha } = req.body;
      const result = await this.authService.login(email, senha);
      logger.info(`Auth: login bem-sucedido — ${email}`);
      return this.handleSuccess(res, result, 'Login realizado com sucesso');
    } catch (error) {
      logger.warn(`Auth: falha no login — ${req.body.email}`);
      return this.handleError(error, res, 'login');
    }
  }

  /**
   * GET /api/auth/me
   */
  async me(req, res) {
    try {
      const user = await this.authService.me(req.user.id);
      return this.handleSuccess(res, user);
    } catch (error) {
      return this.handleError(error, res, 'me');
    }
  }
}

module.exports = AuthController;
