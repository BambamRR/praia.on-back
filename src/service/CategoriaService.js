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
  async criar({ nome, ativo = true, estabelecimento_id }) {
    const where = { nome };
    if (estabelecimento_id) where.estabelecimento_id = estabelecimento_id;
    const existente = await this.Categoria.findOne({ where });
    if (existente) throw new AppError(`Categoria "${nome}" já existe neste estabelecimento`, 409);

    const categoria = await this.Categoria.create({ nome, ativo, estabelecimento_id: estabelecimento_id || null });
    logger.info(`Categoria criada: "${nome}" (ID: ${categoria.id})`);
    return categoria;
  }

  /** Edita uma categoria existente. */
  async editar(id, dados) {
    const categoria = await this.Categoria.findByPk(id);
    if (!categoria) throw new AppError('Categoria não encontrada', 404);

    if (dados.nome && dados.nome !== categoria.nome) {
      const where = { nome: dados.nome };
      if (categoria.estabelecimento_id) where.estabelecimento_id = categoria.estabelecimento_id;
      const existente = await this.Categoria.findOne({ where });
      if (existente) throw new AppError(`Categoria "${dados.nome}" já existe`, 409);
    }

    await categoria.update(dados);
    logger.info(`Categoria atualizada: ID ${id}`);
    return categoria;
  }

  /**
   * Remove categoria.
   * Lança erro se existirem produtos vinculados.
   */
  async remover(id) {
    const categoria = await this.Categoria.findByPk(id);
    if (!categoria) throw new AppError('Categoria não encontrada', 404);

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
    const categorias = await this.Categoria.findAll({
      where: { estabelecimento_id: fromEstabelecimentoId },
      include: [{ model: this.Produto, as: 'itens' }],
    });

    let totalCats = 0;
    let totalItens = 0;

    for (const cat of categorias) {
      const novaCat = await this.Categoria.create({
        nome:               cat.nome,
        descricao:          cat.descricao,
        ativo:              cat.ativo,
        estabelecimento_id: toEstabelecimentoId,
      });
      totalCats++;

      for (const item of cat.itens) {
        await this.Produto.create({
          nome:               item.nome,
          descricao:          item.descricao,
          preco:              item.preco,
          imagem:             item.imagem,
          disponivel:         item.disponivel,
          categoria_id:       novaCat.id,
          estabelecimento_id: toEstabelecimentoId,
        });
        totalItens++;
      }
    }

    return { categorias: totalCats, itens: totalItens };
  }
}

module.exports = CategoriaService;
