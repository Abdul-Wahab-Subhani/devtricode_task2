const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  logoutAdmin,
  registerAdmin,
  getDashboardStats,
  getAdminPosts,
  verifyToken
} = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Public routes
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.post('/register', registerAdmin);

// Protected routes
router.get('/verify', auth, verifyToken);
router.get('/dashboard', auth, getDashboardStats);
router.get('/posts', auth, getAdminPosts);

module.exports = router;
