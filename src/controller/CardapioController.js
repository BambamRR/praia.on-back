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
      const data = await this.cardapioService.getCardapio();
      return this.handleSuccess(res, data);
    } catch (error) {
      return this.handleError(error, res, 'getCardapio');
    }
  }
}

module.exports = CardapioController;
