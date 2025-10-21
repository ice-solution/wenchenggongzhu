const Purchase = require('../models/Purchase');
const Ticket = require('../models/Ticket');
const emailService = require('../services/emailService');
const stripeService = require('../services/stripeService');
const Event = require('../models/Event');

// 創建購買記錄
const createPurchase = async (req, res) => {
  try {
    const {
      email,
      username,
      contactMethod,
      contactInfo,
      ticketId,
      quantity = 1,
      notes
    } = req.body;

    // 驗證必填欄位
    if (!email || !username || !contactMethod || !contactInfo || !ticketId) {
      return res.status(400).json({
        success: false,
        message: '請填寫所有必填欄位'
      });
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: '請輸入有效的電子郵件地址'
      });
    }

    // 驗證聯絡方式格式
    if (contactMethod === 'whatsapp' && !contactInfo.startsWith('+')) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp 號碼請以 + 開頭，例如：+85212345678'
      });
    }

    if (contactMethod === 'phone' && !contactInfo.startsWith('+')) {
      return res.status(400).json({
        success: false,
        message: '電話號碼請以 + 開頭，例如：+85212345678'
      });
    }

    // 查找票券
    let ticket;
    try {
      ticket = await Ticket.findById(ticketId).populate('event');
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: '票券 ID 格式不正確，請重新選擇票券'
      });
    }
    
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的票券，請重新選擇票券'
      });
    }

    // 檢查票券是否可用
    if (!ticket.isActive) {
      return res.status(400).json({
        success: false,
        message: '此票券目前不可購買'
      });
    }

    if (ticket.available < quantity) {
      return res.status(400).json({
        success: false,
        message: `票券數量不足，目前僅剩 ${ticket.available} 張`
      });
    }

    // 計算總金額
    const totalPrice = ticket.price * quantity;

    // 創建購買記錄
    const purchase = new Purchase({
      email: email.toLowerCase(),
      username,
      contactMethod,
      contactInfo,
      ticket: ticketId,
      event: ticket.event._id,
      quantity,
      totalPrice,
      currency: ticket.currency || 'HKD',
      notes,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    await purchase.save();

    // 減少票券可用數量
    ticket.available -= quantity;
    await ticket.save();

    // 填充相關資料
    await purchase.populate('ticket event');

    // 生成專屬 URL（指向前端）
    const statusUrl = `http://localhost:5174/status/${purchase.uniqueId}`;

    // 創建 Stripe 支付連結
    let stripePaymentLink = null;
    
    // 檢查 Stripe 金鑰是否已設定
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key') {
      try {
        const paymentLinkData = {
          purchaseId: purchase._id,
          uniqueId: purchase.uniqueId,
          totalPrice: purchase.totalPrice,
          currency: purchase.currency || 'hkd',
          ticketName: purchase.ticket ? purchase.ticket.name : 'Unknown Ticket',
          eventTitle: purchase.event ? purchase.event.title : 'Unknown Event',
          username: purchase.username,
          email: purchase.email
        };

        const stripeResult = await stripeService.createPaymentLink(paymentLinkData);
        
        if (stripeResult.success) {
          purchase.stripePaymentLinkId = stripeResult.paymentLinkId;
          purchase.stripePaymentLinkUrl = stripeResult.paymentLinkUrl;
          purchase.paymentMethod = 'stripe';
          await purchase.save();
          
          stripePaymentLink = stripeResult.paymentLinkUrl;
          console.log('Stripe payment link created successfully');
        } else {
          console.error('Failed to create Stripe payment link:', stripeResult.error);
          console.log('Falling back to manual payment method');
        }
      } catch (stripeError) {
        console.error('Stripe service error:', stripeError);
        console.log('Falling back to manual payment method');
        // 不影響主要流程，繼續返回成功響應
      }
    } else {
      console.log('Stripe not configured - using manual payment method');
      purchase.paymentMethod = 'manual';
      await purchase.save();
    }

    // 發送確認郵件
    try {
      const emailData = {
        email: purchase.email,
        username: purchase.username,
        event: purchase.event,
        ticket: purchase.ticket,
        quantity: purchase.quantity,
        totalAmount: purchase.totalPrice,
        statusUrl,
        paymentLinkUrl: stripePaymentLink
      };
      
      const emailResult = await emailService.sendRegistrationConfirmation(emailData);
      if (emailResult.success) {
        console.log('Registration confirmation email sent successfully');
      } else {
        console.error('Failed to send registration confirmation email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      // 不影響主要流程，繼續返回成功響應
    }

    res.status(201).json({
      success: true,
      data: {
        ...purchase.toObject(),
        statusUrl,
        stripePaymentLinkUrl: stripePaymentLink
      },
      message: '預購申請已提交，支付連結已生成'
    });

  } catch (error) {
    console.error('創建購買記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '提交預購申請失敗',
      error: error.message
    });
  }
};

