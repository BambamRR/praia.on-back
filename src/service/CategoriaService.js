const AppError = require('../utils/AppError');
const logger   = require('../config/logger');

class CategoriaService {
  /**
   * @param {{ Categoria: import('../models/Categoria'), Produto: import('../models/Produto') }} models
   * @param {import('../config/socket').SocketIO|null} io
   */
  constructor(models) {
    this.Categoria = models.Categoria;
    this.Produto   = models.Produto;
  }

  /** Lista todas as categorias ordenadas por nome. */
  async listar() {
    return this.Categoria.findAll({ order: [['nome', 'ASC']] });
  }

  /** Cria uma nova categoria. */
  async criar({ nome, ativo = true }) {
    const existente = await this.Categoria.findOne({ where: { nome } });
    if (existente) throw new AppError(`Categoria "${nome}" já existe`, 409);

    const categoria = await this.Categoria.create({ nome, ativo });
    logger.info(`Categoria criada: "${nome}" (ID: ${categoria.id})`);
    return categoria;
  }

  /** Edita uma categoria existente. */
  async editar(id, dados) {
    const categoria = await this.Categoria.findByPk(id);
    if (!categoria) throw new AppError('Categoria não encontrada', 404);

    if (dados.nome && dados.nome !== categoria.nome) {
      const existente = await this.Categoria.findOne({ where: { nome: dados.nome } });
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
}

module.exports = CategoriaService;
