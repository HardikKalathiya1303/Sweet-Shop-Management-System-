const request = require('supertest');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../backend/src/config/database');
const User = require('../../backend/src/models/User');
const app = require('../../backend/src/app');
const { generateToken } = require('../../backend/src/utils/tokenGenerator');

describe('Authentication Middleware', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'middleware@example.com',
        password: 'Password123'
      });
    
    token = response.body.token;
    userId = response.body.user.id;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('Protected Route Access', () => {
    test('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
    });

    test('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/protected');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    test('should deny access with malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', token);

      expect(response.status).toBe(401);
    });

    test('should deny access with expired token', async () => {
      const expiredToken = generateToken(userId, 'test@example.com', 'user');
      
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${expiredToken}abc`);

      expect(response.status).toBe(401);
    });
  });

  describe('Admin Only Routes', () => {
    test('should allow admin to access admin routes', async () => {
      await User.deleteMany({});
      
      const adminResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'AdminPass123',
          role: 'admin'
        });

      const adminToken = adminResponse.body.token;

      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    test('should deny regular user access to admin routes', async () => {
      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    test('should deny access to admin routes without token', async () => {
      const response = await request(app)
        .get('/api/admin');

      expect(response.status).toBe(401);
    });
  });
});