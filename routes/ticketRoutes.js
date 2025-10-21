const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  getTicketsByEvent,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
} = require('../controllers/ticketController');

// 取得所有票券
router.get('/', getAllTickets);

// 取得特定活動的票券
router.get('/event/:eventId', getTicketsByEvent);

// 取得單一票券詳情
router.get('/:id', getTicketById);

// 建立新票券
router.post('/', createTicket);

// 更新票券
router.put('/:id', updateTicket);

// 刪除票券
router.delete('/:id', deleteTicket);

module.exports = router;


