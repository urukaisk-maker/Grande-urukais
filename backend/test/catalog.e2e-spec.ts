import request from 'supertest';
import { app } from './setup-e2e';

describe('Catalog (e2e)', () => {
  it('GET /products — public list (200)', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/products');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
  });

  it('GET /categories — public list (200)', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /products?categoryId=... — filter (200)', async () => {
    const catRes = await request(app.getHttpServer()).get('/api/v1/categories');
    const catId = catRes.body[0].id;

    const res = await request(app.getHttpServer())
      .get(`/api/v1/products?categoryId=${catId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((p: any) => p.categoryId === catId)).toBe(true);
  });

  it('GET /products/:id — valid product (200)', async () => {
    const list = await request(app.getHttpServer()).get('/api/v1/products');
    const productId = list.body.data[0].id;

    const res = await request(app.getHttpServer()).get(`/api/v1/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name');
    expect(res.body).toHaveProperty('price');
    expect(res.body).toHaveProperty('category');
  });

  it('GET /health — health check (200)', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
  });
});
