const BaseController       = require('./BaseController');
const CategoriaService     = require('../service/CategoriaService');
const asyncErrorWrapper    = require('../utils/asyncErrorWrapper');
const formatResponse       = require('../utils/formatResponse');
const models               = require('../models');

const categoriaService = new CategoriaService(models);

class CategoriaController extends BaseController {

  /**
   * GET /api/cardapio/categorias?estabelecimento_id=X
   */
  listar = asyncErrorWrapper(async (req, res) => {
    const { estabelecimento_id } = req.query;
    const categorias = await categoriaService.listar(estabelecimento_id ? Number(estabelecimento_id) : null);
    return formatResponse.success(res, { categorias });
  });

  /**
   * POST /api/cardapio/categorias
   */
  criar = asyncErrorWrapper(async (req, res) => {
    const estabelecimento_id = req.user?.estabelecimento_id || req.body.estabelecimento_id;
    const categoria = await categoriaService.criar({ ...req.body, estabelecimento_id });
    return formatResponse.success(res, categoria, 201);
  });

  /**
   * PUT /api/cardapio/categorias/:id
   */
  editar = asyncErrorWrapper(async (req, res) => {
    const categoria = await categoriaService.editar(req.params.id, req.body, req.user?.estabelecimento_id || null);
    return formatResponse.success(res, categoria);
  });

  /**
   * DELETE /api/cardapio/categorias/:id
   */
  remover = asyncErrorWrapper(async (req, res) => {
    const result = await categoriaService.remover(req.params.id, req.user?.estabelecimento_id || null);
    return formatResponse.success(res, result);
  });

  /**
   * POST /api/cardapio/duplicar
   * Body: { from_estabelecimento_id, to_estabelecimento_id }
   */
  duplicar = asyncErrorWrapper(async (req, res) => {
    if (req.user?.estabelecimento_id) {
      return formatResponse.error(res, 'Apenas o administrador master pode duplicar cardápios entre estabelecimentos', 403);
    }
    const { from_estabelecimento_id, to_estabelecimento_id } = req.body;
    const result = await categoriaService.duplicar(Number(from_estabelecimento_id), Number(to_estabelecimento_id));
    return formatResponse.success(res, result, 201);
  });
}

module.exports = new CategoriaController();
