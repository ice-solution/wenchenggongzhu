const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  getUserPurchases,
  getUserStats,
  updateProfile,
  getAllUsers,
  updateUserStatus
} = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// 公開路由
router.post('/register', register);
router.post('/login', login);

// 需要認證的路由
router.use(authenticateToken);

// 用戶相關路由
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/purchases', getUserPurchases);
router.get('/stats', getUserStats);

// 管理員路由
router.get('/admin/users', requireAdmin, getAllUsers);
router.put('/admin/users/:userId/status', requireAdmin, updateUserStatus);

module.exports = router;







