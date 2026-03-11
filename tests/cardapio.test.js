const supertest = require('supertest');
const app       = require('../src/entrypoint/app');
const models    = require('../src/models');

const request = supertest(app);

beforeAll(async () => {
  await models.sequelize.sync({ force: false });
  /* Seed de categoria e produto para teste */
  await models.Categoria.findOrCreate({
    where: { nome: 'Porções' },
    defaults: { ativo: true },
  });
  const [cat] = await models.Categoria.findOrCreate({ where: { nome: 'Porções' } });
  await models.Produto.findOrCreate({
    where: { nome: 'Camarão Frito' },
    defaults: {
      descricao:    'Porção de 500g de camarão rosa',
      preco:        85.00,
      disponivel:   true,
      categoria_id: cat.id,
    },
  });
});

afterAll(async () => {
  await models.sequelize.close();
});

describe('Cardápio — GET /api/cardapio', () => {
  it('should return categorias with itens', async () => {
    const res = await request.get('/api/cardapio');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('categorias');
    expect(Array.isArray(res.body.data.categorias)).toBe(true);
  });

  it('each categoria should have itens array', async () => {
    const res = await request.get('/api/cardapio');
    const cats = res.body.data.categorias;
    cats.forEach((cat) => {
      expect(cat).toHaveProperty('nome');
      expect(cat).toHaveProperty('itens');
      expect(Array.isArray(cat.itens)).toBe(true);
    });
  });
});
