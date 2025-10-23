const Purchase = require('../models/Purchase');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const stripeService = require('../services/stripeService');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');

// 創建 Stripe 支付連結
const createPaymentLink = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    // 查找購買記錄
    const purchase = await Purchase.findById(purchaseId)
      .populate('ticket event');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: '找不到購買記錄'
      });
    }

    // 檢查是否已經有支付連結
    if (purchase.stripePaymentLinkUrl) {
      return res.json({
        success: true,
        data: {
          paymentLinkUrl: purchase.stripePaymentLinkUrl,
          purchaseId: purchase._id,
          status: purchase.status
        },
        message: '支付連結已存在'
      });
    }

    // 創建 Stripe 支付連結
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

    if (!stripeResult.success) {
      return res.status(500).json({
        success: false,
        message: '創建支付連結失敗',
        error: stripeResult.error
      });
    }

    // 更新購買記錄
    purchase.stripePaymentLinkId = stripeResult.paymentLinkId;
    purchase.stripePaymentLinkUrl = stripeResult.paymentLinkUrl;
    purchase.paymentMethod = 'stripe';
    await purchase.save();

    res.json({
      success: true,
      data: {
        paymentLinkUrl: stripeResult.paymentLinkUrl,
        purchaseId: purchase._id,
        status: purchase.status
      },
      message: '支付連結創建成功'
    });

  } catch (error) {
    console.error('創建支付連結失敗:', error);
    res.status(500).json({
      success: false,
      message: '創建支付連結失敗',
      error: error.message
    });
  }
};

