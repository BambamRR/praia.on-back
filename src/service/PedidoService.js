const AppError     = require('../utils/AppError');
const logger       = require('../config/logger');

class PedidoService {
  constructor(models) {
    this.Pedido     = models.Pedido;
    this.PedidoItem = models.PedidoItem;
    this.Mesa       = models.Mesa;
    this.Produto    = models.Produto;
    this.sequelize  = models.sequelize;
  }

  /**
   * Lista todos os pedidos (admin).
   */
  async listarPedidos() {
    return this.Pedido.findAll({
      include: [
        { model: this.Mesa,       as: 'mesa',  attributes: ['id', 'numero'] },
        { model: this.PedidoItem, as: 'itens' },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Cria pedido com itens em transaction.
   * @param {object}  dados
   * @param {import('socket.io').Server|null} io  - instância Socket.io (opcional)
   */
  async criarPedido({ mesaId, itens, total, observacao }, io = null) {
    const mesa = await this.Mesa.findByPk(mesaId);
    if (!mesa) throw new AppError('Mesa não encontrada', 404);

    const t = await this.sequelize.transaction();
    try {
      const pedido = await this.Pedido.create(
        { mesa_id: mesaId, total, observacao, status: 'novo' },
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

      await mesa.update({ status: 'ocupada' }, { transaction: t });

      await t.commit();

      logger.info(`Pedido criado: #${pedido.id} — Mesa ${mesa.numero} — R$ ${total}`);

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
