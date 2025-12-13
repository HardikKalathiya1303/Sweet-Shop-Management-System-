const express = require('express');
const { create, getAll, search, update, remove } = require('../controllers/sweetController');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/', authenticate, create);
router.get('/', authenticate, getAll);
router.get('/search', authenticate, search);
router.put('/:id', authenticate, update);
router.delete('/:id', authenticate, isAdmin, remove);

module.exports = router;