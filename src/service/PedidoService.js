const AppError     = require('../utils/AppError');
const logger       = require('../config/logger');

class PedidoService {
  constructor(models) {
    this.Pedido      = models.Pedido;
    this.PedidoItem  = models.PedidoItem;
    this.Mesa        = models.Mesa;
    this.Produto     = models.Produto;
    this.SessaoMesa  = models.SessaoMesa;
    this.sequelize   = models.sequelize;
  }

  /**
   * Lista todos os pedidos (admin).
   * Se estabelecimento_id for informado, filtra os pedidos das mesas daquele local.
   */
  async listarPedidos(estabelecimento_id = null) {
    const whereMesa = {};
    if (estabelecimento_id) whereMesa.estabelecimento_id = estabelecimento_id;

    return this.Pedido.findAll({
      include: [
        { 
          model: this.Mesa, 
          as: 'mesa', 
          attributes: ['id', 'numero', 'estabelecimento_id'],
          where: whereMesa 
        },
        { model: this.PedidoItem, as: 'itens' },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Cria pedido com itens em transaction.
   * Agora vincula o pedido obrigatoriamente a uma SessaoMesa ativa.
   */
  async criarPedido({ mesaId, itens, total, observacao }, io = null) {
    const mesa = await this.Mesa.findByPk(mesaId);
    if (!mesa) throw new AppError('Mesa não encontrada', 404);

    const t = await this.sequelize.transaction();
    try {
      // 1. Buscar ou Criar Sessão Ativa
      let sessao = await this.SessaoMesa.findOne({
        where: { mesa_id: mesaId, status: 'aberta' },
        transaction: t
      });

      if (!sessao) {
        sessao = await this.SessaoMesa.create({
          mesa_id: mesaId,
          status: 'aberta',
          aberto_em: new Date()
        }, { transaction: t });
      }

      // 2. Criar o Pedido vinculado à sessão
      const pedido = await this.Pedido.create(
        { 
          mesa_id: mesaId, 
          sessao_id: sessao.id,
          total, 
          observacao, 
          status: 'novo' 
        },
        { transaction: t }
      );

      const pedidoItens = itens.map((item) => ({
        pedido_id:      pedido.id,
        produto_id:     item.id,
        nome:           item.nome,
        quantidade:     item.quantidade,
        preco_unitario: item.preco,
        subtotal:       parseFloat((item.quantidade * item.preco).toFixed(2)),
        observacao:     item.observacao || null,
      }));

      await this.PedidoItem.bulkCreate(pedidoItens, { transaction: t });

      // Garante que a mesa está marcada como ocupada
      await mesa.update({ status: 'ocupada' }, { transaction: t });

      await t.commit();

      logger.info(`Pedido criado: #${pedido.id} — Mesa ${mesa.numero} — Sessão ${sessao.id} — R$ ${total}`);

      const pedidoCompleto = await this.Pedido.findByPk(pedido.id, {
        include: [
          { model: this.Mesa,       as: 'mesa',  attributes: ['id', 'numero'] },
          { model: this.PedidoItem, as: 'itens' },
        ],
      });

      /* Emite evento em tempo real para o painel admin */
      if (io) {
        io.emit('novo_pedido', {
          pedido: pedidoCompleto,
          timestamp: new Date().toISOString(),
        });
      }

      return pedidoCompleto;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /**
   * Atualiza status de um pedido.
   */
  async atualizarStatus(pedidoId, status) {
    const pedido = await this.Pedido.findByPk(pedidoId);
    if (!pedido) throw new AppError('Pedido não encontrado', 404);

    await pedido.update({ status });

    logger.info(`Pedido #${pedidoId} → status: ${status}`);
    return pedido;
  }
}

module.exports = PedidoService;
