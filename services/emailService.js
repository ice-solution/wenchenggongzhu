const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // 初始化郵件傳輸器
  initializeTransporter() {
    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    
    // 檢查必要的環境變數
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️  郵件服務未配置：缺少 EMAIL_USER 或 EMAIL_PASS 環境變數');
      console.warn('📧 請參考 SMTP_SETUP_GUIDE.md 設定郵件服務');
      this.transporter = null;
      return;
    }
    
    switch (emailService.toLowerCase()) {
      case 'sendgrid':
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.EMAIL_PASS
          }
        });
        break;
        
      case 'mailgun':
        this.transporter = nodemailer.createTransport({
          host: 'smtp.mailgun.org',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        break;
        
      case 'ses':
        this.transporter = nodemailer.createTransport({
          host: 'email-smtp.us-east-1.amazonaws.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        break;
        
      case 'gmail':
      default:
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        break;
    }

    // 測試連接
    if (this.transporter) {
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('❌ 郵件服務初始化失敗:', error.message);
          console.error('📧 請檢查 SMTP_SETUP_GUIDE.md 中的設定');
        } else {
          console.log('✅ 郵件服務已就緒，可以發送訊息');
        }
      });
    }
  }

  // 發送登記確認郵件
  async sendRegistrationConfirmation(purchaseData) {
    if (!this.transporter) {
      console.warn('⚠️  郵件服務未配置，跳過發送確認郵件');
      return { success: false, error: '郵件服務未配置' };
    }
    
    try {
      const { email, username, event, ticket, quantity, totalAmount, statusUrl } = purchaseData;

      const mailOptions = {
        from: `"文成公主國際基金會" <${process.env.EMAIL_USER || 'noreply@example.com'}>`,
        to: email,
        subject: '🎫 預購登記確認 - 文成公主國際基金會',
        html: this.generateRegistrationEmailHTML({
          username,
          event,
          ticket,
          quantity,
          totalAmount,
          statusUrl
        })
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Registration confirmation email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send registration confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  // 發送狀態更新通知郵件
  async sendStatusUpdateNotification(purchaseData, newStatus) {
    try {
      const { email, username, event, ticket, statusUrl } = purchaseData;

      const mailOptions = {
        from: `"文成公主國際基金會" <${process.env.EMAIL_USER || 'noreply@example.com'}>`,
        to: email,
        subject: `📋 登記狀態更新 - 文成公主國際基金會`,
        html: this.generateStatusUpdateEmailHTML({
          username,
          event,
          ticket,
          newStatus,
          statusUrl
        })
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Status update notification email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send status update notification email:', error);
      return { success: false, error: error.message };
    }
  }

  // 生成登記確認郵件 HTML
  generateRegistrationEmailHTML(data) {
    const { username, event, ticket, quantity, totalAmount, statusUrl, paymentLinkUrl } = data;
    
    return `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>預購登記確認</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #ef4444;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #ef4444;
            margin-bottom: 10px;
          }
          .title {
            font-size: 20px;
            color: #333;
            margin: 0;
          }
          .content {
            margin-bottom: 30px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .info-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-section h3 {
            color: #ef4444;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            color: #666;
          }
          .info-value {
            color: #333;
          }
          .status-url {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          .status-url a {
            color: #2196f3;
            text-decoration: none;
            font-weight: bold;
            word-break: break-all;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #666;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: #ef4444;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">文成公主國際基金會</div>
            <h1 class="title">🎫 預購登記確認</h1>
          </div>
          
          <div class="content">
            <div class="greeting">
              親愛的 ${username}，<br><br>
              感謝您的預購登記！我們已收到您的申請，以下是您的登記詳情：
            </div>
            
            <div class="info-section">
              <h3>📅 活動資訊</h3>
              <div class="info-item">
                <span class="info-label">活動名稱：</span>
                <span class="info-value">${event.title}</span>
              </div>
              <div class="info-item">
                <span class="info-label">活動日期：</span>
                <span class="info-value">${new Date(event.date).toLocaleDateString('zh-TW')}</span>
              </div>
              <div class="info-item">
                <span class="info-label">活動時間：</span>
                <span class="info-value">${event.time}</span>
              </div>
              <div class="info-item">
                <span class="info-label">活動地點：</span>
                <span class="info-value">${event.venue}</span>
              </div>
            </div>
            
            <div class="info-section">
              <h3>🎫 票券資訊</h3>
              <div class="info-item">
                <span class="info-label">票券類型：</span>
                <span class="info-value">${ticket.name}</span>
              </div>
              <div class="info-item">
                <span class="info-label">票券價格：</span>
                <span class="info-value">HK$${ticket.price}/每場</span>
              </div>
              <div class="info-item">
                <span class="info-label">購買數量：</span>
                <span class="info-value">${quantity}</span>
              </div>
              <div class="info-item">
                <span class="info-label">總金額：</span>
                <span class="info-value">HK$${totalAmount}</span>
              </div>
            </div>
            
            <div class="status-url">
              <h3>📋 專屬查詢連結</h3>
              <p>您可以使用以下連結隨時查詢登記狀態：</p>
              <a href="${statusUrl}">${statusUrl}</a>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              ${paymentLinkUrl ? `
                <a href="${paymentLinkUrl}" class="button" style="background: #10b981; margin-right: 10px;">立即支付</a>
              ` : ''}
              <a href="${statusUrl}" class="button">查看登記狀態</a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <strong>📞 重要提醒：</strong><br>
              我們將在 1-2 個工作天內與您聯繫確認付款方式。請保持您的聯絡方式暢通。
            </div>
          </div>
          
          <div class="footer">
            <p>如有任何疑問，請聯繫我們的客服團隊。</p>
            <p>© 2024 文成公主國際基金會. 版權所有.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // 生成狀態更新郵件 HTML
  generateStatusUpdateEmailHTML(data) {
    const { username, event, ticket, newStatus, statusUrl } = data;
    const statusText = this.getStatusText(newStatus);
    const statusColor = this.getStatusColor(newStatus);
    
    return `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>登記狀態更新</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #ef4444;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #ef4444;
            margin-bottom: 10px;
          }
          .title {
            font-size: 20px;
            color: #333;
            margin: 0;
          }
          .status-badge {
            display: inline-block;
            background: ${statusColor};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 20px 0;
          }
          .content {
            margin-bottom: 30px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .info-section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .info-section h3 {
            color: #ef4444;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .info-item:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            color: #666;
          }
          .info-value {
            color: #333;
          }
          .status-url {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
          }
          .status-url a {
            color: #2196f3;
            text-decoration: none;
            font-weight: bold;
            word-break: break-all;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #666;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: #ef4444;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">文成公主國際基金會</div>
            <h1 class="title">📋 登記狀態更新</h1>
          </div>
          
          <div class="content">
            <div class="greeting">
              親愛的 ${username}，<br><br>
              您的登記狀態已更新，詳情如下：
            </div>
            
            <div style="text-align: center;">
              <div class="status-badge">${statusText}</div>
            </div>
            
            <div class="info-section">
              <h3>📅 活動資訊</h3>
              <div class="info-item">
                <span class="info-label">活動名稱：</span>
                <span class="info-value">${event.title}</span>
              </div>
              <div class="info-item">
                <span class="info-label">票券類型：</span>
                <span class="info-value">${ticket.name}</span>
              </div>
            </div>
            
            <div class="status-url">
              <h3>📋 專屬查詢連結</h3>
              <p>您可以使用以下連結查看完整登記詳情：</p>
              <a href="${statusUrl}">${statusUrl}</a>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${statusUrl}" class="button">查看登記詳情</a>
            </div>
            
            ${this.getStatusSpecificMessage(newStatus)}
          </div>
          
          <div class="footer">
            <p>如有任何疑問，請聯繫我們的客服團隊。</p>
            <p>© 2024 文成公主國際基金會. 版權所有.</p>
          </div>
        </div>
      </body>
      </html>
    `;
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

  // 獲取狀態顏色
  getStatusColor(status) {
    const colorMap = {
      'pending': '#fbbf24',
      'confirmed': '#22c55e',
      'cancelled': '#ef4444',
      'completed': '#3b82f6'
    };
    return colorMap[status] || '#6b7280';
  }

  // 獲取狀態特定訊息
  getStatusSpecificMessage(status) {
    const messages = {
      'pending': `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <strong>💳 付款提醒：</strong><br>
          請盡快完成付款以確認您的登記。我們將與您聯繫確認付款方式。
        </div>
      `,
      'confirmed': `
        <div style="background: #d1edff; border: 1px solid #74c0fc; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <strong>✅ 付款確認：</strong><br>
          感謝您的付款！您的登記已確認。我們將在活動前發送更多相關資訊。
        </div>
      `,
      'cancelled': `
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <strong>❌ 登記取消：</strong><br>
          您的登記已被取消。如有疑問，請聯繫我們的客服團隊。
        </div>
      `,
      'completed': `
        <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <strong>🎉 登記完成：</strong><br>
          恭喜！您的登記已完成。期待在活動中與您相見！
        </div>
      `
    };
    return messages[status] || '';
  }
}

module.exports = new EmailService();
