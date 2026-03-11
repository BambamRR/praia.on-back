const AppError = require('../utils/AppError');
const logger   = require('../config/logger');

/**
 * Taxa de serviço padrão (10%).
 * Pode ser movida para config/env no futuro.
 */
const TAXA_SERVICO = 0.10;

class MesaService {
  constructor(models) {
    this.Mesa       = models.Mesa;
    this.Pedido     = models.Pedido;
    this.PedidoItem = models.PedidoItem;
    this.Produto    = models.Produto;
    this.sequelize  = models.sequelize;
  }

  // ─────────────────────────────────────────────
  //  LISTAGEM / CRUD DE MESAS
  // ─────────────────────────────────────────────

  /** Lista todas as mesas com status atual. */
  async listar() {
    return this.Mesa.findAll({ order: [['numero', 'ASC']] });
  }

  /** Cria nova mesa. */
  async criar({ numero, capacidade = 4 }) {
    const existente = await this.Mesa.findOne({ where: { numero } });
    if (existente) throw new AppError(`Mesa nº ${numero} já existe`, 409);

    const mesa = await this.Mesa.create({ numero, capacidade });
    logger.info(`Mesa criada: nº ${numero} (ID: ${mesa.id})`);
    return mesa;
  }

  /** Remove uma mesa — apenas se estiver livre. */
  async remover(id) {
    const mesa = await this.Mesa.findByPk(id);
    if (!mesa) throw new AppError('Mesa não encontrada', 404);

    if (mesa.status === 'ocupada') {
      throw new AppError('Não é possível remover uma mesa ocupada', 409);
    }

    await mesa.destroy();
    logger.info(`Mesa removida: ID ${id}`);
    return { success: true, message: 'Mesa removida com sucesso' };
  }

  // ─────────────────────────────────────────────
  //  OPERAÇÕES DE ATENDIMENTO
  // ─────────────────────────────────────────────

  /** Registra chamada de garçom para uma mesa e emite evento Socket. */
  async chamarGarcom(mesaId, io) {
    const mesa = await this.Mesa.findByPk(mesaId);
    if (!mesa) throw new AppError('Mesa não encontrada', 404);

    await mesa.update({ status: 'aguardando' });

    logger.info(`🔔 Garçom chamado: Mesa ${mesa.numero} (ID: ${mesaId})`);

    if (io) {
      io.emit('chamada_garcom', {
        mesaId,
        numero:    mesa.numero,
        timestamp: new Date().toISOString(),
      });
    }

    return { success: true, message: 'Garçom chamado com sucesso' };
  }

  /** Retorna pedidos de uma mesa ordenados do mais recente. */
  async getPedidosByMesa(mesaId) {
    const mesa = await this.Mesa.findByPk(mesaId);
    if (!mesa) throw new AppError('Mesa não encontrada', 404);

    const pedidos = await this.Pedido.findAll({
      where:   { mesa_id: mesaId },
      include: [{ model: this.PedidoItem, as: 'itens' }],
      order:   [['createdAt', 'DESC']],
    });

    return pedidos;
  }

  // ─────────────────────────────────────────────
  //  FECHAMENTO DE CONTA
  // ─────────────────────────────────────────────

  /**
   * Gera resumo da conta da mesa (subtotal + taxa de serviço).
   * Emite evento Socket.io `fechar_conta` para o painel admin.
   */
  async fecharConta(mesaId, io) {
    const mesa = await this.Mesa.findByPk(mesaId);
    if (!mesa) throw new AppError('Mesa não encontrada', 404);

    /* Busca todos os pedidos não cancelados da mesa */
    const pedidos = await this.Pedido.findAll({
      where:   { mesa_id: mesaId, status: ['novo', 'preparando', 'pronto', 'entregue'] },
      include: [{ model: this.PedidoItem, as: 'itens' }],
    });

    if (!pedidos.length) {
      throw new AppError('Sem pedidos ativos para fechar a conta desta mesa', 404);
    }

    const subtotal     = pedidos.reduce((acc, p) => acc + parseFloat(p.total), 0);
    const taxaServico  = parseFloat((subtotal * TAXA_SERVICO).toFixed(2));
    const totalGeral   = parseFloat((subtotal + taxaServico).toFixed(2));

    const resumo = {
      mesaId,
      numero:     mesa.numero,
      pedidos:    pedidos.map((p) => ({
        id:     p.id,
        status: p.status,
        total:  p.total,
        itens:  p.itens,
      })),
      subtotal:    parseFloat(subtotal.toFixed(2)),
      taxaServico,
      totalGeral,
      timestamp:   new Date().toISOString(),
    };

    logger.info(`💳 Fechar conta solicitado — Mesa ${mesa.numero} — Total: R$ ${totalGeral}`);

    if (io) {
      io.emit('fechar_conta', resumo);
    }

    return resumo;
  }
}

module.exports = MesaService;
