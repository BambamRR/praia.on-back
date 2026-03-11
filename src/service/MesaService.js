const AppError = require('../utils/AppError');
const logger   = require('../config/logger');

class MesaService {
  constructor(models) {
    this.Mesa   = models.Mesa;
    this.Pedido = models.Pedido;
  }

  /**
   * Registra chamada de garçom para uma mesa.
   */
  async chamarGarcom(mesaId) {
    const mesa = await this.Mesa.findByPk(mesaId);
    if (!mesa) throw new AppError('Mesa não encontrada', 404);

    await mesa.update({ status: 'aguardando' });

    logger.info(`🔔 Garçom chamado: Mesa ${mesa.numero} (ID: ${mesaId})`);
    return { success: true, message: 'Garçom chamado com sucesso' };
  }

  /**
   * Retorna pedidos de uma mesa ordenados do mais recente.
   */
  async getPedidosByMesa(mesaId) {
    const mesa = await this.Mesa.findByPk(mesaId);
    if (!mesa) throw new AppError('Mesa não encontrada', 404);

    const pedidos = await this.Pedido.findAll({
      where:   { mesa_id: mesaId },
      include: [{ model: require('../models').PedidoItem, as: 'itens' }],
      order:   [['createdAt', 'DESC']],
    });

    return pedidos;
  }
}

module.exports = MesaService;
