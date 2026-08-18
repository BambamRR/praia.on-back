const BaseController = require('./BaseController');
const { getIO } = require('../config/socket');

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
      const isAdminMaster = req.user.perfil.nome === 'administrador';
      let estId = req.user.estabelecimento_id;
      
      if (isAdminMaster) {
          estId = req.query.estabelecimento_id ? Number(req.query.estabelecimento_id) : null;
      }
      
      const pedidos = await this.pedidoService.listarPedidos(estId);
      return this.handleSuccess(res, { pedidos });
    } catch (error) {
      return this.handleError(error, res, 'listarPedidos');
    }
  }

  /**
   * POST /api/pedidos
   */
  async criarPedido(req, res) {
    try {
      let io = null;
      try { io = getIO(); } catch (_) { /* Socket não inicializado em testes */ }

      const pedido = await this.pedidoService.criarPedido(req.body, io);
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
