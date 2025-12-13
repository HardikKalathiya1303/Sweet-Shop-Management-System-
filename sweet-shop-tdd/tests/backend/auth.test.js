const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../backend/src/config/database');
const User = require('../../backend/src/models/User');
const app = require('../../backend/src/app');

describe('User Authentication - Registration', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user with valid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should fail to register with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'Password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    test('should fail to register with invalid email', async () => {
      const userData = {
        email: 'invalidemail',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
    });

    test('should fail to register with short password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
    });

    test('should hash password before saving', async () => {
      const userData = {
        email: 'hash@example.com',
        password: 'Password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const user = await User.findOne({ email: userData.email });
      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(20);
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user with valid credentials', async () => {
      const userData = {
        email: 'login@example.com',
        password: 'Password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
    });

    test('should fail to login with incorrect password', async () => {
      const userData = {
        email: 'user@example.com',
        password: 'Password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: 'WrongPassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('should fail to login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'Password123' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('should fail to login with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'Password123' });

      expect(response.status).toBe(400);
    });

    test('should fail to login with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
    });
  });
});