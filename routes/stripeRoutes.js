const express = require('express');
const router = express.Router();
const {
  createPaymentLink,
  handleWebhook,
  checkPaymentStatus
} = require('../controllers/stripeController');

// 創建支付連結
router.post('/payment-link/:purchaseId', createPaymentLink);

// Stripe Webhook (需要原始 body 來驗證簽名)
router.post('/webhook', express.raw({type: 'application/json'}), handleWebhook);

// 檢查支付狀態
router.get('/payment-status/:purchaseId', checkPaymentStatus);

module.exports = router;
