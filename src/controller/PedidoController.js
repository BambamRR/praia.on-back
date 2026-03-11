const BaseController = require('./BaseController');

class PedidoController extends BaseController {
  constructor(pedidoService) {
    super();
    this.pedidoService = pedidoService;
  }

  /**
   * GET /api/pedidos (admin)
   */
  async listarPedidos(req, res) {
    try {
      const pedidos = await this.pedidoService.listarPedidos();
      return this.handleSuccess(res, pedidos);
    } catch (error) {
      return this.handleError(error, res, 'listarPedidos');
    }
  }

  /**
   * POST /api/pedidos
   */
  async criarPedido(req, res) {
    try {
      const pedido = await this.pedidoService.criarPedido(req.body);
      return this.handleSuccess(res, pedido, 'Pedido criado com sucesso', 201);
    } catch (error) {
      return this.handleError(error, res, 'criarPedido');
    }
  }

  /**
   * PATCH /api/pedidos/:pedidoId/status
   */
  async atualizarStatus(req, res) {
    try {
      const pedido = await this.pedidoService.atualizarStatus(
        req.params.pedidoId,
        req.body.status
      );
      return this.handleSuccess(res, pedido, 'Status atualizado com sucesso');
    } catch (error) {
      return this.handleError(error, res, 'atualizarStatus');
    }
  }
}

module.exports = PedidoController;
