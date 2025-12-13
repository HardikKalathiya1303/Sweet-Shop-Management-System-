const { createSweet } = require('../services/sweetService');

const create = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    const sweet = await createSweet(name, category, price, quantity);

    res.status(201).json({ sweet });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { create };