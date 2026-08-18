'use strict';

const bcrypt = require('bcryptjs');

const now = () => new Date();

async function findOne(queryInterface, sql, replacements = {}) {
  const [row] = await queryInterface.sequelize.query(sql, {
    replacements,
    type: queryInterface.sequelize.QueryTypes.SELECT,
  });
  return row || null;
}

async function ensurePerfil(queryInterface, nome) {
  let perfil = await findOne(queryInterface, 'SELECT id FROM perfis WHERE nome = :nome LIMIT 1', { nome });
  if (!perfil) {
    await queryInterface.bulkInsert('perfis', [{ nome, createdAt: now(), updatedAt: now() }]);
    perfil = await findOne(queryInterface, 'SELECT id FROM perfis WHERE nome = :nome LIMIT 1', { nome });
  }
  return perfil;
}

async function ensureEstabelecimento(queryInterface) {
  let estabelecimento = await findOne(
    queryInterface,
    `SELECT id FROM estabelecimentos WHERE slug = 'praion-beach' OR nome = 'PraiOn Beach' ORDER BY id ASC LIMIT 1`,
  );

  if (!estabelecimento) {
    await queryInterface.bulkInsert('estabelecimentos', [{
      nome: 'PraiOn Beach',
      slug: 'praion-beach',
      tipo: 'bar_praia',
      cidade: 'Recife',
      estado: 'PE',
      telefone: '81999999999',
      descricao: 'Estabelecimento demonstrativo para validar o fluxo minimo de pedidos.',
      ativo: true,
      createdAt: now(),
      updatedAt: now(),
    }]);
    estabelecimento = await findOne(queryInterface, `SELECT id FROM estabelecimentos WHERE slug = 'praion-beach' LIMIT 1`);
  } else {
    await queryInterface.bulkUpdate('estabelecimentos', {
      slug: 'praion-beach',
      ativo: true,
      updatedAt: now(),
    }, { id: estabelecimento.id });
  }

  return estabelecimento;
}

async function ensureUser(queryInterface, { nome, email, senha, telefone, perfil_id, estabelecimento_id = null }) {
  const senhaHash = await bcrypt.hash(senha, 12);
  const user = await findOne(queryInterface, 'SELECT id FROM users WHERE email = :email LIMIT 1', { email });

  const data = {
    nome,
    senha: senhaHash,
    telefone,
    perfil_id,
    estabelecimento_id,
    updatedAt: now(),
  };

  if (user) {
    await queryInterface.bulkUpdate('users', data, { id: user.id });
    return user;
  }

  await queryInterface.bulkInsert('users', [{
    ...data,
    email,
    createdAt: now(),
  }]);
  return findOne(queryInterface, 'SELECT id FROM users WHERE email = :email LIMIT 1', { email });
}

async function ensureMesa(queryInterface, { numero, capacidade, estabelecimento_id }) {
  const mesa = await findOne(
    queryInterface,
    'SELECT id FROM mesas WHERE numero = :numero AND estabelecimento_id = :estabelecimento_id LIMIT 1',
    { numero, estabelecimento_id },
  );

  if (mesa) return mesa;

  await queryInterface.bulkInsert('mesas', [{
    numero,
    capacidade,
    status: 'livre',
    estabelecimento_id,
    qr_code: `/praion-beach/mesa/${numero}`,
    createdAt: now(),
    updatedAt: now(),
  }]);

  return findOne(
    queryInterface,
    'SELECT id FROM mesas WHERE numero = :numero AND estabelecimento_id = :estabelecimento_id LIMIT 1',
    { numero, estabelecimento_id },
  );
}

async function ensureCategoria(queryInterface, { nome, descricao, estabelecimento_id }) {
  let categoria = await findOne(
    queryInterface,
    'SELECT id FROM categorias WHERE nome = :nome AND estabelecimento_id = :estabelecimento_id LIMIT 1',
    { nome, estabelecimento_id },
  );

  if (!categoria) {
    await queryInterface.bulkInsert('categorias', [{
      nome,
      descricao,
      ativo: true,
      estabelecimento_id,
      createdAt: now(),
      updatedAt: now(),
    }]);
    categoria = await findOne(
      queryInterface,
      'SELECT id FROM categorias WHERE nome = :nome AND estabelecimento_id = :estabelecimento_id LIMIT 1',
      { nome, estabelecimento_id },
    );
  }

  return categoria;
}

