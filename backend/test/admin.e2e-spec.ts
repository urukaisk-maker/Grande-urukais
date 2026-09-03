import request from 'supertest';
import { app } from './setup-e2e';

let adminToken: string;
let customerToken: string;

beforeAll(async () => {
  const adminLogin = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: 'admin@urukaisklick.com', password: 'admin123' });
  adminToken = adminLogin.body.accessToken;

  const customerLogin = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: 'demo@urukaisklick.com', password: 'password123' });
  customerToken = customerLogin.body.accessToken;
});

describe('Admin (e2e)', () => {
  it('GET /admin/stats — admin gets 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products');
    expect(res.body).toHaveProperty('orders');
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('totalRevenue');
    expect(res.body).toHaveProperty('lowStock');
  });

  it('GET /admin/stats — customer gets 403', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it('GET /admin/stats — no auth gets 401', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/admin/stats');
    expect(res.status).toBe(401);
  });

  it('GET /admin/products — admin list (200)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/products')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /admin/categories — create (201)', async () => {
    const uniqueSlug = `test-cat-${Date.now()}`;
    const res = await request(app.getHttpServer())
      .post('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `Test Category ${Date.now()}`, slug: uniqueSlug });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('name');
    expect(res.body.slug).toBe(uniqueSlug);
  });

  it('POST /admin/products — create (201)', async () => {
    const catRes = await request(app.getHttpServer())
      .get('/api/v1/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`);
    const catId = catRes.body[0].id;

    const res = await request(app.getHttpServer())
      .post('/api/v1/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product E2E',
        description: 'Created by e2e test',
        price: 19.99,
        stock: 100,
        categoryId: catId,
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Product E2E');
    expect(parseFloat(res.body.price)).toBe(19.99);
  });

  it('GET /admin/users — admin list (200)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /admin/orders — admin list (200)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /admin/reviews — admin list (200)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/admin/reviews')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
