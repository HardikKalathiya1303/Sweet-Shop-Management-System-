const { createSweet, getAllSweets, searchSweets } = require('../services/sweetService');

const create = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    const sweet = await createSweet(name, category, price, quantity);

    res.status(201).json({ sweet });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getAllSweets(page, limit);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const search = async (req, res) => {
  try {
    const filters = {
      name: req.query.name,
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice
    };

    const sweets = await searchSweets(filters);

    res.status(200).json({ sweets });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { create, getAll, search };