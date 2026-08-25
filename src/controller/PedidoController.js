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
      const isAdminMaster = req.user.perfil.nome === 'administrador' && !req.user.estabelecimento_id;
      let estId = req.user.estabelecimento_id;
      
      if (isAdminMaster) {
          estId = req.query.estabelecimento_id ? Number(req.query.estabelecimento_id) : null;
      }
      
      const pedidos = await this.pedidoService.listarPedidos(estId, {
        mesa: req.query.mesa || req.query.mesaId,
        data: req.query.data,
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim,
      });
      return this.handleSuccess(res, { pedidos });
    } catch (error) {
      return this.handleError(error, res, 'listarPedidos');
    }
  }

  async listarHistorico(req, res) {
    try {
      const isAdminMaster = req.user.perfil.nome === 'administrador' && !req.user.estabelecimento_id;
      const estId = isAdminMaster
        ? (req.query.estabelecimentoId || req.query.estabelecimento_id ? Number(req.query.estabelecimentoId || req.query.estabelecimento_id) : null)
        : req.user.estabelecimento_id;
      const resultado = await this.pedidoService.listarHistorico(estId, {
        data: req.query.data,
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim,
        mesa: req.query.mesa || req.query.mesaId,
        page: req.query.page,
        limit: req.query.limit,
      });
      return this.handleSuccess(res, resultado);
    } catch (error) {
      return this.handleError(error, res, 'listarHistorico');
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
      try { getIO().emit('pedido_status_atualizado', { pedido, timestamp: new Date().toISOString() }); } catch (_) { /* Socket opcional */ }
      return this.handleSuccess(res, pedido, 'Status atualizado com sucesso');
    } catch (error) {
      return this.handleError(error, res, 'atualizarStatus');
    }
  }
}

module.exports = PedidoController;
