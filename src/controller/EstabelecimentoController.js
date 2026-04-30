const BaseController    = require('./BaseController');
const asyncErrorWrapper = require('../utils/asyncErrorWrapper');
const formatResponse    = require('../utils/formatResponse');
const models            = require('../models');

class EstabelecimentoController extends BaseController {
  
  /** GET /api/estabelecimentos — lista todos (Super Admin) */
  listar = asyncErrorWrapper(async (req, res) => {
    const user = req.user;
    let where = {};

    // Se não for administrador master, filtra apenas o seu estabelecimento
    if (user.perfil.nome !== 'administrador' && user.estabelecimento_id) {
      where.id = user.estabelecimento_id;
    }

    const estabelecimentos = await models.Estabelecimento.findAll({
      where,
      include: [{ model: models.Mesa, as: 'mesas' }],
      attributes: {
        include: [
          [
            models.sequelize.literal(`(
              SELECT COUNT(*)
              FROM mesas AS mesa
              WHERE
                mesa.estabelecimento_id = "Estabelecimento".id
            )`),
            'qtdMesas'
          ]
        ]
      },
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
    const estabelecimento = await models.Estabelecimento.findByPk(req.params.id, {
      include: [{ model: models.Mesa, as: 'mesas' }],
      attributes: {
        include: [
          [
            models.sequelize.literal(`(
              SELECT COUNT(*)
              FROM mesas AS mesa
              WHERE
                mesa.estabelecimento_id = "Estabelecimento".id
            )`),
            'qtdMesas'
          ]
        ]
      }
    });
    if (!estabelecimento) {
      return formatResponse.error(res, 'Estabelecimento não encontrado', 404);
    }
    return formatResponse.success(res, estabelecimento);
  });

  /** PUT /api/estabelecimentos/:id — editar */
  editar = asyncErrorWrapper(async (req, res) => {
    const estabelecimento = await models.Estabelecimento.findByPk(req.params.id);
    if (!estabelecimento) {
      return formatResponse.error(res, 'Estabelecimento não encontrado', 404);
    }
    await estabelecimento.update(req.body);
    return formatResponse.success(res, estabelecimento);
  });

  /** DELETE /api/estabelecimentos/:id — remover/desativar */
  deletar = asyncErrorWrapper(async (req, res) => {
    const estabelecimento = await models.Estabelecimento.findByPk(req.params.id);
    if (!estabelecimento) {
      return formatResponse.error(res, 'Estabelecimento não encontrado', 404);
    }
    // Hard delete ou soft delete? O modelo não tem paranoid: true, então faremos hard delete
    // Mas o front usa um toggle de "ativo", então talvez prefira manter.
    // Se o front envia { ativo: false } via PUT, o editar já resolve.
    await estabelecimento.destroy();
    return formatResponse.success(res, { message: 'Estabelecimento removido' });
  });
}

module.exports = new EstabelecimentoController();
