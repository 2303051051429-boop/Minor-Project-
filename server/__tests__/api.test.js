const request = require('supertest');
const app = require('../app');

describe('Health Check', () => {
  it('GET /api/health should return online status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Auth Routes - Validation', () => {
  it('POST /api/auth/login should reject missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('POST /api/auth/login should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notanemail', password: 'test123' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/register should reject short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: '123' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/auth/register should reject invalid role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: '123456', role: 'superadmin' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Items Routes - Auth Required', () => {
  it('POST /api/items should require authentication', async () => {
    const res = await request(app).post('/api/items').send({
      title: 'Test',
      description: 'Test description',
      category: 'Electronics',
      location: 'Library',
    });
    expect(res.statusCode).toBe(401);
  });

  it('PATCH /api/items/:id/resolve should require authentication', async () => {
    const res = await request(app).patch('/api/items/507f1f77bcf86cd799439011/resolve');
    expect(res.statusCode).toBe(401);
  });
});

describe('Dashboard Routes - Auth Required', () => {
  it('GET /api/dashboard/metrics should require authentication', async () => {
    const res = await request(app).get('/api/dashboard/metrics');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/dashboard/recent should require authentication', async () => {
    const res = await request(app).get('/api/dashboard/recent');
    expect(res.statusCode).toBe(401);
  });
});
