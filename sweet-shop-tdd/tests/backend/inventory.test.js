const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../backend/src/config/database');
const User = require('../../backend/src/models/User');
const Sweet = require('../../backend/src/models/Sweet');
const app = require('../../backend/src/app');

describe('Inventory Management - Purchase', () => {
  let token;
  let adminToken;
  let sweetId;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Sweet.deleteMany({});

    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@example.com',
        password: 'Password123'
      });
    token = userResponse.body.token;

    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'AdminPass123',
        role: 'admin'
      });
    adminToken = adminResponse.body.token;

    const sweetData = {
      name: 'Chocolate Bar',
      category: 'Chocolate',
      price: 2.99,
      quantity: 100
    };

    const sweetResponse = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${token}`)
      .send(sweetData);

    sweetId = sweetResponse.body.sweet._id;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('POST /api/sweets/:id/purchase', () => {
    test('should purchase sweet with valid quantity', async () => {
      const purchaseData = {
        quantity: 10
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .send(purchaseData);

      expect(response.status).toBe(200);
      expect(response.body.sweet.quantity).toBe(90);
      expect(response.body).toHaveProperty('message');
    });

    test('should fail to purchase without authentication', async () => {
      const purchaseData = {
        quantity: 10
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .send(purchaseData);

      expect(response.status).toBe(401);
    });

    test('should fail to purchase with insufficient stock', async () => {
      const purchaseData = {
        quantity: 150
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .send(purchaseData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Insufficient stock');
    });

    test('should fail to purchase with zero quantity', async () => {
      const purchaseData = {
        quantity: 0
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .send(purchaseData);

      expect(response.status).toBe(400);
    });

    test('should fail to purchase with negative quantity', async () => {
      const purchaseData = {
        quantity: -5
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .send(purchaseData);

      expect(response.status).toBe(400);
    });

    test('should fail to purchase without quantity', async () => {
      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
    });

    test('should fail to purchase with invalid sweet id', async () => {
      const purchaseData = {
        quantity: 10
      };

      const response = await request(app)
        .post('/api/sweets/invalidid123/purchase')
        .set('Authorization', `Bearer ${token}`)
        .send(purchaseData);

      expect(response.status).toBe(400);
    });

    test('should fail to purchase non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const purchaseData = {
        quantity: 10
      };

      const response = await request(app)
        .post(`/api/sweets/${fakeId}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .send(purchaseData);

      expect(response.status).toBe(404);
    });

    test('should purchase entire stock', async () => {
      const purchaseData = {
        quantity: 100
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .send(purchaseData);

      expect(response.status).toBe(200);
      expect(response.body.sweet.quantity).toBe(0);
    });

    test('should fail to purchase from empty stock', async () => {
      await Sweet.findByIdAndUpdate(sweetId, { quantity: 0 });

      const purchaseData = {
        quantity: 1
      };

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${token}`)
        .send(purchaseData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('out of stock');
    });
  });
});