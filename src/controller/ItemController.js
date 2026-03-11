const BaseController       = require('./BaseController');
const ItemService          = require('../service/ItemService');
const asyncErrorWrapper    = require('../utils/asyncErrorWrapper');
const { formatResponse }   = require('../utils/formatResponse');
const models               = require('../models');

const itemService = new ItemService(models);

class ItemController extends BaseController {

  /**
   * POST /api/categorias/:categoriaId/itens
   */
  criar = asyncErrorWrapper(async (req, res) => {
    const item = await itemService.criar(req.params.categoriaId, req.body);
    return formatResponse.success(res, item, 201);
  });

  /**
   * PUT /api/itens/:id
   */
  editar = asyncErrorWrapper(async (req, res) => {
    const item = await itemService.editar(req.params.id, req.body);
    return formatResponse.success(res, item);
  });

  /**
   * DELETE /api/itens/:id
   */
  remover = asyncErrorWrapper(async (req, res) => {
    const result = await itemService.remover(req.params.id);
    return formatResponse.success(res, result);
  });

  /**
   * PATCH /api/itens/:id/disponibilidade
   */
  alterarDisponibilidade = asyncErrorWrapper(async (req, res) => {
    const { disponivel } = req.body;
    const result = await itemService.alterarDisponibilidade(req.params.id, disponivel);
    return formatResponse.success(res, result);
  });
}

module.exports = new ItemController();
