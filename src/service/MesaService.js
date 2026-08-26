const AppError = require('../utils/AppError');
const logger   = require('../config/logger');

/**
 * Taxa de serviço padrão (10%).
 * Pode ser movida para config/env no futuro.
 */
const TAXA_SERVICO = 0.10;

class MesaService {
  constructor(models) {
    this.Mesa        = models.Mesa;
    this.Pedido      = models.Pedido;
    this.PedidoItem  = models.PedidoItem;
    this.Produto     = models.Produto;
    this.SessaoMesa  = models.SessaoMesa;
    this.sequelize   = models.sequelize;
  }

  // ─────────────────────────────────────────────
  //  LISTAGEM / CRUD DE MESAS
  // ─────────────────────────────────────────────

  /** 
   * Lista todas as mesas com status atual. 
   * Se estabelecimento_id for informado, filtra por ele.
   */
  async listar(estabelecimento_id = null, includeSessoes = true) {
    const where = {};
    if (estabelecimento_id) where.estabelecimento_id = estabelecimento_id;

    const include = [{
      model: this.sequelize.models.Estabelecimento,
      as: 'estabelecimento',
      attributes: ['id', 'nome', 'slug'],
    }];
    if (includeSessoes) include.push({
      model: this.SessaoMesa,
      as: 'sessoes',
      where: { status: ['aberta', 'aguardando_fechamento'] },
      required: false,
      attributes: ['id', 'status', 'aberto_em', 'total', 'metodo_pagamento'],
    });

    return this.Mesa.findAll({
      where,
      include,
      order: [['numero', 'ASC']] 
    });
  }

  /** Cria nova mesa vinculada a um estabelecimento. */
  async criar({ numero, capacidade = 4, estabelecimento_id }) {
    if (!estabelecimento_id) throw new AppError('O ID do estabelecimento é obrigatório', 400);

    const existente = await this.Mesa.findOne({ 
      where: { numero, estabelecimento_id } 
    });
    if (existente) throw new AppError(`Mesa nº ${numero} já existe neste estabelecimento`, 409);

    const mesa = await this.Mesa.create({ numero, capacidade, estabelecimento_id });
    logger.info(`Mesa criada: nº ${numero} - Est: ${estabelecimento_id} (ID: ${mesa.id})`);
    return mesa;
  }

  /** Edita uma mesa existente. */
  async editar(id, { numero, capacidade, estabelecimento_id }, escopoEstabelecimentoId = null) {
    const mesa = await this.Mesa.findByPk(id);
    if (!mesa) throw new AppError('Mesa não encontrada', 404);

    // Multi-tenancy: usuário vinculado a um estabelecimento (parceiro) só pode
    // editar mesas do PRÓPRIO estabelecimento e não pode movê-las para outro.
    if (escopoEstabelecimentoId) {
      if (mesa.estabelecimento_id !== Number(escopoEstabelecimentoId)) {
        throw new AppError('Acesso não autorizado a esta mesa', 403);
      }
      if (estabelecimento_id && Number(estabelecimento_id) !== Number(escopoEstabelecimentoId)) {
        throw new AppError('Não é possível mover a mesa para outro estabelecimento', 403);
      }
    }

    // Se estiver mudando o número ou estabelecimento, verifica se já existe
    if (numero !== undefined || estabelecimento_id !== undefined) {
      const finalNumero = numero ?? mesa.numero;
      const finalEstId  = estabelecimento_id ?? mesa.estabelecimento_id;
      
      const existente = await this.Mesa.findOne({ 
        where: { 
          numero: finalNumero, 
          estabelecimento_id: finalEstId,
          id: { [this.sequelize.Sequelize.Op.ne]: id }
        } 
      });
      
      if (existente) {
        throw new AppError(`Já existe uma Mesa nº ${finalNumero} neste estabelecimento`, 409);
      }
    }

    await mesa.update({ numero, capacidade, estabelecimento_id });
    logger.info(`Mesa editada: ID ${id}`);
    return mesa;
  }

