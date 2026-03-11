const AppError = require('../utils/AppError');
const logger   = require('../config/logger');

class ItemService {
  /**
   * @param {{ Produto: import('../models/Produto'), Categoria: import('../models/Categoria') }} models
   */
  constructor(models) {
    this.Produto   = models.Produto;
    this.Categoria = models.Categoria;
  }

  /** Cria item vinculado a uma categoria. */
  async criar(categoriaId, dados) {
    const categoria = await this.Categoria.findByPk(categoriaId);
    if (!categoria) throw new AppError('Categoria não encontrada', 404);

    const item = await this.Produto.create({
      ...dados,
      categoria_id: categoriaId,
    });

    logger.info(`Item criado: "${item.nome}" (ID: ${item.id}) — Categoria: ${categoria.nome}`);
    return item;
  }

  /** Edita campos parciais de um item. */
  async editar(id, dados) {
    const item = await this.Produto.findByPk(id);
    if (!item) throw new AppError('Item não encontrado', 404);

    if (dados.categoria_id) {
      const cat = await this.Categoria.findByPk(dados.categoria_id);
      if (!cat) throw new AppError('Categoria destino não encontrada', 404);
    }

    await item.update(dados);
    logger.info(`Item atualizado: ID ${id}`);
    return item.reload();
  }

  /** Remove um item. */
  async remover(id) {
    const item = await this.Produto.findByPk(id);
    if (!item) throw new AppError('Item não encontrado', 404);

    await item.destroy();
    logger.info(`Item removido: ID ${id}`);
    return { success: true, message: 'Item removido com sucesso' };
  }

  /**
   * Liga/desliga disponibilidade de forma rápida.
   * Usado pelo admin no painel para ativar/desativar um item sem precisar editar tudo.
   */
  async alterarDisponibilidade(id, disponivel) {
    const item = await this.Produto.findByPk(id);
    if (!item) throw new AppError('Item não encontrado', 404);

    await item.update({ disponivel });
    logger.info(`Item #${id} — disponível: ${disponivel}`);
    return { id: item.id, nome: item.nome, disponivel };
  }
}

module.exports = ItemService;
