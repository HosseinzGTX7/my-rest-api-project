const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/auth');

// فقط ادمین‌ها دسترسی دارند
router.get('/dashboard', authorize(['admin']), (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

module.exports = router;