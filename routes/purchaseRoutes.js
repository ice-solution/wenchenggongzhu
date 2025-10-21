const express = require('express');
const router = express.Router();
const {
  createPurchase,
  getPurchases,
  getPurchase,
  updatePurchaseStatus,
  markConfirmationSent,
  getPendingPurchases,
  getPurchasesByEmail,
  getPurchaseByUniqueId
} = require('../controllers/purchaseController');

// 創建購買記錄
router.post('/', createPurchase);

// 獲取所有購買記錄
router.get('/', getPurchases);

// 獲取待確認的購買記錄
router.get('/pending', getPendingPurchases);

// 根據 email 獲取購買記錄
router.get('/email/:email', getPurchasesByEmail);

// 獲取單一購買記錄
router.get('/:id', getPurchase);

// 更新購買記錄狀態
router.put('/:id/status', updatePurchaseStatus);

// 標記確認已發送
router.put('/:id/confirmation', markConfirmationSent);

// 根據 uniqueId 取得購買記錄（公開訪問）
router.get('/status/:uniqueId', getPurchaseByUniqueId);

module.exports = router;
