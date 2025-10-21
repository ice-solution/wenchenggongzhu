const User = require('../models/User');
const Purchase = require('../models/Purchase');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const jwt = require('jsonwebtoken');

// 生成 JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// 用戶註冊
const register = async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      contactMethod,
      contactInfo
    } = req.body;

    // 驗證必填欄位
    if (!email || !username || !password || !contactInfo) {
      return res.status(400).json({
        success: false,
        message: '請填寫所有必填欄位'
      });
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '請輸入有效的電子郵件地址'
      });
    }

    // 檢查用戶是否已存在
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '此電子郵件已被註冊'
      });
    }

    // 創建新用戶
    const user = new User({
      email: email.toLowerCase(),
      username,
      password,
      contactMethod: contactMethod || 'email',
      contactInfo,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    await user.save();

    // 生成 token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      },
      message: '註冊成功'
    });

  } catch (error) {
    console.error('用戶註冊失敗:', error);
    res.status(500).json({
      success: false,
      message: '註冊失敗',
      error: error.message
    });
  }
};

// 用戶登入
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '請輸入電子郵件和密碼'
      });
    }

    // 查找用戶
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '電子郵件或密碼錯誤'
      });
    }

    // 驗證密碼
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '電子郵件或密碼錯誤'
      });
    }

    // 檢查用戶狀態
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: '帳戶已被停用'
      });
    }

    // 更新登入資訊
    await user.updateLoginInfo(
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent')
    );

    // 生成 token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      },
      message: '登入成功'
    });

  } catch (error) {
    console.error('用戶登入失敗:', error);
    res.status(500).json({
      success: false,
      message: '登入失敗',
      error: error.message
    });
  }
};

// 獲取用戶資料
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    res.json({
      success: true,
      data: user.toJSON()
    });

  } catch (error) {
    console.error('獲取用戶資料失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶資料失敗',
      error: error.message
    });
  }
};

// 獲取用戶的購買記錄
const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, eventId } = req.query;

    const query = { email: req.user.email };
    if (status) query.status = status;
    if (eventId) query.event = eventId;

    const purchases = await Purchase.find(query)
      .populate('ticket event')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: purchases
    });

  } catch (error) {
    console.error('獲取用戶購買記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取購買記錄失敗',
      error: error.message
    });
  }
};

// 獲取用戶的統計數據
const getUserStats = async (req, res) => {
  try {
    const userEmail = req.user.email;
    
    // 獲取所有購買記錄
    const purchases = await Purchase.find({ email: userEmail })
      .populate('ticket event');

    // 計算統計數據
    const totalPurchases = purchases.length;
    const totalAmount = purchases.reduce((sum, p) => sum + (p.totalPrice || p.totalAmount || 0), 0);
    const pendingPurchases = purchases.filter(p => p.status === 'pending').length;
    const confirmedPurchases = purchases.filter(p => p.status === 'confirmed').length;
    const cancelledPurchases = purchases.filter(p => p.status === 'cancelled').length;

    // 按日期分組統計
    const dailyStats = {};
    purchases.forEach(purchase => {
      const date = new Date(purchase.createdAt).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          count: 0,
          amount: 0
        };
      }
      dailyStats[date].count += 1;
      dailyStats[date].amount += (purchase.totalPrice || purchase.totalAmount || 0);
    });

    // 按票券類型分組統計
    const ticketStats = {};
    purchases.forEach(purchase => {
      const ticketName = purchase.ticket ? purchase.ticket.name : 'Unknown';
      if (!ticketStats[ticketName]) {
        ticketStats[ticketName] = {
          name: ticketName,
          count: 0,
          amount: 0,
          status: {}
        };
      }
      ticketStats[ticketName].count += 1;
      ticketStats[ticketName].amount += (purchase.totalPrice || purchase.totalAmount || 0);
      ticketStats[ticketName].status[purchase.status] = (ticketStats[ticketName].status[purchase.status] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalPurchases,
          totalAmount,
          pendingPurchases,
          confirmedPurchases,
          cancelledPurchases
        },
        dailyStats: Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date)),
        ticketStats: Object.values(ticketStats)
      }
    });

  } catch (error) {
    console.error('獲取用戶統計數據失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取統計數據失敗',
      error: error.message
    });
  }
};

// 更新用戶資料
const updateProfile = async (req, res) => {
  try {
    const { username, contactMethod, contactInfo, preferences } = req.body;
    const userId = req.user.userId;

    const updateData = {};
    if (username) updateData.username = username;
    if (contactMethod) updateData.contactMethod = contactMethod;
    if (contactInfo) updateData.contactInfo = contactInfo;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    res.json({
      success: true,
      data: user.toJSON(),
      message: '用戶資料已更新'
    });

  } catch (error) {
    console.error('更新用戶資料失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新用戶資料失敗',
      error: error.message
    });
  }
};

// 管理員：獲取所有用戶
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, role } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (role) query.role = role;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('獲取用戶列表失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取用戶列表失敗',
      error: error.message
    });
  }
};

// 管理員：更新用戶狀態
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '無效的狀態值'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '找不到用戶'
      });
    }

    res.json({
      success: true,
      data: user,
      message: '用戶狀態已更新'
    });

  } catch (error) {
    console.error('更新用戶狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新用戶狀態失敗',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getUserPurchases,
  getUserStats,
  updateProfile,
  getAllUsers,
  updateUserStatus
};







