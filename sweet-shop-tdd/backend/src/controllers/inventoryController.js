const { purchaseSweet } = require('../services/inventoryService');
const mongoose = require('mongoose');

const purchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid sweet ID' });
    }

    const sweet = await purchaseSweet(id, quantity);

    res.status(200).json({
      message: 'Purchase successful',
      sweet
    });
  } catch (error) {
    if (error.message === 'Sweet not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};

module.exports = { purchase };