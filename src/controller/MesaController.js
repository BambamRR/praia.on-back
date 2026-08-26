const BaseController       = require('./BaseController');
const MesaService          = require('../service/MesaService');
const asyncErrorWrapper    = require('../utils/asyncErrorWrapper');
const formatResponse       = require('../utils/formatResponse');
const models               = require('../models');
const { getIO }            = require('../config/socket');

let _mesaService;
function getService() {
  if (!_mesaService) _mesaService = new MesaService(models);
  return _mesaService;
}

class MesaController extends BaseController {

  /** GET /api/mesas — lista todas */
  listar = asyncErrorWrapper(async (req, res) => {
    const isAdminMaster = req.user.perfil?.nome === 'administrador' && !req.user.estabelecimento_id;
    let estId = req.user.estabelecimento_id;
    
    if (isAdminMaster) {
        estId = req.query.estabelecimento_id ? Number(req.query.estabelecimento_id) : null;
    }

    const mesas = await getService().listar(estId);
    return formatResponse.success(res, { mesas });
  });

  /** GET /api/mesas/publicas — lista mesas para o fluxo público do cliente */
  listarPublicas = asyncErrorWrapper(async (req, res) => {
    const mesas = await getService().listar(null, false);
    return formatResponse.success(res, { mesas });
  });

  /** POST /api/mesas — criar nova mesa */
  criar = asyncErrorWrapper(async (req, res) => {
    const { numero, capacidade, estabelecimento_id } = req.body;
    
    // Prioridade:
    // 1. Se o usuário logado tiver estabelecimento_id (Admin Local), usamos o dele.
    // 2. Se não (Super Admin), usamos o enviado no corpo da requisição.
    const finalEstId = req.user.estabelecimento_id || estabelecimento_id;

    if (!finalEstId) {
      console.error('[MesaController] Tentativa de criar mesa sem estabelecimento_id', {
        user: req.user.id,
        body: req.body
      });
    }

    const mesa = await getService().criar({ 
      numero, 
      capacidade, 
      estabelecimento_id: finalEstId 
    });
    return formatResponse.success(res, mesa, 201);
  });

  /** DELETE /api/mesas/:id — remover mesa */
  remover = asyncErrorWrapper(async (req, res) => {
    const estId = req.user.estabelecimento_id;
    const result = await getService().remover(req.params.id, estId);
    return formatResponse.success(res, result);
  });

  /** PUT /api/mesas/:id — editar mesa */
  editar = asyncErrorWrapper(async (req, res) => {
    const { numero, capacidade, estabelecimento_id } = req.body;
    const isAdminMaster = req.user.perfil?.nome === 'administrador' && !req.user.estabelecimento_id;
    const escopo = isAdminMaster ? null : req.user.estabelecimento_id;
    const mesa = await getService().editar(req.params.id, { 
      numero, 
      capacidade, 
      estabelecimento_id
    }, escopo);
    return formatResponse.success(res, mesa);
  });

  /** POST /api/mesas/:mesaId/abrir-sessao */
  abrirSessao = asyncErrorWrapper(async (req, res) => {
    const sessao = await getService().abrirSessao(req.params.mesaId);
    return formatResponse.success(res, sessao);
  });

  /** POST /api/mesas/:mesaId/chamar-garcom */
  chamarGarcom = asyncErrorWrapper(async (req, res) => {
    let io = null;
    try { io = getIO(); } catch (_) { /* Socket não inicializado em testes */ }
    const result = await getService().chamarGarcom(req.params.mesaId, io);
    return formatResponse.success(res, result);
  });

  /** GET /api/mesas/:mesaId/pedidos */
  getPedidosByMesa = asyncErrorWrapper(async (req, res) => {
    const pedidos = await getService().getPedidosByMesa(req.params.mesaId, req.query.session_token);
    return formatResponse.success(res, { pedidos });
  });

  /** POST /api/mesas/:mesaId/fechar-conta */
  fecharConta = asyncErrorWrapper(async (req, res) => {
    let io = null;
    try { io = getIO(); } catch (_) { /* Socket não inicializado em testes */ }
    const resumo = await getService().fecharConta(req.params.mesaId, io);
    return formatResponse.success(res, resumo);
  });

  /** POST /api/mesas/:mesaId/finalizar-conta — liberar mesa (admin) */
  finalizarConta = asyncErrorWrapper(async (req, res) => {
    const { metodoPagamento, desconto, cobrarTaxa } = req.body;
    const result = await getService().finalizarConta(req.params.mesaId, metodoPagamento, desconto, cobrarTaxa);
    try {
      getIO().emit('mesa_status_atualizado', {
        mesaId: Number(req.params.mesaId),
        status: 'livre',
        timestamp: new Date().toISOString(),
      });
    } catch (_) { /* Socket opcional */ }
    return formatResponse.success(res, result);
  });
}

module.exports = new MesaController();
