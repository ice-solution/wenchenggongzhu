const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // 基本資訊
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // 聯絡資訊
  contactMethod: {
    type: String,
    enum: ['whatsapp', 'email', 'phone'],
    default: 'email'
  },
  contactInfo: {
    type: String,
    required: true,
    trim: true
  },
  
  // 用戶狀態
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  // 角色權限
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // 登入資訊
  lastLogin: {
    type: Date
  },
  loginCount: {
    type: Number,
    default: 0
  },
  
  // 個人設定
  preferences: {
    language: {
      type: String,
      default: 'zh-TW'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      whatsapp: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // 系統資訊
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// 索引
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

// 虛擬欄位
userSchema.virtual('isActive').get(function() {
  return this.status === 'active';
});

userSchema.virtual('isAdmin').get(function() {
  return this.role === 'admin';
});

// 密碼加密中間件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密碼驗證方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 更新登入資訊
userSchema.methods.updateLoginInfo = function(ipAddress, userAgent) {
  this.lastLogin = new Date();
  this.loginCount += 1;
  this.ipAddress = ipAddress;
  this.userAgent = userAgent;
  return this.save();
};

// 靜態方法
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ status: 'active' });
};

// 轉換為 JSON 時移除敏感資訊
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);







