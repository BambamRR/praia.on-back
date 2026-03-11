const BaseController       = require('./BaseController');
const CategoriaService     = require('../service/CategoriaService');
const asyncErrorWrapper    = require('../utils/asyncErrorWrapper');
const { formatResponse }   = require('../utils/formatResponse');
const models               = require('../models');

const categoriaService = new CategoriaService(models);

class CategoriaController extends BaseController {

  /**
   * GET /api/categorias
   */
  listar = asyncErrorWrapper(async (req, res) => {
    const categorias = await categoriaService.listar();
    return formatResponse.success(res, { categorias });
  });

  /**
   * POST /api/categorias
   */
  criar = asyncErrorWrapper(async (req, res) => {
    const categoria = await categoriaService.criar(req.body);
    return formatResponse.success(res, categoria, 201);
  });

  /**
   * PUT /api/categorias/:id
   */
  editar = asyncErrorWrapper(async (req, res) => {
    const categoria = await categoriaService.editar(req.params.id, req.body);
    return formatResponse.success(res, categoria);
  });

  /**
   * DELETE /api/categorias/:id
   */
  remover = asyncErrorWrapper(async (req, res) => {
    const result = await categoriaService.remover(req.params.id);
    return formatResponse.success(res, result);
  });
}

module.exports = new CategoriaController();
