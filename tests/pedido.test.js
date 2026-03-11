const supertest = require('supertest');
const app       = require('../src/entrypoint/app');
const models    = require('../src/models');

const request = supertest(app);

let authToken;
let mesaId;
let produto;

beforeAll(async () => {
  await models.sequelize.sync({ force: false });

  /* Criar mesa de teste */
  const mesa = await models.Mesa.create({ numero: 99, capacidade: 4 });
  mesaId = mesa.id;

  /* Criar categoria + produto */
  const [cat] = await models.Categoria.findOrCreate({ where: { nome: 'TestCat' }, defaults: { ativo: true } });
  produto = await models.Produto.create({
    nome: 'Item Teste', preco: 10.00, disponivel: true, categoria_id: cat.id,
  });

  /* Login para obter token */
  const res = await request.post('/api/auth/login').send({
    email: 'test@praion.com',
    senha: 'Senha@123',
  });
  authToken = res.body?.data?.token;
});

afterAll(async () => {
  await models.sequelize.close();
});

describe('Pedidos — POST /api/pedidos', () => {
  it('should create a pedido and return 201', async () => {
    const res = await request.post('/api/pedidos').send({
      mesaId,
      total: 10.00,
      itens: [{ id: produto.id, nome: produto.nome, quantidade: 1, preco: 10.00 }],
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
  });

  it('should return 400 for missing mesaId', async () => {
    const res = await request.post('/api/pedidos').send({ total: 10, itens: [] });
    expect(res.status).toBe(400);
  });
});

describe('Pedidos — GET /api/pedidos (admin)', () => {
  it('should list pedidos when authenticated', async () => {
    const res = await request.get('/api/pedidos')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return 401 without token', async () => {
    const res = await request.get('/api/pedidos');
    expect(res.status).toBe(401);
  });
});
