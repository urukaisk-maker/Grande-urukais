import request from 'supertest';
import { app } from './setup-e2e';

let adminToken: string;

beforeAll(async () => {
  const adminLogin = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: 'admin@urukaisklick.com', password: 'admin123' });
  adminToken = adminLogin.body.accessToken;
});

describe('Payments (e2e)', () => {
  it('POST /orders/checkout — creates order with mock payment (no Stripe)', async () => {
    const catRes = await request(app.getHttpServer()).get('/api/v1/categories');
    const catId = catRes.body[0].id;

    const prodRes = await request(app.getHttpServer()).get('/api/v1/products');
    const product = prodRes.body.data[0];

    const res = await request(app.getHttpServer())
      .post('/api/v1/orders/checkout')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        items: [
          {
            productId: product.id,
            productName: product.name,
            unitPrice: product.price,
            quantity: 2,
          },
        ],
        customerEmail: 'test-checkout@urukaisklick.com',
        customerName: 'Test Checkout',
        customerPhone: '+34600000000',
        shippingAddress: 'Test Address 123',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('order');
    expect(res.body).toHaveProperty('clientSecret');
    expect(res.body.clientSecret).toContain('mock_secret_');
  });

  it('POST /payments/stripe/webhook — no signature returns 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments/stripe/webhook')
      .send({});

    expect(res.status).toBe(400);
  });

  it('POST /payments/stripe/webhook — invalid signature returns 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/payments/stripe/webhook')
      .set('stripe-signature', 'invalid_signature')
      .send(JSON.stringify({ type: 'payment_intent.succeeded' }));

    expect(res.status).toBe(400);
  });

  it('GET /admin/orders — shows payments in order detail', async () => {
    const ordersRes = await request(app.getHttpServer())
      .get('/api/v1/admin/orders?page=1&limit=1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(ordersRes.status).toBe(200);
    if (ordersRes.body.data.length > 0) {
      const orderId = ordersRes.body.data[0].id;
      const detail = await request(app.getHttpServer())
        .get(`/api/v1/admin/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(detail.status).toBe(200);
      expect(detail.body).toHaveProperty('items');
      expect(detail.body).toHaveProperty('payments');
    }
  });
});
