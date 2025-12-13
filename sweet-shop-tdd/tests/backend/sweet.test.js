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

  describe('GET /api/sweets', () => {
    beforeEach(async () => {
      const sweets = [
        { name: 'Chocolate Bar', category: 'Chocolate', price: 2.99, quantity: 100 },
        { name: 'Gummy Bears', category: 'Gummy', price: 1.99, quantity: 50 },
        { name: 'Lollipop', category: 'Hard Candy', price: 0.99, quantity: 200 },
        { name: 'Caramel', category: 'Soft Candy', price: 1.49, quantity: 75 },
        { name: 'Mint Chocolate', category: 'Chocolate', price: 3.49, quantity: 30 }
      ];

      for (const sweet of sweets) {
        await request(app)
          .post('/api/sweets')
          .set('Authorization', `Bearer ${token}`)
          .send(sweet);
      }
    });

    test('should get all sweets with authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sweets');
      expect(Array.isArray(response.body.sweets)).toBe(true);
      expect(response.body.sweets.length).toBe(5);
    });

    test('should fail to get sweets without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets');

      expect(response.status).toBe(401);
    });

    test('should get sweets with pagination', async () => {
      const response = await request(app)
        .get('/api/sweets?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.length).toBe(2);
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('currentPage');
      expect(response.body.totalPages).toBe(3);
    });

    test('should get second page of sweets', async () => {
      const response = await request(app)
        .get('/api/sweets?page=2&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.length).toBe(2);
      expect(response.body.currentPage).toBe(2);
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      const sweets = [
        { name: 'Dark Chocolate Bar', category: 'Chocolate', price: 3.99, quantity: 100 },
        { name: 'Milk Chocolate Bar', category: 'Chocolate', price: 2.99, quantity: 150 },
        { name: 'Gummy Bears', category: 'Gummy', price: 1.99, quantity: 50 },
        { name: 'Sour Gummy Worms', category: 'Gummy', price: 2.49, quantity: 80 },
        { name: 'Lollipop', category: 'Hard Candy', price: 0.99, quantity: 200 }
      ];

      for (const sweet of sweets) {
        await request(app)
          .post('/api/sweets')
          .set('Authorization', `Bearer ${token}`)
          .send(sweet);
      }
    });

    test('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=chocolate')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.length).toBe(2);
      expect(response.body.sweets[0].name).toContain('Chocolate');
    });

    test('should search sweets by category', async () => {
      const response = await request(app)
        .get('/api/sweets/search?category=Gummy')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.length).toBe(2);
    });

    test('should search sweets by price range', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=2&maxPrice=3')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.length).toBe(2);
    });

    test('should search sweets by minimum price only', async () => {
      const response = await request(app)
        .get('/api/sweets/search?minPrice=3')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.length).toBe(2);
    });

    test('should search sweets by maximum price only', async () => {
      const response = await request(app)
        .get('/api/sweets/search?maxPrice=2')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.length).toBe(2);
    });

    test('should return empty array when no sweets match search', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.sweets.length).toBe(0);
    });

    test('should fail to search without authentication', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=chocolate');

      expect(response.status).toBe(401);
    });
  });
    describe('PUT /api/sweets/:id', () => {
    let sweetId;

    beforeEach(async () => {
      const sweetData = {
        name: 'Original Sweet',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${token}`)
        .send(sweetData);

      sweetId = response.body.sweet._id;
    });

    test('should update sweet with valid data', async () => {
      const updateData = {
        name: 'Updated Sweet',
        category: 'Gummy',
        price: 3.99,
        quantity: 150
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.sweet.name).toBe(updateData.name);
      expect(response.body.sweet.category).toBe(updateData.category);
      expect(response.body.sweet.price).toBe(updateData.price);
      expect(response.body.sweet.quantity).toBe(updateData.quantity);
    });

    test('should partially update sweet', async () => {
      const updateData = {
        price: 4.99
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.sweet.price).toBe(updateData.price);
      expect(response.body.sweet.name).toBe('Original Sweet');
    });

    test('should fail to update sweet without authentication', async () => {
      const updateData = {
        name: 'Updated Sweet'
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .send(updateData);

      expect(response.status).toBe(401);
    });

    test('should fail to update sweet with invalid id', async () => {
      const updateData = {
        name: 'Updated Sweet'
      };

      const response = await request(app)
        .put('/api/sweets/invalidid123')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(400);
    });

    test('should fail to update sweet with negative price', async () => {
      const updateData = {
        price: -5.99
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(400);
    });

    test('should fail to update sweet with negative quantity', async () => {
      const updateData = {
        quantity: -10
      };

      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(400);
    });

    test('should fail to update non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const updateData = {
        name: 'Updated Sweet'
      };

      const response = await request(app)
        .put(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    let sweetId;

    beforeEach(async () => {
      const sweetData = {
        name: 'Sweet to Delete',
        category: 'Chocolate',
        price: 2.99,
        quantity: 100
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${token}`)
        .send(sweetData);

      sweetId = response.body.sweet._id;
    });

    test('should delete sweet as admin', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      const checkSweet = await Sweet.findById(sweetId);
      expect(checkSweet).toBeNull();
    });

    test('should fail to delete sweet as regular user', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    test('should fail to delete sweet without authentication', async () => {
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`);

      expect(response.status).toBe(401);
    });

    test('should fail to delete sweet with invalid id', async () => {
      const response = await request(app)
        .delete('/api/sweets/invalidid123')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
    });

    test('should fail to delete non-existent sweet', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/sweets/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});