  /** Remove uma mesa — apenas se estiver livre e sem histórico/sessão. */
  async remover(id, estabelecimento_id = null) {
    const where = { id };
    if (estabelecimento_id) where.estabelecimento_id = estabelecimento_id;

    const mesa = await this.Mesa.findOne({ where });
    if (!mesa) throw new AppError('Mesa não encontrada', 404);

    if (mesa.status === 'ocupada') {
      throw new AppError('Não é possível remover uma mesa ocupada', 409);
    }
    if (mesa.status === 'aguardando') {
      throw new AppError('Não é possível remover uma mesa aguardando atendimento', 409);
    }

    // Mesa com sessão ativa não pode ser removida
    const sessaoAtiva = await this.SessaoMesa.count({
      where: { mesa_id: id, status: ['aberta', 'aguardando_fechamento'] },
    });
    if (sessaoAtiva > 0) {
      throw new AppError('Não é possível remover uma mesa com sessão em andamento', 409);
    }

    // Mesa com histórico de pedidos não pode ser removida (FK RESTRICT no banco)
    const qtdePedidos = await this.Pedido.count({ where: { mesa_id: id } });
    if (qtdePedidos > 0) {
      throw new AppError('Não é possível remover uma mesa com histórico de pedidos', 409);
    }

    await mesa.destroy();
    logger.info(`Mesa removida: ID ${id}`);
    return { success: true, message: 'Mesa removida com sucesso' };
  }

  // ─────────────────────────────────────────────
  //  SESSÕES DE MESA
  // ─────────────────────────────────────────────

