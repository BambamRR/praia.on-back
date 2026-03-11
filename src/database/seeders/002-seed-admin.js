'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const [perfil] = await queryInterface.sequelize.query(
      `SELECT id FROM perfis WHERE nome = 'administrador' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const senhaHash = await bcrypt.hash('Admin@123', 12);

    await queryInterface.bulkInsert('users', [
      {
        nome:      'Administrador PraiOn',
        email:     'admin@praion.com',
        senha:     senhaHash,
        telefone:  '11999999999',
        perfil_id: perfil.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: 'admin@praion.com' }, {});
  },
};
