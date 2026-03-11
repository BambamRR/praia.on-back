class CardapioService {
  constructor(models) {
    this.Categoria = models.Categoria;
    this.Produto   = models.Produto;
  }

  /**
   * Retorna todas as categorias ativas com seus produtos disponíveis.
   */
  async getCardapio() {
    const categorias = await this.Categoria.findAll({
      where: { ativo: true },
      include: [
        {
          model:    this.Produto,
          as:       'itens',
          where:    { disponivel: true },
          required: false,
          attributes: ['id', 'nome', 'descricao', 'preco', 'imagem', 'disponivel'],
        },
      ],
      order: [
        ['nome', 'ASC'],
        [{ model: this.Produto, as: 'itens' }, 'nome', 'ASC'],
      ],
    });

    return { categorias };
  }
}

module.exports = CardapioService;