async function ensureProduto(queryInterface, { nome, descricao, preco, categoria_id, estabelecimento_id }) {
  const produto = await findOne(
    queryInterface,
    'SELECT id FROM produtos WHERE nome = :nome AND categoria_id = :categoria_id AND estabelecimento_id = :estabelecimento_id LIMIT 1',
    { nome, categoria_id, estabelecimento_id },
  );

  const data = {
    descricao,
    preco,
    disponivel: true,
    categoria_id,
    estabelecimento_id,
    updatedAt: now(),
  };

  if (produto) {
    await queryInterface.bulkUpdate('produtos', data, { id: produto.id });
    return produto;
  }

  await queryInterface.bulkInsert('produtos', [{
    nome,
    imagem: null,
    ...data,
    createdAt: now(),
  }]);
  return findOne(
    queryInterface,
    'SELECT id FROM produtos WHERE nome = :nome AND categoria_id = :categoria_id AND estabelecimento_id = :estabelecimento_id LIMIT 1',
    { nome, categoria_id, estabelecimento_id },
  );
}

module.exports = {
  async up(queryInterface) {
    const administrador = await ensurePerfil(queryInterface, 'administrador');
    const fornecedor = await ensurePerfil(queryInterface, 'fornecedor');
    const estabelecimento = await ensureEstabelecimento(queryInterface);

    await ensureUser(queryInterface, {
      nome: 'Administrador Master',
      email: 'admin@praion.com',
      senha: 'Admin@123',
      telefone: '11999999999',
      perfil_id: administrador.id,
      estabelecimento_id: null,
    });

    await ensureUser(queryInterface, {
      nome: 'Parceiro PraiOn Beach',
      email: 'parceiro@praion.com',
      senha: 'Parceiro@123',
      telefone: '81999999999',
      perfil_id: fornecedor.id,
      estabelecimento_id: estabelecimento.id,
    });

    await ensureMesa(queryInterface, { numero: 1, capacidade: 4, estabelecimento_id: estabelecimento.id });
    await ensureMesa(queryInterface, { numero: 2, capacidade: 4, estabelecimento_id: estabelecimento.id });

    const bebidas = await ensureCategoria(queryInterface, {
      nome: 'Bebidas',
      descricao: 'Bebidas geladas para atendimento rapido.',
      estabelecimento_id: estabelecimento.id,
    });

    const petiscos = await ensureCategoria(queryInterface, {
      nome: 'Petiscos',
      descricao: 'Porcoes simples para validar pedidos.',
      estabelecimento_id: estabelecimento.id,
    });

    await ensureProduto(queryInterface, {
      nome: 'Agua de Coco',
      descricao: 'Agua de coco natural gelada.',
      preco: 8.5,
      categoria_id: bebidas.id,
      estabelecimento_id: estabelecimento.id,
    });

    await ensureProduto(queryInterface, {
      nome: 'Suco de Limao',
      descricao: 'Suco natural de limao.',
      preco: 10,
      categoria_id: bebidas.id,
      estabelecimento_id: estabelecimento.id,
    });

    await ensureProduto(queryInterface, {
      nome: 'Batata Frita',
      descricao: 'Porcao individual de batata frita.',
      preco: 24,
      categoria_id: petiscos.id,
      estabelecimento_id: estabelecimento.id,
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('produtos', { nome: ['Agua de Coco', 'Suco de Limao', 'Batata Frita'] }, {});
    await queryInterface.bulkDelete('categorias', { nome: ['Bebidas', 'Petiscos'] }, {});
    await queryInterface.bulkDelete('mesas', { numero: [1, 2] }, {});
    await queryInterface.bulkDelete('users', { email: ['admin@praion.com', 'parceiro@praion.com'] }, {});
  },
};
