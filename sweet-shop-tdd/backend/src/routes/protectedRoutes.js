const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/protected', authenticate, (req, res) => {
  res.json({
    message: 'Access granted to protected route',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

router.get('/admin', authenticate, isAdmin, (req, res) => {
  res.json({
    message: 'Access granted to admin route',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;