const Sweet = require('../models/Sweet');

const createSweet = async (name, category, price, quantity = 0) => {
  if (!name || !category) {
    throw new Error('Name and category are required');
  }

  if (price === undefined || price === null || price < 0) {
    throw new Error('Valid price is required');
  }

  if (quantity < 0) {
    throw new Error('Quantity cannot be negative');
  }

  const sweet = new Sweet({
    name,
    category,
    price,
    quantity
  });

  await sweet.save();

  return sweet;
};

const getAllSweets = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const sweets = await Sweet.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Sweet.countDocuments();

  return {
    sweets,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total
  };
};

const searchSweets = async (filters) => {
  const query = {};

  if (filters.name) {
    query.name = { $regex: filters.name, $options: 'i' };
  }

  if (filters.category) {
    query.category = { $regex: filters.category, $options: 'i' };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) {
      query.price.$gte = parseFloat(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query.price.$lte = parseFloat(filters.maxPrice);
    }
  }

  const sweets = await Sweet.find(query).sort({ createdAt: -1 });

  return sweets;
};

module.exports = { createSweet, getAllSweets, searchSweets };