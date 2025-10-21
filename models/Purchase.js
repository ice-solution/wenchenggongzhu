const mongoose = require('mongoose');
const crypto = require('crypto');

const purchaseSchema = new mongoose.Schema({
  // 唯一標識符
  uniqueId: {
    type: String,
    unique: true,
    required: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  
  // 用戶資訊
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  contactMethod: {
    type: String,
    required: true,
    enum: ['whatsapp', 'email', 'phone'],
    default: 'whatsapp'
  },
  contactInfo: {
    type: String,
    required: true,
    trim: true
  },
  
  // 購買資訊
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  
  // 購買詳情
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'HKD'
  },
  
  // 狀態管理
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  
  // 確認資訊
  confirmationSent: {
    type: Boolean,
    default: false
  },
  confirmationMethod: {
    type: String,
    enum: ['whatsapp', 'email', 'both'],
    default: 'email'
  },
  confirmationSentAt: {
    type: Date
  },
  
  // 備註
  notes: {
    type: String,
    trim: true
  },
  
  // Stripe 支付資訊
  stripePaymentLinkId: {
    type: String
  },
  stripePaymentLinkUrl: {
    type: String
  },
  stripeSessionId: {
    type: String
  },
  stripePaymentIntentId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'manual', 'other'],
    default: 'manual'
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
purchaseSchema.index({ email: 1 });
purchaseSchema.index({ ticket: 1 });
purchaseSchema.index({ event: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ createdAt: -1 });

// 虛擬欄位
purchaseSchema.virtual('formattedAmount').get(function() {
  return `${this.currency} ${this.totalPrice}`;
});

purchaseSchema.virtual('isConfirmed').get(function() {
  return this.status === 'confirmed';
});

purchaseSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

// 方法
purchaseSchema.methods.markAsConfirmed = function() {
  this.status = 'confirmed';
  return this.save();
};

purchaseSchema.methods.markConfirmationSent = function(method = 'email') {
  this.confirmationSent = true;
  this.confirmationMethod = method;
  this.confirmationSentAt = new Date();
  return this.save();
};

// 靜態方法
purchaseSchema.statics.findByEmail = function(email) {
  return this.find({ email: email.toLowerCase() }).populate('ticket event');
};

purchaseSchema.statics.findByEvent = function(eventId) {
  return this.find({ event: eventId }).populate('ticket');
};

purchaseSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).populate('ticket event');
};

module.exports = mongoose.model('Purchase', purchaseSchema);
