const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../../backend/src/config/database');

describe('Database Connection', () => {
  afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      await disconnectDB();
    }
  });

  test('should connect to MongoDB database', async () => {
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1);
  });

  test('should execute a simple query', async () => {
    await connectDB();
    const collections = await mongoose.connection.db.listCollections().toArray();
    expect(Array.isArray(collections)).toBe(true);
  });

  test('should handle connection errors', async () => {
    process.env.MONGODB_URI = 'mongodb://invalid:27017/invalid';
    await expect(connectDB()).rejects.toThrow();
  });
});