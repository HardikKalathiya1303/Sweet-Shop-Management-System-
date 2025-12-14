const express = require('express');
const { purchase, restock } = require('../controllers/inventoryController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/:id/purchase', authenticate, purchase);
router.post('/:id/restock', authenticate, isAdmin, restock);

module.exports = router;