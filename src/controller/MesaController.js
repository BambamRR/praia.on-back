const BaseController = require('./BaseController');

class MesaController extends BaseController {
  constructor(mesaService) {
    super();
    this.mesaService = mesaService;
  }

  /**
   * POST /api/mesas/:mesaId/chamar-garcom
   */
  async chamarGarcom(req, res) {
    try {
      const result = await this.mesaService.chamarGarcom(req.params.mesaId);
      return this.handleSuccess(res, result, result.message);
    } catch (error) {
      return this.handleError(error, res, 'chamarGarcom');
    }
  }

  /**
   * GET /api/mesas/:mesaId/pedidos
   */
  async getPedidosByMesa(req, res) {
    try {
      const pedidos = await this.mesaService.getPedidosByMesa(req.params.mesaId);
      return this.handleSuccess(res, pedidos);
    } catch (error) {
      return this.handleError(error, res, 'getPedidosByMesa');
    }
  }
}

module.exports = MesaController;