  /** Abre uma nova sessão para a mesa (quando o cliente senta/faz primeiro pedido) */
  async abrirSessao(mesaId) {
    const t = await this.sequelize.transaction();
    try {
      const mesa = await this.Mesa.findByPk(mesaId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!mesa) throw new AppError('Mesa não encontrada', 404);

      const sessaoExistente = await this.SessaoMesa.findOne({
        where: { mesa_id: mesaId, status: 'aberta' },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (sessaoExistente) {
        await t.commit();
        return sessaoExistente;
      }

      const sessaoAguardando = await this.SessaoMesa.findOne({
        where: { mesa_id: mesaId, status: 'aguardando_fechamento' },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (sessaoAguardando) {
        throw new AppError('A mesa está aguardando o fechamento da conta', 409);
      }

      const sessao = await this.SessaoMesa.create({
        mesa_id: mesaId,
        status: 'aberta',
        aberto_em: new Date()
      }, { transaction: t });

      await mesa.update({ status: 'ocupada' }, { transaction: t });
      
      await t.commit();
      return sessao;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  /** Retorna a sessão ativa de uma mesa */
  async getSessaoAtiva(mesaId, sessionToken = null) {
    const where = { mesa_id: mesaId, status: ['aberta', 'aguardando_fechamento'] };
    if (sessionToken) where.session_token = sessionToken;

    return this.SessaoMesa.findOne({
      where,
    });
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

  /** Retorna pedidos de uma mesa (apenas da sessão ativa). */
  async getPedidosByMesa(mesaId, sessionToken) {
    if (!sessionToken) throw new AppError('session_token é obrigatório', 400);

    const sessao = await this.getSessaoAtiva(mesaId, sessionToken);
    if (!sessao) return [];

    const pedidos = await this.Pedido.findAll({
      where:   { mesa_id: mesaId, sessao_id: sessao.id },
      include: [{ model: this.PedidoItem, as: 'itens' }],
      order:   [['createdAt', 'DESC']],
    });

    return pedidos;
  }

  // ─────────────────────────────────────────────
  //  FECHAMENTO DE CONTA
  // ─────────────────────────────────────────────

  /**
   * Gera resumo da conta da mesa e muda status da sessão para 'aguardando_fechamento'.
   */
  async fecharConta(mesaId, io) {
    const mesa = await this.Mesa.findByPk(mesaId);
    if (!mesa) throw new AppError('Mesa não encontrada', 404);

    const sessao = await this.getSessaoAtiva(mesaId);
    if (!sessao) throw new AppError('Não há sessão ativa para esta mesa', 400);

    /* Busca todos os pedidos vinculados a esta sessão */
    const pedidos = await this.Pedido.findAll({
      where:   { sessao_id: sessao.id, status: ['novo', 'preparando', 'pronto', 'entregue'] },
      include: [{ model: this.PedidoItem, as: 'itens' }],
    });

    const subtotal     = pedidos.reduce((acc, p) => acc + parseFloat(p.total), 0);
    const taxaServico  = parseFloat((subtotal * TAXA_SERVICO).toFixed(2));
    const totalGeral   = parseFloat((subtotal + taxaServico).toFixed(2));

    const resumo = {
      mesaId,
      sessaoId:   sessao.id,
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

    await sessao.update({ status: 'aguardando_fechamento', total: totalGeral });
    await mesa.update({ status: 'aguardando' });

    logger.info(`💳 Fechar conta solicitado — Mesa ${mesa.numero} — Total: R$ ${totalGeral}`);

    if (io) {
      io.emit('fechar_conta', resumo);
    }

    return resumo;
  }

  /**
   * Finaliza oficialmente a conta da mesa e encerra a sessão.
   * @param {number}  mesaId
   * @param {string}  [metodoPagamento=null]
   * @param {number}  [desconto=0]      - Valor do desconto em R$ (aplicado sobre o totalBruto)
   * @param {boolean} [cobrarTaxa=true] - Se false, a taxa de serviço (10%) NÃO é cobrada
   */
  async finalizarConta(mesaId, metodoPagamento = null, desconto = 0, cobrarTaxa = true) {
    const mesa = await this.Mesa.findByPk(mesaId);
    if (!mesa) throw new AppError('Mesa não encontrada', 404);

    const sessao = await this.getSessaoAtiva(mesaId);
    if (!sessao) throw new AppError('Não há sessão ativa para esta mesa', 400);

    const pedidos = await this.Pedido.findAll({
      where: { sessao_id: sessao.id, status: ['novo', 'preparando', 'pronto', 'entregue'] },
      attributes: ['total'],
    });
    const subtotal = pedidos.reduce((total, pedido) => total + parseFloat(pedido.total), 0);

    // Quando a flag cobrarTaxa vem explícita, recalcula o total a partir do
    // subtotal (o valor gravado pelo fecharConta pode já conter a taxa).
    // Sem a flag (chamadas antigas), mantém o total da sessão por compatibilidade.
    let totalBruto;
    if (typeof cobrarTaxa === 'boolean') {
      totalBruto = cobrarTaxa
        ? parseFloat((subtotal * (1 + TAXA_SERVICO)).toFixed(2))
        : parseFloat(subtotal.toFixed(2));
    } else {
      totalBruto = parseFloat(sessao.total) || parseFloat((subtotal * (1 + TAXA_SERVICO)).toFixed(2));
    }
    const descontoValor = Math.max(0, Math.min(parseFloat(desconto) || 0, totalBruto)); // não negativo e não excede o total
    const totalFinal = parseFloat((totalBruto - descontoValor).toFixed(2));

    const t = await this.sequelize.transaction();
    try {
      // 1. Marca todos os pedidos da sessão como 'finalizado'
      await this.Pedido.update(
        { status: 'finalizado', metodo_pagamento: metodoPagamento },
        { 
          where: { sessao_id: sessao.id, status: ['novo', 'preparando', 'pronto', 'entregue'] },
          transaction: t
        }
      );

      // 2. Fecha a sessão — armazena o total final (após desconto) e o valor do desconto
      await sessao.update({ 
        status: 'fechada', 
        fechado_em: new Date(),
        total: totalFinal,
        desconto: descontoValor,
        metodo_pagamento: metodoPagamento 
      }, { transaction: t });

      // Garante que nenhuma sessão ativa permaneça associada à mesa.
      await this.SessaoMesa.update(
        { status: 'fechada', fechado_em: new Date(), metodo_pagamento: metodoPagamento },
        { where: { mesa_id: mesaId, status: ['aberta', 'aguardando_fechamento'] }, transaction: t },
      );

      // 3. Libera a mesa
      await mesa.update({ status: 'livre' }, { transaction: t });

      await t.commit();
      logger.info(`✅ Sessão ${sessao.id} encerrada e mesa ${mesa.numero} liberada.`);

      return { success: true, message: 'Conta finalizada e mesa liberada com sucesso', total: totalFinal, desconto: descontoValor };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}

module.exports = MesaService;
