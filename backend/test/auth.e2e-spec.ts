import request from 'supertest';
import { app } from './setup-e2e';

describe('Auth (e2e)', () => {
  it('POST /auth/login — admin login (200)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@urukaisklick.com', password: 'admin123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.role).toBe('ADMIN');
  });

  it('POST /auth/login — wrong password (401)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@urukaisklick.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  it('POST /auth/register — new customer (201)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: `test_${Date.now()}@test.com`,
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.role).toBe('CUSTOMER');
  });

  it('POST /auth/login — invalid payload (400)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'invalid' });

    expect(res.status).toBe(400);
  });
});
