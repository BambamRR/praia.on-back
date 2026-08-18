const AppError = require('../utils/AppError');
const logger   = require('../config/logger');

class CategoriaService {
  constructor(models) {
    this.Categoria     = models.Categoria;
    this.Produto       = models.Produto;
    this.Estabelecimento = models.Estabelecimento;
  }

  /** Lista categorias, opcionalmente filtrando por estabelecimento. */
  async listar(estabelecimento_id = null) {
    const where = {};
    if (estabelecimento_id) where.estabelecimento_id = estabelecimento_id;
    return this.Categoria.findAll({ where, order: [['nome', 'ASC']] });
  }

  /** Cria uma nova categoria. */
  async criar({ nome, descricao = null, ativo = true, estabelecimento_id }) {
    if (!estabelecimento_id) throw new AppError('O estabelecimento é obrigatório para criar uma categoria', 400);

    const estabelecimento = await this.Estabelecimento.findByPk(estabelecimento_id);
    if (!estabelecimento) throw new AppError('Estabelecimento não encontrado', 404);

    const where = { nome };
    if (estabelecimento_id) where.estabelecimento_id = estabelecimento_id;
    const existente = await this.Categoria.findOne({ where });
    if (existente) throw new AppError(`Categoria "${nome}" já existe neste estabelecimento`, 409);

    const categoria = await this.Categoria.create({ nome, descricao, ativo, estabelecimento_id });
    logger.info(`Categoria criada: "${nome}" (ID: ${categoria.id})`);
    return categoria;
  }

  /** Edita uma categoria existente. */
  async editar(id, dados, estabelecimento_id = null) {
    const categoria = await this.Categoria.findByPk(id);
    if (!categoria) throw new AppError('Categoria não encontrada', 404);
    if (estabelecimento_id && categoria.estabelecimento_id !== estabelecimento_id) {
      throw new AppError('Categoria não pertence ao seu estabelecimento', 403);
    }

    if (dados.nome && dados.nome !== categoria.nome) {
      const where = { nome: dados.nome };
      if (categoria.estabelecimento_id) where.estabelecimento_id = categoria.estabelecimento_id;
      const existente = await this.Categoria.findOne({ where });
      if (existente) throw new AppError(`Categoria "${dados.nome}" já existe`, 409);
    }

    const { nome, descricao, ativo } = dados;
    await categoria.update({ nome, descricao, ativo });
    logger.info(`Categoria atualizada: ID ${id}`);
    return categoria;
  }

  /**
   * Remove categoria.
   * Lança erro se existirem produtos vinculados.
   */
  async remover(id, estabelecimento_id = null) {
    const categoria = await this.Categoria.findByPk(id);
    if (!categoria) throw new AppError('Categoria não encontrada', 404);
    if (estabelecimento_id && categoria.estabelecimento_id !== estabelecimento_id) {
      throw new AppError('Categoria não pertence ao seu estabelecimento', 403);
    }

    const qtdProdutos = await this.Produto.count({ where: { categoria_id: id } });
    if (qtdProdutos > 0) {
      throw new AppError(
        `Não é possível remover. Existem ${qtdProdutos} produto(s) vinculado(s) a esta categoria. Remova-os primeiro.`,
        409,
      );
    }

    await categoria.destroy();
    logger.info(`Categoria removida: ID ${id}`);
    return { success: true, message: 'Categoria removida com sucesso' };
  }

  /**
   * Duplica todas as categorias e itens de um estabelecimento para outro.
   */
  async duplicar(fromEstabelecimentoId, toEstabelecimentoId) {
    if (fromEstabelecimentoId === toEstabelecimentoId) {
      throw new AppError('Escolha estabelecimentos diferentes para duplicar o cardápio', 400);
    }

    const origem = await this.Estabelecimento.findByPk(fromEstabelecimentoId);
    const destino = await this.Estabelecimento.findByPk(toEstabelecimentoId);
    if (!origem || !destino) throw new AppError('Estabelecimento de origem ou destino não encontrado', 404);

    const categorias = await this.Categoria.findAll({
      where: { estabelecimento_id: fromEstabelecimentoId },
      include: [{ model: this.Produto, as: 'itens' }],
    });

    let totalCats = 0;
    let totalItens = 0;

    for (const cat of categorias) {
      const [novaCat, created] = await this.Categoria.findOrCreate({
        where: { nome: cat.nome, estabelecimento_id: toEstabelecimentoId },
        defaults: {
          descricao: cat.descricao,
          ativo: cat.ativo,
        },
      });
      if (created) totalCats++;

      for (const item of cat.itens) {
        const [, itemCreated] = await this.Produto.findOrCreate({
          where: { nome: item.nome, categoria_id: novaCat.id, estabelecimento_id: toEstabelecimentoId },
          defaults: {
            descricao: item.descricao,
            preco: item.preco,
            imagem: item.imagem,
            disponivel: item.disponivel,
          },
        });
        if (itemCreated) totalItens++;
      }
    }

    return { categorias: totalCats, itens: totalItens };
  }
}

module.exports = CategoriaService;
