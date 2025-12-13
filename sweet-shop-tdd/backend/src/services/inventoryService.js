const Sweet = require('../models/Sweet');

const purchaseSweet = async (id, quantity) => {
  if (!quantity || quantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  const sweet = await Sweet.findById(id);

  if (!sweet) {
    throw new Error('Sweet not found');
  }

  if (sweet.quantity === 0) {
    throw new Error('Sweet is out of stock');
  }

  if (sweet.quantity < quantity) {
    throw new Error('Insufficient stock available');
  }

  sweet.quantity -= quantity;
  sweet.updatedAt = Date.now();
  await sweet.save();

  return sweet;
};

module.exports = { purchaseSweet };