'use strict';

let _io = null;

/**
 * Inicializa o Socket.io e armazena a instância globalmente.
 * Chamado em server.js após criar o httpServer.
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
function initSocket(httpServer) {
  const { Server } = require('socket.io');

  _io = new Server(httpServer, {
    cors: {
      origin:  process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  _io.on('connection', (socket) => {
    const logger = require('./logger');
    logger.info(`Socket conectado: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Socket desconectado: ${socket.id}`);
    });
  });

  return _io;
}

/**
 * Retorna a instância do Socket.io.
 * Lança erro se `initSocket` ainda não foi chamado.
 * @returns {import('socket.io').Server}
 */
function getIO() {
  if (!_io) throw new Error('Socket.io não foi inicializado. Chame initSocket() primeiro.');
  return _io;
}

module.exports = { initSocket, getIO };