// 獲取所有購買記錄
const getPurchases = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      eventId,
      email
    } = req.query;

    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (eventId) {
      query.event = eventId;
    }
    
    if (email) {
      query.email = email.toLowerCase();
    }

    const purchases = await Purchase.find(query)
      .populate('ticket event')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Purchase.countDocuments(query);

    res.json({
      success: true,
      data: purchases,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('獲取購買記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取購買記錄失敗',
      error: error.message
    });
  }
};

// 獲取單一購買記錄
const getPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('ticket event');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: '找不到購買記錄'
      });
    }

    res.json({
      success: true,
      data: purchase
    });

  } catch (error) {
    console.error('獲取購買記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取購買記錄失敗',
      error: error.message
    });
  }
};

// 更新購買記錄狀態
const updatePurchaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '無效的狀態值'
      });
    }

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: '找不到購買記錄'
      });
    }

    purchase.status = status;
    await purchase.save();

    await purchase.populate('ticket event');

    // 發送狀態更新通知郵件
    try {
      const emailData = {
        email: purchase.email,
        username: purchase.username,
        event: purchase.event,
        ticket: purchase.ticket,
        statusUrl: `http://localhost:5174/status/${purchase.uniqueId}`
      };
      
      const emailResult = await emailService.sendStatusUpdateNotification(emailData, status);
      if (emailResult.success) {
        console.log('Status update notification email sent successfully');
      } else {
        console.error('Failed to send status update notification email:', emailResult.error);
      }
    } catch (emailError) {
      console.error('Email service error:', emailError);
      // 不影響主要流程，繼續返回成功響應
    }

    res.json({
      success: true,
      data: purchase,
      message: '購買記錄狀態已更新'
    });

  } catch (error) {
    console.error('更新購買記錄狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新購買記錄狀態失敗',
      error: error.message
    });
  }
};

// 標記確認已發送
const markConfirmationSent = async (req, res) => {
  try {
    const { method = 'email' } = req.body;
    const { id } = req.params;

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: '找不到購買記錄'
      });
    }

    await purchase.markConfirmationSent(method);

    res.json({
      success: true,
      data: purchase,
      message: '確認發送狀態已更新'
    });

  } catch (error) {
    console.error('更新確認發送狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新確認發送狀態失敗',
      error: error.message
    });
  }
};

// 獲取待確認的購買記錄
const getPendingPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ status: 'pending' })
      .populate('ticket event')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: purchases
    });

  } catch (error) {
    console.error('獲取待確認購買記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取待確認購買記錄失敗',
      error: error.message
    });
  }
};

// 根據 email 獲取購買記錄
const getPurchasesByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    const purchases = await Purchase.findByEmail(email)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: purchases
    });

  } catch (error) {
    console.error('根據 email 獲取購買記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取購買記錄失敗',
      error: error.message
    });
  }
};

// 根據 uniqueId 取得購買記錄（公開訪問）
const getPurchaseByUniqueId = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const purchase = await Purchase.findOne({ uniqueId })
      .populate('ticket event');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: '找不到購買記錄'
      });
    }

    res.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    console.error('根據 uniqueId 取得購買記錄失敗:', error);
    res.status(500).json({
      success: false,
      message: '取得購買記錄失敗',
      error: error.message
    });
  }
};

module.exports = {
  createPurchase,
  getPurchases,
  getPurchase,
  updatePurchaseStatus,
  markConfirmationSent,
  getPendingPurchases,
  getPurchasesByEmail,
  getPurchaseByUniqueId
};
