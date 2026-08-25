const AppError     = require('../utils/AppError');
const logger       = require('../config/logger');
const { Op }       = require('sequelize');

class PedidoService {
  constructor(models) {
    this.Pedido      = models.Pedido;
    this.PedidoItem  = models.PedidoItem;
    this.Mesa        = models.Mesa;
    this.Estabelecimento = models.Estabelecimento;
    this.Produto     = models.Produto;
    this.SessaoMesa  = models.SessaoMesa;
    this.sequelize   = models.sequelize;
  }

  /**
   * Lista todos os pedidos (admin).
   * Se estabelecimento_id for informado, filtra os pedidos das mesas daquele local.
   * Aceita filtro por período (data/dataInicio/dataFim) aplicado no createdAt,
   * no fuso de Brasília (UTC-3).
   */
  async listarPedidos(estabelecimento_id = null, filtros = {}) {
    const { historico = false } = filtros;

    if (historico) {
      return this.listarHistorico(estabelecimento_id, filtros);
    }

    const { mesa, data, dataInicio, dataFim } = filtros;
    const whereMesa = {};
    if (estabelecimento_id) whereMesa.estabelecimento_id = estabelecimento_id;
    if (mesa !== undefined && mesa !== null && mesa !== '' && /^\d+$/.test(String(mesa))) {
      whereMesa.numero = Number(mesa);
    }

    // Filtro por período: aplicado no createdAt do pedido, cobrindo o dia
    // inteiro (00:00:00 → 23:59:59) no fuso de Brasília (UTC-3), independente
    // do timezone do servidor.
    const wherePedido = {};
    const dateStart = dataInicio || data;
    const dateEnd   = dataFim || data;
    const criadoEm  = {};
    let temFiltroData = false;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStart || '')) {
      criadoEm[Op.gte] = new Date(`${dateStart}T00:00:00-03:00`);
      temFiltroData = true;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateEnd || '')) {
      criadoEm[Op.lte] = new Date(`${dateEnd}T23:59:59.999-03:00`);
      temFiltroData = true;
    }
    if (temFiltroData) wherePedido.createdAt = criadoEm;

    const include = [
      {
        model: this.Mesa,
        as: 'mesa',
        attributes: ['id', 'numero', 'estabelecimento_id'],
        where: whereMesa,
      },
      { model: this.PedidoItem, as: 'itens' },
      {
        model: this.SessaoMesa,
        as: 'sessao',
        attributes: ['id', 'status', 'aberto_em', 'fechado_em', 'total', 'desconto', 'metodo_pagamento'],
        required: false,
      },
    ];

    return this.Pedido.findAll({
      where: wherePedido,
      include,
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Histórico de mesas (comandas encerradas) com paginação.
   * Pagina por SessaoMesa fechada — 1 registro por comanda —, ordena pela
   * sessão mais recentemente encerrada no topo (fechado_em DESC) e devolve
   * todos os pedidos das sessões da página para o agrupamento no frontend.
   */
  async listarHistorico(estabelecimento_id = null, filtros = {}) {
    const { data, dataInicio, dataFim, mesa } = filtros;
    const page  = Math.max(1, parseInt(filtros.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(filtros.limit, 10) || 20));

    // Filtro por mesa/estabelecimento
    const whereMesa = {};
    if (estabelecimento_id) whereMesa.estabelecimento_id = estabelecimento_id;
    if (mesa !== undefined && mesa !== null && mesa !== '' && /^\d+$/.test(String(mesa))) {
      whereMesa.numero = Number(mesa);
    }

    // Filtro por data: casa a comanda com o dia em que ela ACONTECEU
    // (aberto_em — quando a mesa foi aberta), cobrindo o dia inteiro
    // (00:00:00 → 23:59:59) no fuso de Brasília (UTC-3), independente do
    // timezone do servidor. Sem o offset explícito, um servidor em UTC
    // deslocaria a janela em 3h e perderia/deslocaria registros do dia.
    const abertoEm = {};
    let temFiltroData = false;
    const dateStart = dataInicio || data;
    const dateEnd   = dataFim || data;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStart || '')) {
      abertoEm[Op.gte] = new Date(`${dateStart}T00:00:00-03:00`);
      temFiltroData = true;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateEnd || '')) {
      abertoEm[Op.lte] = new Date(`${dateEnd}T23:59:59.999-03:00`);
      temFiltroData = true;
    }

    const whereSessao = { status: 'fechada' };
    if (temFiltroData) whereSessao.aberto_em = abertoEm;

    const includeMesa = () => ({
      model: this.Mesa,
      as: 'mesa',
      attributes: ['id', 'numero', 'estabelecimento_id'],
      where: whereMesa,
      required: true,
    });

    // Apenas sessões que realmente renderizam uma linha no histórico:
    // precisam ter ao menos 1 pedido finalizado.
    const includePedidosFinalizados = () => ({
      model: this.Pedido,
      as: 'pedidos',
      where: { status: 'finalizado' },
      required: true,
      attributes: [],
    });

    // Total de comandas (sessões fechadas com pedidos) que casam com os filtros
    const total = await this.SessaoMesa.count({
      where: whereSessao,
      include: [includeMesa(), includePedidosFinalizados()],
      distinct: true,
    });

    // Página de sessões — mais recente no topo
    const sessoes = await this.SessaoMesa.findAll({
      where: whereSessao,
      include: [includeMesa(), includePedidosFinalizados()],
      order: [['fechado_em', 'DESC'], ['id', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      subQuery: false,
      distinct: true,
    });

    let pedidos = [];
    if (sessoes.length) {
      pedidos = await this.Pedido.findAll({
        where: { sessao_id: { [Op.in]: sessoes.map((s) => s.id) } },
        include: [
          {
            model: this.Mesa,
            as: 'mesa',
            attributes: ['id', 'numero', 'estabelecimento_id'],
            include: [{
              model: this.Estabelecimento,
              as: 'estabelecimento',
              attributes: ['id', 'nome'],
            }],
          },
          { model: this.PedidoItem, as: 'itens' },
          {
            model: this.SessaoMesa,
            as: 'sessao',
            attributes: ['id', 'status', 'aberto_em', 'fechado_em', 'total', 'desconto', 'metodo_pagamento'],
            required: false,
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      // Mantém a ordem das sessões da página (mais recente no topo)
      const ordem = new Map(sessoes.map((s, i) => [s.id, i]));
      pedidos.sort(
        (a, b) => (ordem.get(a.sessao_id) ?? Number.MAX_SAFE_INTEGER) - (ordem.get(b.sessao_id) ?? Number.MAX_SAFE_INTEGER)
      );
    }

    return {
      pedidos,
      paginacao: {
        page,
        limit,
        total,
        totalPaginas: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  /**
   * Cria pedido com itens em transaction.
   * Agora vincula o pedido obrigatoriamente a uma SessaoMesa ativa.
   */
  async criarPedido({ mesaId, itens, observacao }, io = null) {
    const t = await this.sequelize.transaction();
    try {
      const mesa = await this.Mesa.findByPk(mesaId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!mesa) throw new AppError('Mesa não encontrada', 404);

      const produtoIds = [...new Set(itens.map((item) => item.id))];
      const whereProduto = { id: produtoIds, disponivel: true };
      if (mesa.estabelecimento_id) whereProduto.estabelecimento_id = mesa.estabelecimento_id;

      const produtos = await this.Produto.findAll({ where: whereProduto, transaction: t });
      if (produtos.length !== produtoIds.length) {
        throw new AppError('Um ou mais itens não estão disponíveis para esta mesa', 400);
      }

      const produtosMap = new Map(produtos.map((produto) => [produto.id, produto]));

      const pedidoItens = itens.map((item) => {
        const produto = produtosMap.get(item.id);
        const preco = parseFloat(produto.preco);
        const subtotal = parseFloat((item.quantidade * preco).toFixed(2));

        return {
          produto_id:     produto.id,
          nome:           produto.nome,
          quantidade:     item.quantidade,
          preco_unitario: preco,
          subtotal,
          observacao:     item.observacao || null,
        };
      });

      const total = parseFloat(pedidoItens.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2));

      // 1. Buscar ou Criar Sessão Ativa
      let sessao = await this.SessaoMesa.findOne({
        where: { mesa_id: mesaId, status: 'aberta' },
        transaction: t
      });

      if (!sessao) {
        const sessaoAguardando = await this.SessaoMesa.findOne({
          where: { mesa_id: mesaId, status: 'aguardando_fechamento' },
          transaction: t,
        });
        if (sessaoAguardando) {
          throw new AppError('A mesa está aguardando o fechamento da conta', 409);
        }

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

      await this.PedidoItem.bulkCreate(
        pedidoItens.map((item) => ({ ...item, pedido_id: pedido.id })),
        { transaction: t }
      );

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
