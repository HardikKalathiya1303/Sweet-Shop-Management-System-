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

module.exports = { createSweet };