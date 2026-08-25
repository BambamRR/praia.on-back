const BaseController = require('./BaseController');
const AppError = require('../utils/AppError');

class CardapioController extends BaseController {
  constructor(cardapioService) {
    super();
    this.cardapioService = cardapioService;
  }

  /**
   * GET /api/cardapio
   */
  async getCardapio(req, res) {
    try {
      const rawEstabelecimentoId = req.query.estabelecimento_id ?? req.query.estabelecimentoId;
      const includeEmpty = req.query.include_empty === 'true';
      const hasEstabelecimentoId = rawEstabelecimentoId !== undefined;
      const estabelecimento_id = hasEstabelecimentoId ? Number(rawEstabelecimentoId) : null;
      const isAdmin = req.user?.perfil?.nome === 'administrador';
      const isAdminMaster = isAdmin && !req.user.estabelecimento_id;

      if (hasEstabelecimentoId && (!Number.isInteger(estabelecimento_id) || estabelecimento_id <= 0)) {
        throw new AppError('estabelecimento_id deve ser um número inteiro positivo', 400);
      }

      // include_empty (itens indisponíveis + categorias vazias) exige que o
      // solicitante gerencie o estabelecimento consultado: admin master (todos)
      // ou o parceiro dono do próprio estabelecimento.
      const gerenciaEstabelecimento =
        isAdminMaster ||
        (!!req.user?.estabelecimento_id && estabelecimento_id === req.user.estabelecimento_id);

      if (includeEmpty && !gerenciaEstabelecimento) {
        throw new AppError('A listagem de itens indisponíveis exige autenticação administrativa', 403);
      }

      if (!estabelecimento_id && (!includeEmpty || !isAdminMaster)) {
        throw new AppError('estabelecimento_id é obrigatório para consultar o cardápio', 400);
      }

      if (req.user?.estabelecimento_id && estabelecimento_id !== req.user.estabelecimento_id) {
        throw new AppError('Acesso ao estabelecimento não autorizado', 403);
      }

      const data = await this.cardapioService.getCardapio(
        estabelecimento_id,
        includeEmpty,
      );
      return this.handleSuccess(res, data);
    } catch (error) {
      return this.handleError(error, res, 'getCardapio');
    }
  }
}

module.exports = CardapioController;
