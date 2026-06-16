const BaseController = require('./BaseController');

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
      const { estabelecimento_id, include_empty } = req.query;
      const data = await this.cardapioService.getCardapio(
        estabelecimento_id ? Number(estabelecimento_id) : null,
        include_empty === 'true',
      );
      return this.handleSuccess(res, data);
    } catch (error) {
      return this.handleError(error, res, 'getCardapio');
    }
  }
}

module.exports = CardapioController;
