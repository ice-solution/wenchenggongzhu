export class PurchaseFormPage {
  constructor(api) {
    this.api = api;
    this.ticket = null;
    this.event = null;
    this.quantity = 1;
    this.customPrice = null;
    this.additionalAmount = 0; // 額外捐款金額
  }

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get('ticketId');
    const quantity = urlParams.get('quantity') || 1;
    
    if (!ticketId) {
      this.showError('找不到票券資訊');
      return;
    }

    this.quantity = parseInt(quantity);

    try {
      // 載入票券資訊
      const ticketResponse = await this.api.getTicket(ticketId);

      if (ticketResponse.success) {
        this.ticket = ticketResponse.data;
        
        // 如果有 event 資訊，載入活動詳情
        if (this.ticket.event) {
          const eventId = typeof this.ticket.event === 'string' 
            ? this.ticket.event 
            : this.ticket.event._id || this.ticket.event.id;
          
          if (eventId) {
            const eventResponse = await this.api.getEvent(eventId);
            if (eventResponse.success) {
              this.event = eventResponse.data;
            }
          }
        }
      } else {
        this.showError('載入票券資訊失敗');
        return;
      }

      // 重新渲染頁面
      document.getElementById('app').innerHTML = this.render();
      this.setupEventListeners();

    } catch (error) {
      console.error('載入預購表單失敗:', error);
      this.showError('載入預購表單失敗');
    }
  }

  render() {
    if (!this.ticket) {
      return `
        <div class="loading-page">
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>載入中...</p>
          </div>
        </div>
      `;
    }

    const basePrice = this.ticket.price;
    const additionalAmount = this.ticket.allowCustomPrice && this.additionalAmount ? this.additionalAmount : 0;
    const totalUnitPrice = basePrice + additionalAmount;
    const totalAmount = totalUnitPrice * this.quantity;

    return `
      <div class="purchase-form-page">
        <!-- Header -->
        <header class="page-header">
          <div class="header-container">
            <div class="header-left">
              <button onclick="window.history.back()" class="back-button">
                <svg class="back-icon" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div class="logo-container">
                <div class="logo-icon">文</div>
                <h1 class="logo-text">文成公主國際基金會</h1>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
          <div class="purchase-container">
            <!-- 活動海報 -->
            ${this.event ? `
            <div class="event-poster-section">
              <div class="poster-container">
                <img 
                  src="${this.event.image}" 
                  alt="${this.event.title}"
                  class="event-poster"
                  onerror="this.src='https://via.placeholder.com/400x600/000000/ffffff?text=Event+Poster'"
                />
                <div class="poster-overlay">
                  <h2 class="event-title">${this.event.title}</h2>
                  <p class="event-description">${this.event.description}</p>
                  <div class="event-meta">
                    <div class="event-date">
                      <svg class="date-icon" viewBox="0 0 24 24">
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                      <span>${new Date(this.event.date).toLocaleDateString('zh-TW', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} ${this.event.time}</span>
                    </div>
                    <div class="event-venue">
                      <svg class="location-icon" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span>${this.event.venue}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ` : ''}

            <!-- 票券資訊 -->
            <div class="ticket-summary">
              <h2>預購確認</h2>
              <div class="ticket-info">
                <div class="ticket-details">
                  <h3>${this.ticket.name}</h3>
                  <p class="ticket-description">${this.ticket.description}</p>
                  <div class="ticket-meta">
                    <span class="price">HK$${totalUnitPrice}/每場</span>
                    <span class="quantity">數量: ${this.quantity}</span>
                    <span class="total">總計: HK$${totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 預購表單 -->
            <div class="purchase-form-section">
              <h2>填寫預購資料</h2>
              <form id="purchase-form" class="purchase-form">
                <div class="form-group">
                  <label for="email">電子郵件 *</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    placeholder="請輸入您的電子郵件地址"
                  >
                </div>

                <div class="form-group">
                  <label for="username">姓名 *</label>
                  <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    required 
                    placeholder="請輸入您的姓名"
                  >
                </div>

                <div class="form-group">
                  <label for="contactMethod">聯絡方式 *</label>
                  <select id="contactMethod" name="contactMethod" required>
                    <option value="">請選擇聯絡方式</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">電子郵件</option>
                    <option value="phone">電話</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="contactInfo">聯絡資訊 *</label>
                  <input 
                    type="text" 
                    id="contactInfo" 
                    name="contactInfo" 
                    required 
                    placeholder="請輸入聯絡資訊"
                  >
                  <div class="form-hint" id="contactHint">
                    請根據您選擇的聯絡方式輸入相應資訊
                  </div>
                </div>

                ${this.ticket.allowCustomPrice ? `
                <div class="form-group">
                  <label for="additionalAmount">額外捐款金額</label>
                  <input 
                    type="number" 
                    id="additionalAmount" 
                    name="additionalAmount" 
                    min="0"
                    step="1"
                    value="0"
                    placeholder="請輸入額外捐款金額"
                  >
                  <div class="form-hint">
                    基本票價：HK$${this.ticket.price}，可額外捐款（金額可為0）
                  </div>
                </div>
                ` : ''}

                <div class="form-group">
                  <label for="notes">備註</label>
                  <textarea 
                    id="notes" 
                    name="notes" 
                    rows="3" 
                    placeholder="如有特殊需求或備註，請在此填寫"
                  ></textarea>
                </div>

                <div class="form-actions">
                  <button type="button" onclick="window.history.back()" class="btn-secondary">
                    返回
                  </button>
                  <button type="submit" class="btn-primary" id="submit-btn">
                    提交預購申請
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>

        <!-- Footer -->
        <footer class="page-footer">
          <div class="footer-container">
            <div class="footer-left">
              <div class="footer-logo">
                <div class="logo-icon">文</div>
                <span class="logo-text">文成公主國際基金會</span>
              </div>
            </div>
            <div class="footer-center">
              <nav class="footer-nav">
                <a href="/" class="footer-link">主頁</a>
                <a href="#" class="footer-link">關於我們</a>
                <a href="#" class="footer-link">常見問題</a>
                <a href="#" class="footer-link">使用條款</a>
                <a href="#" class="footer-link">私隱政策</a>
              </nav>
            </div>
            <div class="footer-right">
              <div class="social-links">
                <a href="#" class="social-link">
                  <svg class="social-icon" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" class="social-link">
                  <svg class="social-icon" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <p class="copyright">© 2025 文成公主國際基金會. 版權所有</p>
          </div>
        </footer>
      </div>

      <style>
        /* Global Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Arial', sans-serif;
          background: #000000;
          color: white;
          min-height: 100vh;
        }

        /* Header */
        .page-header {
          background: rgba(31, 41, 55, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(75, 85, 99, 0.3);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-button {
          background: rgba(55, 65, 81, 0.5);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 8px;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: rgba(75, 85, 99, 0.7);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .back-icon {
          width: 20px;
          height: 20px;
          fill: none;
          stroke: white;
          stroke-width: 2;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .logo-text {
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
        }

        /* Main Content */
        .main-content {
          padding: 2rem 0;
        }

        .purchase-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Event Poster Section */
        .event-poster-section {
          margin-bottom: 2rem;
        }

        .poster-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .event-poster {
          width: 100%;
          height: 500px;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        .poster-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 2rem;
          color: white;
        }

        .poster-overlay .event-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: white;
        }

        .poster-overlay .event-description {
          font-size: 1rem;
          line-height: 1.5;
          margin: 0 0 1rem 0;
          color: #e5e7eb;
        }

        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .event-date,
        .event-venue {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #d1d5db;
        }

        .date-icon,
        .location-icon {
          width: 16px;
          height: 16px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
        }

        /* Ticket Summary */
        .ticket-summary {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .ticket-summary h2 {
          color: #ef4444;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .ticket-info {
          display: flex;
          gap: 1rem;
        }

        .ticket-details h3 {
          color: white;
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
        }

        .ticket-description {
          color: #d1d5db;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .ticket-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .ticket-meta span {
          background: rgba(55, 65, 81, 0.5);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .price {
          color: #ef4444;
          font-weight: 600;
        }

        .quantity {
          color: #9ca3af;
        }

        .total {
          color: #22c55e;
          font-weight: 600;
        }

        /* Purchase Form */
        .purchase-form-section {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 12px;
          padding: 2rem;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .purchase-form-section h2 {
          color: white;
          margin-bottom: 2rem;
          font-size: 1.5rem;
        }

        .purchase-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          background: rgba(55, 65, 81, 0.5);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #9ca3af;
        }

        .form-hint {
          color: #9ca3af;
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          background: #6b7280;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: transparent;
          color: #9ca3af;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .btn-secondary:hover {
          background: rgba(75, 85, 99, 0.3);
          color: white;
        }

        /* Footer */
        .page-footer {
          background: rgba(31, 41, 55, 0.95);
          border-top: 1px solid rgba(75, 85, 99, 0.3);
          margin-top: 4rem;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-nav {
          display: flex;
          gap: 2rem;
        }

        .footer-link {
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: #ef4444;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          color: #9ca3af;
          transition: color 0.3s ease;
        }

        .social-link:hover {
          color: #ef4444;
        }

        .social-icon {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }

        .footer-bottom {
          border-top: 1px solid rgba(75, 85, 99, 0.3);
          padding: 1rem 2rem;
          text-align: center;
        }

        .copyright {
          color: #9ca3af;
          font-size: 0.8rem;
          margin: 0;
        }

        /* Loading Page */
        .loading-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000000;
        }

        .loading-container {
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(75, 85, 99, 0.3);
          border-top: 4px solid #ef4444;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .purchase-container {
            padding: 0 1rem;
          }

          .event-poster {
            height: 400px;
          }

          .poster-overlay {
            padding: 1.5rem;
          }

          .poster-overlay .event-title {
            font-size: 1.5rem;
          }

          .poster-overlay .event-description {
            font-size: 0.9rem;
          }

          .ticket-summary,
          .purchase-form-section {
            padding: 1.5rem;
          }

          .ticket-meta {
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .footer-container {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .footer-nav {
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
          }
        }
      </style>
    `;
  }

  setupEventListeners() {
    // 聯絡方式變更事件
    const contactMethodSelect = document.getElementById('contactMethod');
    const contactInfoInput = document.getElementById('contactInfo');
    const contactHint = document.getElementById('contactHint');

    contactMethodSelect.addEventListener('change', (e) => {
      const method = e.target.value;
      contactInfoInput.placeholder = this.getContactPlaceholder(method);
      contactHint.textContent = this.getContactHint(method);
    });

    // 額外捐款金額變更事件
    if (this.ticket.allowCustomPrice) {
      const additionalAmountInput = document.getElementById('additionalAmount');
      if (additionalAmountInput) {
        additionalAmountInput.addEventListener('input', (e) => {
          this.additionalAmount = parseFloat(e.target.value) || 0;
          this.updatePriceDisplay();
        });
      }
    }

    // 表單提交事件
    const form = document.getElementById('purchase-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  getContactPlaceholder(method) {
    switch (method) {
      case 'whatsapp':
        return '例如：+85212345678';
      case 'phone':
        return '例如：+85212345678';
      case 'email':
        return '例如：user@example.com';
      default:
        return '請輸入聯絡資訊';
    }
  }

  getContactHint(method) {
    switch (method) {
      case 'whatsapp':
        return '請輸入 WhatsApp 號碼，以 + 開頭，例如：+85212345678';
      case 'phone':
        return '請輸入電話號碼，以 + 開頭，例如：+85212345678';
      case 'email':
        return '請輸入電子郵件地址，例如：user@example.com';
      default:
        return '請根據您選擇的聯絡方式輸入相應資訊';
    }
  }

  updatePriceDisplay() {
    if (!this.ticket) return;
    
    const basePrice = this.ticket.price;
    const additionalAmount = this.ticket.allowCustomPrice && this.additionalAmount ? this.additionalAmount : 0;
    const totalUnitPrice = basePrice + additionalAmount;
    const totalAmount = totalUnitPrice * this.quantity;
    
    // 更新價格顯示
    const priceElement = document.querySelector('.price');
    const totalElement = document.querySelector('.total');
    
    if (priceElement) {
      priceElement.textContent = `HK$${totalUnitPrice}/每場`;
    }
    
    if (totalElement) {
      totalElement.textContent = `總計: HK$${totalAmount}`;
    }
  }

  async handleSubmit() {
    const form = document.getElementById('purchase-form');
    const submitBtn = document.getElementById('submit-btn');
    const formData = new FormData(form);

    // 驗證聯絡方式格式
    const contactMethod = formData.get('contactMethod');
    const contactInfo = formData.get('contactInfo');
    
    if (contactMethod === 'whatsapp') {
      // WhatsApp 號碼驗證：必須以 + 開頭，後面跟數字
      const whatsappRegex = /^\+[1-9]\d{1,14}$/;
      if (!whatsappRegex.test(contactInfo)) {
        this.showError('WhatsApp 號碼格式不正確，請輸入有效的國際號碼，例如：+85212345678');
        return;
      }
    } else if (contactMethod === 'phone') {
      // 電話號碼驗證：必須以 + 開頭，後面跟數字
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(contactInfo)) {
        this.showError('電話號碼格式不正確，請輸入有效的國際號碼，例如：+85212345678');
        return;
      }
    }

    // 禁用提交按鈕
    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';

    try {
      const basePrice = this.ticket.price;
      const additionalAmount = this.ticket.allowCustomPrice && this.additionalAmount ? this.additionalAmount : 0;
      const totalUnitPrice = basePrice + additionalAmount;
      const totalAmount = totalUnitPrice * this.quantity;
      
      // 如果有額外捐款，顯示確認對話框
      if (this.ticket.allowCustomPrice && additionalAmount > 0) {
        const confirmMessage = `確定費用為 HK$${basePrice} 票價 + HK$${additionalAmount} 捐款，總數 HK$${totalAmount}？`;
        const confirmed = confirm(confirmMessage);
        if (!confirmed) {
          submitBtn.disabled = false;
          submitBtn.textContent = '提交預購申請';
          return;
        }
      }
      
      const purchaseData = {
        email: formData.get('email'),
        username: formData.get('username'),
        contactMethod: formData.get('contactMethod'),
        contactInfo: formData.get('contactInfo'),
        ticketId: this.ticket._id,
        quantity: this.quantity,
        unitPrice: totalUnitPrice,
        totalPrice: totalAmount,
        additionalAmount: additionalAmount,
        notes: formData.get('notes')
      };

      const response = await this.api.createPurchase(purchaseData);
      
      console.log('Purchase response:', response); // 調試日誌

      if (response.success) {
        // 顯示成功訊息和專屬 URL
        console.log('Success response data:', response.data); // 調試日誌
        this.showSuccessWithUrl(
          response.data.statusUrl, 
          '預購申請已提交成功！我們將盡快與您聯繫確認。',
          response.data.stripePaymentLinkUrl
        );
      } else {
        console.log('Error response:', response); // 調試日誌
        this.showError(response.message || '提交預購申請失敗');
      }

    } catch (error) {
      console.error('提交預購申請失敗:', error);
      
      // 提供更具體的錯誤訊息
      let errorMessage = '提交預購申請失敗，請稍後再試';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.data && error.data.message) {
        errorMessage = error.data.message;
      } else if (error.data && error.data.error) {
        errorMessage = error.data.error;
      }
      
      this.showError(errorMessage);
    } finally {
      // 重新啟用提交按鈕
      submitBtn.disabled = false;
      submitBtn.textContent = '提交預購申請';
    }
  }

  showSuccess(message) {
    document.getElementById('app').innerHTML = `
      <div class="loading-page">
        <div class="loading-container">
          <div style="color: #22c55e; font-size: 1.5rem; margin-bottom: 1rem;">✅</div>
          <div style="color: #22c55e; font-size: 1.125rem; margin-bottom: 2rem;">${message}</div>
          <button 
            onclick="window.location.href='/'" 
            class="btn-primary"
          >
            返回首頁
          </button>
        </div>
      </div>
    `;
  }

  showSuccessWithUrl(statusUrl, message, stripePaymentLinkUrl = null) {
    console.log('Showing success page with URL:', statusUrl); // 調試日誌
    console.log('Stripe payment link:', stripePaymentLinkUrl); // 調試日誌
    document.getElementById('app').innerHTML = `
      <div class="purchase-form-page">
        <!-- Header -->
        <header class="page-header">
          <div class="header-container">
            <div class="header-left">
              <div class="logo">
                <div class="logo-icon">文</div>
                <h1 class="logo-text">文成公主國際基金會</h1>
              </div>
            </div>
            <div class="header-right">
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
          <div class="success-container">
            <div class="success-content">
              <!-- Event Photo -->
              <div class="event-photo-section">
                <img src="${this.event.image}" alt="${this.event.title}" class="event-photo" onerror="this.src='https://via.placeholder.com/400x600/000000/ffffff?text=Event+Poster'"/>
                <div class="event-photo-overlay">
                  <h3 class="event-photo-title">${this.event.title}</h3>
                </div>
              </div>
              
              <!-- Success Icon -->
              <div class="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 12l2 2 4-4"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </div>

              <!-- Success Message -->
              <div class="success-message">
                <h1>預購申請已提交成功！</h1>
                <p>我們將盡快與您聯繫確認</p>
                <p class="contact-method-note">我們會以您選擇的方法聯絡您。</p>
              </div>

              ${stripePaymentLinkUrl ? `
              <!-- Stripe Payment Section -->
              <div class="payment-section">
                <h3>💳 立即支付</h3>
                <p>您可以使用以下連結立即完成支付：</p>
                <div class="payment-container">
                  <a href="${stripePaymentLinkUrl}" class="stripe-payment-link" target="_blank">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.274 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.573-2.354 1.573-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                    </svg>
                    前往 Stripe 支付
                  </a>
                </div>
                <p class="payment-note">安全支付，支援信用卡、Apple Pay、Google Pay 等</p>
              </div>
              ` : ''}

              <!-- Status URL Section -->
              <div class="status-url-section">
                <h3>📋 您的專屬查詢連結</h3>
                <div class="url-container">
                  <a href="${statusUrl}" class="status-url" target="_blank">${statusUrl}</a>
                </div>
                <p class="url-instruction">請保存此連結以便日後查詢登記狀態</p>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                ${stripePaymentLinkUrl ? `
                <button 
                  onclick="window.open('${stripePaymentLinkUrl}', '_blank')" 
                  class="btn btn-primary btn-payment"
                >
                  💳 立即支付
                </button>
                ` : ''}
                <button 
                  onclick="window.open('${statusUrl}', '_blank')" 
                  class="btn ${stripePaymentLinkUrl ? 'btn-secondary' : 'btn-primary'}"
                >
                  查看登記狀態
                </button>
                <button 
                  onclick="window.location.href='/'" 
                  class="btn btn-secondary"
                >
                  返回首頁
                </button>
              </div>
            </div>
          </div>
        </main>

        <!-- Footer -->
        <footer class="page-footer">
          <div class="footer-container">
            <div class="footer-left">
              <div class="footer-logo">
                <div class="logo-icon">文</div>
                <span class="logo-text">文成公主國際基金會</span>
              </div>
            </div>
            <div class="footer-center">
              <nav class="footer-nav">
                <a href="/" class="footer-link">主頁</a>
                <a href="#" class="footer-link">關於我們</a>
                <a href="#" class="footer-link">常見問題</a>
                <a href="#" class="footer-link">使用條款</a>
                <a href="#" class="footer-link">私隱政策</a>
              </nav>
            </div>
            <div class="footer-right">
              <div class="social-links">
                <a href="#" class="social-link">
                  <svg class="social-icon" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" class="social-link">
                  <svg class="social-icon" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2024 文成公主國際基金會. 版權所有.</p>
          </div>
        </footer>
      </div>

      <style>
        /* Basic Page Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          background: #000000;
          color: white;
          line-height: 1.6;
        }
        
        .purchase-form-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        /* Header Styles */
        .page-header {
          background: rgba(0, 0, 0, 0.8);
          border-bottom: 1px solid rgba(75, 85, 99, 0.3);
          padding: 1rem 0;
        }
        
        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .header-left .logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-decoration: none;
          color: white;
        }
        
        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          color: white;
        }
        
        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }
        
        /* Main Content */
        .main-content {
          flex: 1;
          padding: 2rem 0;
        }
        
        /* Footer Styles */
        .page-footer {
          background: rgba(0, 0, 0, 0.8);
          border-top: 1px solid rgba(75, 85, 99, 0.3);
          padding: 2rem 0 1rem;
          margin-top: auto;
        }
        
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 2rem;
        }
        
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .footer-logo .logo-icon {
          width: 30px;
          height: 30px;
          font-size: 1rem;
        }
        
        .footer-logo .logo-text {
          font-size: 1rem;
        }
        
        .footer-nav {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }
        
        .footer-link {
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        
        .footer-link:hover {
          color: white;
        }
        
        .social-links {
          display: flex;
          gap: 1rem;
        }
        
        .social-link {
          color: #9ca3af;
          transition: color 0.3s ease;
        }
        
        .social-link:hover {
          color: white;
        }
        
        .social-icon {
          width: 20px;
          height: 20px;
        }
        
        .footer-bottom {
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(75, 85, 99, 0.3);
          margin-top: 1rem;
          color: #9ca3af;
          font-size: 0.9rem;
        }
        
        /* Success Page Styles */
        .success-container {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
        }
        
        /* Event Photo Section */
        .event-photo-section {
          position: relative;
          width: 100%;
          max-width: 300px;
          margin: 0 auto 2rem;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .event-photo {
          width: 100%;
          height: 400px;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        
        .event-photo-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 2rem 1rem 1rem;
        }
        
        .event-photo-title {
          color: white;
          font-size: 1.125rem;
          font-weight: 600;
          text-align: center;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .success-content {
          max-width: 600px;
          width: 100%;
          text-align: center;
          background: rgba(55, 65, 81, 0.3);
          border-radius: 12px;
          padding: 3rem 2rem;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .success-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
          background: rgba(34, 197, 94, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(34, 197, 94, 0.3);
        }

        .success-icon svg {
          width: 40px;
          height: 40px;
          color: #22c55e;
        }

        .success-message h1 {
          color: #22c55e;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .success-message p {
          color: #9ca3af;
          font-size: 1.125rem;
          margin-bottom: 1rem;
        }
        
        .contact-method-note {
          color: #22c55e !important;
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 2rem !important;
          background: rgba(34, 197, 94, 0.1);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .status-url-section {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 8px;
          padding: 2rem;
          margin: 2rem 0;
        }

        .status-url-section h3 {
          color: #22c55e;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .url-container {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .status-url {
          color: #22c55e;
          text-decoration: none;
          font-weight: 600;
          word-break: break-all;
          font-size: 0.9rem;
        }

        .status-url:hover {
          color: #16a34a;
          text-decoration: underline;
        }

        .url-instruction {
          color: #9ca3af;
          font-size: 0.9rem;
          margin: 0;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 2rem;
        }

        .btn {
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: transparent;
          color: #9ca3af;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .btn-secondary:hover {
          background: rgba(75, 85, 99, 0.3);
          color: white;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .success-content {
            padding: 2rem 1rem;
          }
          
          .event-photo-section {
            max-width: 250px;
            margin-bottom: 1.5rem;
          }
          
          .event-photo {
            height: 300px;
          }
          
          .event-photo-title {
            font-size: 1rem;
          }

          .success-message h1 {
            font-size: 1.5rem;
          }

          .action-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 300px;
          }
        }
      </style>
    `;
  }

  showError(message) {
    document.getElementById('app').innerHTML = `
      <div class="purchase-form-page">
        <!-- Header -->
        <header class="page-header">
          <div class="header-container">
            <div class="header-left">
              <div class="logo">
                <div class="logo-icon">文</div>
                <h1 class="logo-text">文成公主國際基金會</h1>
              </div>
            </div>
            <div class="header-right">
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
          <div class="error-container">
            <div class="error-content">
              <!-- Event Photo -->
              <div class="event-photo-section">
                <img src="${this.event.image}" alt="${this.event.title}" class="event-photo" onerror="this.src='https://via.placeholder.com/400x600/000000/ffffff?text=Event+Poster'"/>
                <div class="event-photo-overlay">
                  <h3 class="event-photo-title">${this.event.title}</h3>
                </div>
              </div>
              
              <!-- Error Icon -->
              <div class="error-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>

              <!-- Error Message -->
              <div class="error-message">
                <h1>提交失敗</h1>
                <p>${message || '提交預購申請失敗，請稍後再試'}</p>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <button 
                  onclick="window.location.reload()" 
                  class="btn btn-primary"
                >
                  重新嘗試
                </button>
                <button 
                  onclick="window.location.href='/'" 
                  class="btn btn-secondary"
                >
                  返回首頁
                </button>
              </div>
            </div>
          </div>
        </main>

        <!-- Footer -->
        <footer class="page-footer">
          <div class="footer-container">
            <div class="footer-left">
              <div class="footer-logo">
                <div class="logo-icon">文</div>
                <span class="logo-text">文成公主國際基金會</span>
              </div>
            </div>
            <div class="footer-center">
              <nav class="footer-nav">
                <a href="/" class="footer-link">主頁</a>
                <a href="#" class="footer-link">關於我們</a>
                <a href="#" class="footer-link">常見問題</a>
                <a href="#" class="footer-link">使用條款</a>
                <a href="#" class="footer-link">私隱政策</a>
              </nav>
            </div>
            <div class="footer-right">
              <div class="social-links">
                <a href="#" class="social-link">
                  <svg class="social-icon" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" class="social-link">
                  <svg class="social-icon" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2024 文成公主國際基金會. 版權所有.</p>
          </div>
        </footer>
      </div>

      <style>
        /* Error Page Styles */
        .error-container {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
        }

        .error-content {
          max-width: 600px;
          width: 100%;
          text-align: center;
          background: rgba(55, 65, 81, 0.3);
          border-radius: 12px;
          padding: 3rem 2rem;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .error-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
          background: rgba(239, 68, 68, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(239, 68, 68, 0.3);
        }

        .error-icon svg {
          width: 40px;
          height: 40px;
          color: #ef4444;
        }

        .error-message h1 {
          color: #ef4444;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .error-message p {
          color: #9ca3af;
          font-size: 1.125rem;
          margin-bottom: 2rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 2rem;
        }

        .btn {
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: transparent;
          color: #9ca3af;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .btn-secondary:hover {
          background: rgba(75, 85, 99, 0.3);
          color: white;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .error-content {
            padding: 2rem 1rem;
          }

          .error-message h1 {
            font-size: 1.5rem;
          }

          .action-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 300px;
          }
        }
      </style>
    `;
  }

  destroy() {
    // 清理事件監聽器或其他資源
  }
}
