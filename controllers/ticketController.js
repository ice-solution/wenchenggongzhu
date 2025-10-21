const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

// 取得所有票券
const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('event');
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '取得票券列表失敗',
      error: error.message
    });
  }
};

// 取得特定活動的票券
const getTicketsByEvent = async (req, res) => {
  try {
    const tickets = await Ticket.find({ event: req.params.eventId })
      .populate('event');
    
    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '取得活動票券失敗',
      error: error.message
    });
  }
};

// 取得單一票券詳情
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event');
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: '找不到該票券'
      });
    }
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '取得票券詳情失敗',
      error: error.message
    });
  }
};

// 建立新票券
const createTicket = async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    
    // 將票券 ID 加入到活動的票券陣列中
    await Event.findByIdAndUpdate(
      req.body.event,
      { $push: { tickets: ticket._id } }
    );
    
    res.status(201).json({
      success: true,
      data: ticket,
      message: '票券建立成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '建立票券失敗',
      error: error.message
    });
  }
};

// 更新票券
const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: '找不到該票券'
      });
    }
    
    res.json({
      success: true,
      data: ticket,
      message: '票券更新成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '更新票券失敗',
      error: error.message
    });
  }
};

// 刪除票券
const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: '找不到該票券'
      });
    }
    
    // 從活動的票券陣列中移除該票券 ID
    await Event.findByIdAndUpdate(
      ticket.event,
      { $pull: { tickets: ticket._id } }
    );
    
    res.json({
      success: true,
      message: '票券刪除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '刪除票券失敗',
      error: error.message
    });
  }
};

module.exports = {
  getAllTickets,
  getTicketsByEvent,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
};


