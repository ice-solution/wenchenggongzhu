const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 驗證 JWT Token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '需要登入才能訪問此資源'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '無效的 token'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: '帳戶已被停用'
      });
    }

    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      ...user.toJSON()
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '無效的 token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token 已過期'
      });
    }

    console.error('認證錯誤:', error);
    res.status(500).json({
      success: false,
      message: '認證失敗',
      error: error.message
    });
  }
};

// 檢查管理員權限
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理員權限'
    });
  }
  next();
};

// 可選認證（用於某些不需要強制登入的 API）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId).select('-password');

      if (user && user.status === 'active') {
        req.user = {
          userId: user._id,
          email: user.email,
          role: user.role,
          ...user.toJSON()
        };
      }
    }

    next();
  } catch (error) {
    // 可選認證失敗時不返回錯誤，繼續執行
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth
};







