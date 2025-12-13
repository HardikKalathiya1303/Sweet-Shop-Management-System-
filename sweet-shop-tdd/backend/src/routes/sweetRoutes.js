const express = require('express');
const { create, getAll, search } = require('../controllers/sweetController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, create);
router.get('/', authenticate, getAll);
router.get('/search', authenticate, search);

module.exports = router;