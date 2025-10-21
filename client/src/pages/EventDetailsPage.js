export class EventDetailsPage {
  constructor(api) {
    this.api = api;
    this.event = null;
    this.tickets = [];
  }

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
      this.showError('找不到活動 ID');
      return;
    }

    try {
      // 同時載入活動和票券資訊
      const [eventResponse, ticketsResponse] = await Promise.all([
        this.api.getEvent(eventId),
        this.api.getTicketsByEvent(eventId)
      ]);

      if (eventResponse.success) {
        this.event = eventResponse.data;
      } else {
        this.showError('載入活動資訊失敗');
        return;
      }

      if (ticketsResponse.success) {
        this.tickets = ticketsResponse.data;
      }

      // 重新渲染頁面
      document.getElementById('app').innerHTML = this.render();
      this.setupEventListeners();
    } catch (error) {
      console.error('載入活動詳情失敗:', error);
      this.showError('載入活動詳情失敗');
    }
  }

  render() {
    if (!this.event) {
      return `
        <div class="loading-page">
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>載入中...</p>
          </div>
        </div>
      `;
    }

    const date = new Date(this.event.date);
    const formattedDate = date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <div class="event-details-page">
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
            <div class="header-right">
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
          <div class="event-details-container">
            <!-- Left Side - Event Image -->
            <div class="event-image-section">
              <img
                src="${this.event.image}"
                alt="${this.event.title}"
                class="event-detail-image"
                onerror="this.src='https://via.placeholder.com/600x800/1f2937/ffffff?text=Event+Image'"
              />
            </div>

            <!-- Right Side - Event Details -->
            <div class="event-details-section">
              <div class="event-info">
                <h1 class="event-title">${this.event.title}</h1>
                <p class="event-description">${this.event.description}</p>

                <div class="event-date-time">
                  <div class="date-info">
                    <svg class="date-icon" viewBox="0 0 24 24">
                      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>${formattedDate} ${this.event.time}</span>
                  </div>
                </div>

                <div class="event-status">
                  <span class="status-badge">即將舉行</span>
                </div>

                <div class="tickets-section">
                  <h3 class="tickets-title">票券選擇</h3>
                  ${this.renderTickets()}
                </div>

                <div class="organizer-info">
                  <p class="organizer-label">主辦機構</p>
                  <div class="organizer-logo">文成公主國際基金會</div>
                </div>

                <div class="terms-link">
                  <a href="#" class="terms-link-text">
                    活動條款及條件
                    <svg class="arrow-icon" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
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
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
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

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }


        /* Main Content */
        .main-content {
          padding: 2rem 0;
        }

        .event-details-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          gap: 3rem;
          align-items: center;
        }

        /* Left Side - Image */
        .event-image-section {
          flex: 0 0 50%;
        }

        .event-detail-image {
          width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        /* Right Side - Details */
        .event-details-section {
          flex: 0 0 50%;
          padding: 1rem 0;
        }

        .event-info {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .event-title {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin: 0;
          line-height: 1.3;
        }

        .event-description {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #d1d5db;
          margin: 0;
        }

        .event-date-time {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .date-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #9ca3af;
          font-size: 1rem;
        }

        .date-icon {
          width: 20px;
          height: 20px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
        }

        .event-status {
          display: flex;
          align-items: center;
        }

        .status-badge {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .tickets-section {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .tickets-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
          margin: 0 0 1rem 0;
        }

        .ticket-item {
          background: rgba(55, 65, 81, 0.2);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .ticket-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: white;
          margin: 0;
        }

        .ticket-price {
          text-align: right;
        }

        .original-price {
          display: block;
          text-decoration: line-through;
          color: #9ca3af;
          font-size: 0.9rem;
        }

        .current-price {
          display: block;
          color: #ef4444;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .ticket-description {
          margin-bottom: 1rem;
        }

        .ticket-description p {
          color: #d1d5db;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0;
        }

        .ticket-conditions {
          margin-bottom: 1.5rem;
        }

        .ticket-conditions ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .ticket-conditions li {
          color: #9ca3af;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          padding-left: 1rem;
          position: relative;
        }

        .ticket-conditions li:before {
          content: "•";
          color: #ef4444;
          position: absolute;
          left: 0;
        }

        .ticket-actions {
          text-align: right;
        }

        .buy-ticket-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .buy-ticket-btn:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-1px);
        }

        .no-tickets {
          text-align: center;
          padding: 2rem;
          color: #9ca3af;
        }

        .organizer-info {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .organizer-label {
          color: #9ca3af;
          font-size: 0.9rem;
          margin: 0 0 0.5rem 0;
        }

        .organizer-logo {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .terms-link {
          text-align: center;
        }

        .terms-link-text {
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.9rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.3s ease;
        }

        .terms-link-text:hover {
          color: #ef4444;
        }

        .arrow-icon {
          width: 16px;
          height: 16px;
          fill: none;
          stroke: currentColor;
          stroke-width: 2;
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
          background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
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
          .event-details-container {
            flex-direction: column;
            gap: 2rem;
            align-items: stretch;
          }

          .event-image-section,
          .event-details-section {
            flex: none;
          }

          .event-title {
            font-size: 1.5rem;
          }

          .header-container {
            padding: 1rem;
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

  renderTickets() {
    if (this.tickets.length === 0) {
      return `
        <div class="no-tickets">
          <p>目前沒有可用的票券</p>
        </div>
      `;
    }

    return this.tickets.map(ticket => `
      <div class="ticket-item">
        <div class="ticket-header">
          <h4 class="ticket-name">${ticket.name}</h4>
          <div class="ticket-price">
            ${ticket.originalPrice ? `
              <span class="original-price">HK$${ticket.originalPrice}/每場</span>
            ` : ''}
            <span class="current-price">HK$${ticket.price}/每場</span>
          </div>
        </div>
        <div class="ticket-description">
          <p>${ticket.description}</p>
        </div>
        <div class="ticket-conditions">
          <ul>
            ${ticket.restrictions.map(restriction => `<li>${restriction}</li>`).join('')}
          </ul>
        </div>
        <div class="ticket-actions">
          <button class="buy-ticket-btn" data-ticket-id="${ticket._id}" data-ticket-name="${ticket.name}">
            立即預購
          </button>
        </div>
      </div>
    `).join('');
  }

  setupEventListeners() {
    // 購買按鈕事件監聽器
    document.addEventListener('click', (e) => {
      if (e.target.matches('.buy-ticket-btn')) {
        e.preventDefault();
        const ticketId = e.target.getAttribute('data-ticket-id');
        const ticketName = e.target.getAttribute('data-ticket-name');
        
        if (ticketId) {
          // 導航到預購表單頁面
          window.location.href = `/purchase?ticketId=${ticketId}&quantity=1`;
        }
      }
    });
  }

  showError(message) {
    document.getElementById('app').innerHTML = `
      <div class="loading-page">
        <div class="loading-container">
          <div style="color: #ef4444; font-size: 1.125rem; margin-bottom: 1rem;">${message}</div>
          <button 
            onclick="window.history.back()" 
            class="btn-primary"
          >
            返回
          </button>
        </div>
      </div>
    `;
  }

  destroy() {
    // 清理事件監聽器或其他資源
  }
}