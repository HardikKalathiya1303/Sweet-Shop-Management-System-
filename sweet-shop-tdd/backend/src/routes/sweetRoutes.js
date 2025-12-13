const express = require('express');
const { create } = require('../controllers/sweetController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticate, create);

module.exports = router;