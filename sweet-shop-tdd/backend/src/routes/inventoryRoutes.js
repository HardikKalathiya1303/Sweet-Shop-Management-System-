const express = require('express');
const { purchase } = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:id/purchase', authenticate, purchase);

module.exports = router;