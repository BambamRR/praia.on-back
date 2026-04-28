const BaseController    = require('./BaseController');
const asyncErrorWrapper = require('../utils/asyncErrorWrapper');
const formatResponse    = require('../utils/formatResponse');
const models            = require('../models');

class EstabelecimentoController extends BaseController {
  
  /** GET /api/estabelecimentos — lista todos (Super Admin) */
  listar = asyncErrorWrapper(async (req, res) => {
    // Apenas super admin (sem estabelecimento_id) deveria ver todos
    const estabelecimentos = await models.Estabelecimento.findAll({
      order: [['nome', 'ASC']]
    });
    return formatResponse.success(res, { estabelecimentos });
  });

  /** POST /api/estabelecimentos — criar novo (Super Admin) */
  criar = asyncErrorWrapper(async (req, res) => {
    const estabelecimento = await models.Estabelecimento.create(req.body);
    return formatResponse.success(res, estabelecimento, 201);
  });

  /** GET /api/estabelecimentos/:id — detalhes */
  detalhes = asyncErrorWrapper(async (req, res) => {
    const estabelecimento = await models.Estabelecimento.findByPk(req.params.id);
    if (!estabelecimento) {
      return formatResponse.error(res, 'Estabelecimento não encontrado', 404);
    }
    return formatResponse.success(res, estabelecimento);
  });
}

module.exports = new EstabelecimentoController();
