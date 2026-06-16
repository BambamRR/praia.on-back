class CardapioService {
  constructor(models) {
    this.Categoria = models.Categoria;
    this.Produto   = models.Produto;
  }

  async getCardapio(estabelecimento_id = null, includeEmpty = false) {
    const whereProduto  = { disponivel: true };
    const whereCategoria = { ativo: true };

    if (estabelecimento_id) {
      whereProduto.estabelecimento_id  = estabelecimento_id;
      whereCategoria.estabelecimento_id = estabelecimento_id;
    }

    const categorias = await this.Categoria.findAll({
      where: whereCategoria,
      include: [
        {
          model:    this.Produto,
          as:       'itens',
          where:    whereProduto,
          required: !includeEmpty, // true = hide empty cats (client); false = show all (admin)
          attributes: ['id', 'nome', 'descricao', 'preco', 'imagem', 'disponivel', 'estabelecimento_id'],
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

