const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../backend/src/config/database');
const User = require('../../backend/src/models/User');
const Sweet = require('../../backend/src/models/Sweet');
const app = require('../../backend/src/app');

describe('Sweet Management', () => {
  let token;
  let adminToken;

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
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('POST /api/sweets', () => {
    test('should create a new sweet with valid data', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${token}`)
        .send(sweetData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('sweet');
      expect(response.body.sweet.name).toBe(sweetData.name);
      expect(response.body.sweet.category).toBe(sweetData.category);
      expect(response.body.sweet.price).toBe(sweetData.price);
      expect(response.body.sweet.quantity).toBe(sweetData.quantity);
    });

    test('should fail to create sweet without authentication', async () => {
      const sweetData = {
        name: 'Gummy Bears',
        category: 'Gummy',
        price: 1.99,
        quantity: 50
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(sweetData);

      expect(response.status).toBe(401);
    });

    test('should fail to create sweet without name', async () => {
      const sweetData = {
        category: 'Chocolate',
        price: 2.99,
        quantity: 100
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${token}`)
        .send(sweetData);

      expect(response.status).toBe(400);
    });

    test('should fail to create sweet without category', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        price: 2.99,
        quantity: 100
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${token}`)
        .send(sweetData);

      expect(response.status).toBe(400);
    });

    test('should fail to create sweet with negative price', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: -2.99,
        quantity: 100
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${token}`)
        .send(sweetData);

      expect(response.status).toBe(400);
    });

    test('should fail to create sweet with negative quantity', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.99,
        quantity: -10
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${token}`)
        .send(sweetData);

      expect(response.status).toBe(400);
    });

    test('should create sweet with default quantity 0 if not provided', async () => {
      const sweetData = {
        name: 'Lollipop',
        category: 'Hard Candy',
        price: 0.99
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${token}`)
        .send(sweetData);

      expect(response.status).toBe(201);
      expect(response.body.sweet.quantity).toBe(0);
    });
  });
});