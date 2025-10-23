const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  allowCustomPrice: {
    type: Boolean,
    default: false
  },
  minPrice: {
    type: Number,
    default: 0
  },
  maxPrice: {
    type: Number
  },
  currency: {
    type: String,
    default: 'HKD'
  },
  type: {
    type: String,
    enum: ['standard', 'vip', 'member', 'early_bird'],
    default: 'standard'
  },
  restrictions: [{
    type: String
  }],
  available: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true
  },
  saleStartDate: {
    type: Date,
    required: true
  },
  saleEndDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticket', ticketSchema);


