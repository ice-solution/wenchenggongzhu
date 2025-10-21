const express = require('express');
const router = express.Router();
const {
  createPaymentLink,
  handleWebhook,
  checkPaymentStatus
} = require('../controllers/stripeController');

// 創建支付連結
router.post('/payment-link/:purchaseId', createPaymentLink);

// Stripe Webhook (原始 body 已在 server.js 中處理)
router.post('/webhook', handleWebhook);

// 檢查支付狀態
router.get('/payment-status/:purchaseId', checkPaymentStatus);

module.exports = router;
