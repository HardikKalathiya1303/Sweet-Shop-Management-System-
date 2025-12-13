const { createSweet, getAllSweets, searchSweets, updateSweet, deleteSweet } = require('../services/sweetService');
const mongoose = require('mongoose');

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

const update = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid sweet ID' });
    }

    const sweet = await updateSweet(id, req.body);

    res.status(200).json({ sweet });
  } catch (error) {
    if (error.message === 'Sweet not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid sweet ID' });
    }

    await deleteSweet(id);

    res.status(200).json({ message: 'Sweet deleted successfully' });
  } catch (error) {
    if (error.message === 'Sweet not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

module.exports = { create, getAll, search, update, remove };