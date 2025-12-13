const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../backend/src/config/database');

describe('Database Connection', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  test('should connect to MongoDB database', async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  test('should execute a simple query', async () => {
    const collections = await mongoose.connection.db.listCollections().toArray();
    expect(Array.isArray(collections)).toBe(true);
  });

  test('should handle connection errors', async () => {
    await disconnectDB();
    process.env.MONGODB_URI = 'mongodb://invalid:27017/invalid';
    await expect(connectDB()).rejects.toThrow();
    process.env.MONGODB_URI = 'mongodb://localhost:27017/sweet_shop';
    await connectDB();
  });
});