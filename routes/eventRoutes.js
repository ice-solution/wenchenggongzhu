const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

// 取得所有活動
router.get('/', getAllEvents);

// 取得單一活動詳情
router.get('/:id', getEventById);

// 建立新活動
router.post('/', createEvent);

// 更新活動
router.put('/:id', updateEvent);

// 刪除活動
router.delete('/:id', deleteEvent);

module.exports = router;


