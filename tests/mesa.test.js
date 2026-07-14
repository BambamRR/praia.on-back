const supertest = require('supertest');
const app       = require('../src/entrypoint/app');
const models    = require('../src/models');

const request = supertest(app);

let authToken;
let mesaId;
let estabelecimentoId;

beforeAll(async () => {
  await models.sequelize.sync({ force: false });

  /* Criar estabelecimento de teste */
  const estabelecimento = await models.Estabelecimento.create({
    nome: 'Estabelecimento Teste',
    cnpj: '12345678901234',
    email: 'est@teste.com'
  });
  estabelecimentoId = estabelecimento.id;

  /* Login para obter token - Assumindo que o test@praion.com foi criado pelo auth.test.js ou existe */
  const res = await request.post('/api/auth/login').send({
    email: 'test@praion.com',
    senha: 'Senha@123',
  });
  authToken = res.body?.data?.token;

  // Se o token não vier (caso os testes rodarem isolados), tentamos criar o usuário
  if (!authToken) {
    const userRes = await request.post('/api/auth/register').send({
      nome: 'Test User Mesa',
      email: 'testmesa@praion.com',
      senha: 'Senha@123',
    });
    authToken = userRes.body?.data?.token;
  }
});

afterAll(async () => {
  await models.sequelize.close();
});

describe('Mesas — POST /api/mesas', () => {
  it('should create a mesa and return 201', async () => {
    const res = await request.post('/api/mesas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        numero: 10,
        capacidade: 4,
        estabelecimento_id: estabelecimentoId
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.numero).toBe(10);

    mesaId = res.body.data.id;
  });

  it('should return 401 without token', async () => {
    const res = await request.post('/api/mesas').send({
      numero: 11,
      capacidade: 2
    });
    expect(res.status).toBe(401);
  });
});

describe('Mesas — GET /api/mesas', () => {
  it('should list mesas when authenticated', async () => {
    const res = await request.get('/api/mesas')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.mesas)).toBe(true);
  });
});

describe('Mesas — PUT /api/mesas/:id', () => {
  it('should update an existing mesa', async () => {
    const res = await request.put(`/api/mesas/${mesaId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        numero: 10,
        capacidade: 6, // Updated capacity
        estabelecimento_id: estabelecimentoId
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Mesas — DELETE /api/mesas/:id', () => {
  it('should delete a mesa', async () => {
    const res = await request.delete(`/api/mesas/${mesaId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
