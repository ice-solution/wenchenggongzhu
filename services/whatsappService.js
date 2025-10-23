const twilio = require('twilio');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.initializeClient();
  }

  // 初始化 Twilio 客戶端
  initializeClient() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log('✅ WhatsApp 服務已初始化');
    } else {
      console.warn('⚠️  WhatsApp 服務未配置：缺少 TWILIO_ACCOUNT_SID 或 TWILIO_AUTH_TOKEN');
      console.warn('📱 請參考 WHATSAPP_PAYMENT_NOTIFICATION_PLAN.md 設定 WhatsApp 服務');
    }
  }

  // 發送付款確認訊息
  async sendPaymentConfirmation(purchaseData) {
    if (!this.client) {
      console.warn('⚠️  WhatsApp 服務未配置，跳過發送');
      return { success: false, error: 'WhatsApp 服務未配置' };
    }

    if (process.env.WHATSAPP_ENABLED !== 'true') {
      console.warn('⚠️  WhatsApp 功能已禁用');
      return { success: false, error: 'WhatsApp 功能已禁用' };
    }

    try {
      const { contactInfo, username, event, ticket, totalPrice } = purchaseData;
      
      // 驗證 WhatsApp 號碼格式
      if (!contactInfo.startsWith('+')) {
        return { success: false, error: 'WhatsApp 號碼格式錯誤，應以 + 開頭' };
      }

      const message = this.generatePaymentConfirmationMessage({
        username,
        event,
        ticket,
        totalPrice
      });

      const result = await this.client.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
        to: `whatsapp:${contactInfo}`,
        body: message
      });

      console.log('✅ WhatsApp 付款確認已發送:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('❌ WhatsApp 發送失敗:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 發送狀態更新通知
  async sendStatusUpdate(purchaseData, newStatus) {
    if (!this.client || process.env.WHATSAPP_ENABLED !== 'true') {
      return { success: false, error: 'WhatsApp 服務未配置或已禁用' };
    }

    try {
      const { contactInfo, username, event, ticket } = purchaseData;
      const message = this.generateStatusUpdateMessage({
        username,
        event,
        ticket,
        newStatus
      });

      const result = await this.client.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
        to: `whatsapp:${contactInfo}`,
        body: message
      });

      console.log('✅ WhatsApp 狀態更新已發送:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('❌ WhatsApp 狀態更新發送失敗:', error.message);
      return { success: false, error: error.message };
    }
  }

  // 生成付款確認訊息
  generatePaymentConfirmationMessage(data) {
    const { username, event, ticket, totalPrice } = data;
    
    return `🎉 *付款確認通知*

親愛的 ${username}，

您的付款已成功處理！

📅 *活動資訊*
• 活動：${event.title}
• 日期：${new Date(event.date).toLocaleDateString('zh-TW')}
• 時間：${event.time}
• 地點：${event.venue}

🎫 *票券資訊*
• 票券：${ticket.name}
• 金額：HK$${totalPrice}

✅ 您的登記已確認，感謝您的支持！

如有任何疑問，請聯繫我們。

*文成公主國際基金會*`;
  }

  // 生成狀態更新訊息
  generateStatusUpdateMessage(data) {
    const { username, event, ticket, newStatus } = data;
    const statusText = this.getStatusText(newStatus);
    
    return `📋 *登記狀態更新*

親愛的 ${username}，

您的登記狀態已更新：

📅 *活動*：${event.title}
🎫 *票券*：${ticket.name}
📊 *狀態*：${statusText}

${this.getStatusSpecificMessage(newStatus)}

如有任何疑問，請聯繫我們。

*文成公主國際基金會*`;
  }

  // 獲取狀態文字
  getStatusText(status) {
    const statusMap = {
      'pending': '待付款',
      'confirmed': '已付款',
      'cancelled': '已取消',
      'completed': '已完成'
    };
    return statusMap[status] || status;
  }

  // 獲取狀態特定訊息
  getStatusSpecificMessage(status) {
    const messages = {
      'pending': '💳 請盡快完成付款以確認您的登記。',
      'confirmed': '✅ 感謝您的付款！您的登記已確認。',
      'cancelled': '❌ 您的登記已被取消。如有疑問，請聯繫我們。',
      'completed': '🎉 恭喜！您的登記已完成。期待在活動中與您相見！'
    };
    return messages[status] || '';
  }

  // 測試 WhatsApp 服務
  async testService(testNumber) {
    if (!this.client) {
      return { success: false, error: 'WhatsApp 服務未配置' };
    }

    try {
      const testMessage = `🧪 *WhatsApp 服務測試*

這是一條測試訊息，用於驗證 WhatsApp 服務是否正常運作。

發送時間：${new Date().toLocaleString('zh-TW')}

*文成公主國際基金會*`;

      const result = await this.client.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
        to: `whatsapp:${testNumber}`,
        body: testMessage
      });

      return { success: true, messageId: result.sid };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new WhatsAppService();