// Stripe Webhook 處理
const handleWebhook = async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers['stripe-signature'];

    console.log('Webhook payload type:', typeof payload);
    console.log('Webhook payload is Buffer:', Buffer.isBuffer(payload));

    // 驗證 webhook 簽名
    const verification = stripeService.verifyWebhookSignature(payload, signature);
    
    if (!verification.success) {
      console.error('Webhook 簽名驗證失敗:', verification.error);
      return res.status(400).send(`Webhook Error: ${verification.error}`);
    }

    const event = verification.event;
    console.log('收到 Stripe webhook 事件:', event.type);

    // 處理不同的事件類型
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event);
        break;
      
      default:
        console.log(`未處理的事件類型: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook 處理失敗:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

// 處理結帳會話完成
const handleCheckoutSessionCompleted = async (event) => {
  try {
    const session = event.data.object;
    const purchaseId = session.metadata?.purchaseId;

    if (!purchaseId) {
      console.error('找不到購買 ID:', session.metadata);
      return;
    }

    // 更新購買記錄
    const purchase = await Purchase.findById(purchaseId)
      .populate('ticket event');

    if (!purchase) {
      console.error('找不到購買記錄:', purchaseId);
      return;
    }

    purchase.status = 'confirmed';
    purchase.stripeSessionId = session.id;
    purchase.paymentMethod = 'stripe';
    await purchase.save();

    // 發送確認郵件 - 已禁用
    // try {
    //   const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    //   const emailData = {
    //     email: purchase.email,
    //     username: purchase.username,
    //     event: purchase.event,
    //     ticket: purchase.ticket,
    //     quantity: purchase.quantity,
    //     totalAmount: purchase.totalPrice,
    //     statusUrl: `${frontendUrl}/status/${purchase.uniqueId}`
    //   };
    //   
    //   await emailService.sendRegistrationConfirmation(emailData);
    //   console.log('✅ 支付確認郵件發送成功');
    // } catch (emailError) {
    //   console.error('❌ 發送確認郵件失敗:', emailError);
    // }

    // 發送 WhatsApp 通知（如果用戶選擇了 WhatsApp） - 已禁用
    // if (purchase.contactMethod === 'whatsapp' && process.env.WHATSAPP_ENABLED === 'true') {
    //   try {
    //     const whatsappData = {
    //       contactInfo: purchase.contactInfo,
    //       username: purchase.username,
    //       event: purchase.event,
    //       ticket: purchase.ticket,
    //       totalPrice: purchase.totalPrice
    //     };
    //     
    //     const whatsappResult = await whatsappService.sendPaymentConfirmation(whatsappData);
    //     
    //     if (whatsappResult.success) {
    //       console.log('✅ WhatsApp 付款確認已發送:', whatsappResult.messageId);
    //     } else {
    //       console.log('❌ WhatsApp 發送失敗:', whatsappResult.error);
    //     }
    //   } catch (whatsappError) {
    //     console.error('❌ WhatsApp 發送錯誤:', whatsappError);
    //   }
    // } else if (purchase.contactMethod === 'whatsapp') {
    //   console.log('⚠️  WhatsApp 功能已禁用，跳過發送');
    // }

    console.log(`購買記錄 ${purchaseId} 支付成功，狀態已更新為 confirmed`);

  } catch (error) {
    console.error('處理結帳會話完成失敗:', error);
  }
};

// 處理支付成功
const handlePaymentIntentSucceeded = async (event) => {
  try {
    const paymentIntent = event.data.object;
    const sessionId = paymentIntent.metadata?.session_id;

    if (sessionId) {
      const purchase = await Purchase.findOne({ stripeSessionId: sessionId });
      
      if (purchase && purchase.status !== 'confirmed') {
        purchase.status = 'confirmed';
        purchase.stripePaymentIntentId = paymentIntent.id;
        await purchase.save();
        
        console.log(`購買記錄 ${purchase._id} 支付成功，狀態已更新為 confirmed`);
      }
    }

  } catch (error) {
    console.error('處理支付成功失敗:', error);
  }
};

// 處理支付失敗
const handlePaymentIntentFailed = async (event) => {
  try {
    const paymentIntent = event.data.object;
    const sessionId = paymentIntent.metadata?.session_id;

    if (sessionId) {
      const purchase = await Purchase.findOne({ stripeSessionId: sessionId });
      
      if (purchase && purchase.status === 'pending') {
        purchase.status = 'cancelled';
        purchase.stripePaymentIntentId = paymentIntent.id;
        await purchase.save();
        
        console.log(`購買記錄 ${purchase._id} 支付失敗，狀態已更新為 cancelled`);
      }
    }

  } catch (error) {
    console.error('處理支付失敗失敗:', error);
  }
};

// 檢查支付狀態
const checkPaymentStatus = async (req, res) => {
  try {
    const { purchaseId } = req.params;

    const purchase = await Purchase.findById(purchaseId);
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: '找不到購買記錄'
      });
    }

    if (!purchase.stripeSessionId) {
      return res.json({
        success: true,
        data: {
          status: purchase.status,
          paymentMethod: purchase.paymentMethod,
          hasStripeLink: !!purchase.stripePaymentLinkUrl
        }
      });
    }

    // 檢查 Stripe 支付狀態
    const stripeResult = await stripeService.checkPaymentStatus(purchase.stripeSessionId);
    
    if (stripeResult.success) {
      const { paymentStatus, status } = stripeResult;
      
      // 根據 Stripe 狀態更新本地狀態
      if (paymentStatus === 'paid' && purchase.status !== 'confirmed') {
        purchase.status = 'confirmed';
        await purchase.save();
      } else if (paymentStatus === 'unpaid' && status === 'expired' && purchase.status === 'pending') {
        purchase.status = 'cancelled';
        await purchase.save();
      }
    }

    res.json({
      success: true,
      data: {
        status: purchase.status,
        paymentMethod: purchase.paymentMethod,
        stripeStatus: stripeResult.success ? stripeResult.paymentStatus : null,
        paymentLinkUrl: purchase.stripePaymentLinkUrl
      }
    });

  } catch (error) {
    console.error('檢查支付狀態失敗:', error);
    res.status(500).json({
      success: false,
      message: '檢查支付狀態失敗',
      error: error.message
    });
  }
};

module.exports = {
  createPaymentLink,
  handleWebhook,
  checkPaymentStatus
};
