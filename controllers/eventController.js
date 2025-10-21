const Event = require('../models/Event');
const Ticket = require('../models/Ticket');

// 取得所有活動
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('tickets')
      .sort({ date: 1 });
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '取得活動列表失敗',
      error: error.message
    });
  }
};

// 取得單一活動詳情
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('tickets');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: '找不到該活動'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '取得活動詳情失敗',
      error: error.message
    });
  }
};

// 建立新活動
const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    
    res.status(201).json({
      success: true,
      data: event,
      message: '活動建立成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '建立活動失敗',
      error: error.message
    });
  }
};

// 更新活動
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: '找不到該活動'
      });
    }
    
    res.json({
      success: true,
      data: event,
      message: '活動更新成功'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: '更新活動失敗',
      error: error.message
    });
  }
};

// 刪除活動
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: '找不到該活動'
      });
    }
    
    // 同時刪除相關的票券
    await Ticket.deleteMany({ event: req.params.id });
    
    res.json({
      success: true,
      message: '活動刪除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '刪除活動失敗',
      error: error.message
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};


