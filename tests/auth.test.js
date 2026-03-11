const supertest  = require('supertest');
const app        = require('../src/entrypoint/app');
const models     = require('../src/models');

const request = supertest(app);

beforeAll(async () => {
  await models.sequelize.sync({ force: true });
  /* Seed mínimo: perfil */
  await models.Perfil.bulkCreate([
    { nome: 'administrador' },
    { nome: 'fornecedor' },
  ]);
});

afterAll(async () => {
  await models.sequelize.close();
});

describe('Auth — POST /api/auth/register', () => {
  it('should register a new user and return token', async () => {
    const res = await request.post('/api/auth/register').send({
      nome:  'Test User',
      email: 'test@praion.com',
      senha: 'Senha@123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).not.toHaveProperty('senha');
  });

  it('should return 409 when email already exists', async () => {
    const res = await request.post('/api/auth/register').send({
      nome:  'Duplicado',
      email: 'test@praion.com',
      senha: 'Senha@123',
    });
    expect(res.status).toBe(409);
  });

  it('should return 400 for invalid data', async () => {
    const res = await request.post('/api/auth/register').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});

describe('Auth — POST /api/auth/login', () => {
  it('should login and return token', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'test@praion.com',
      senha: 'Senha@123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should return 401 for wrong credentials', async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'test@praion.com',
      senha: 'WrongPassword',
    });
    expect(res.status).toBe(401);
  });
});

describe('Auth — GET /api/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request.post('/api/auth/login').send({
      email: 'test@praion.com',
      senha: 'Senha@123',
    });
    token = res.body.data.token;
  });

  it('should return user data with valid token', async () => {
    const res = await request.get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('email', 'test@praion.com');
    expect(res.body.data).not.toHaveProperty('senha');
  });

  it('should return 401 without token', async () => {
    const res = await request.get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
