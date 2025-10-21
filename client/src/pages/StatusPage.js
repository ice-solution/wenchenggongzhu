import { API } from '../services/API.js';

export class StatusPage {
  constructor(api) {
    this.api = api;
    this.purchase = null;
    this.loading = true;
    this.error = null;
  }

  async init() {
    await this.loadPurchaseData();
  }

  async loadPurchaseData() {
    try {
      // 從 URL 獲取 uniqueId
      const pathParts = window.location.pathname.split('/');
      const uniqueId = pathParts[pathParts.length - 1];
      
      if (!uniqueId || uniqueId === 'status') {
        this.error = '無效的登記編號';
        this.loading = false;
        return;
      }

      // 調用 API 獲取購買數據
      const baseURL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5001/api' 
        : '/api';
      const response = await fetch(`${baseURL}/purchases/status/${uniqueId}`);
      const data = await response.json();

      if (data.success) {
        this.purchase = data.data;
      } else {
        this.error = data.message || '找不到登記記錄';
      }
    } catch (error) {
      console.error('載入登記資料失敗:', error);
      this.error = '載入登記資料失敗，請稍後再試';
    } finally {
      this.loading = false;
      // 重新渲染頁面
      document.getElementById('app').innerHTML = this.render();
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    // 設置列印按鈕事件
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  render() {
    if (this.loading) {
      return `
        <div class="status-page">
          <!-- Header -->
          <header class="page-header">
            <div class="header-container">
              <div class="header-left">
                <a href="/" class="logo" data-route="/">
                  <div class="logo-icon">文</div>
                  <h1 class="logo-text">文成公主國際基金會</h1>
                </a>
              </div>
            </div>
          </header>

          <!-- Main Content -->
          <main class="main-content">
            <div class="status-container">
              <div class="loading">
                <p>正在載入登記資料...</p>
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
        ${this.getStyles()}
      `;
    }

    if (this.error) {
      return `
        <div class="status-page">
          <!-- Header -->
          <header class="page-header">
            <div class="header-container">
              <div class="header-left">
                <a href="/" class="logo" data-route="/">
                  <div class="logo-icon">文</div>
                  <h1 class="logo-text">文成公主國際基金會</h1>
                </a>
              </div>
            </div>
          </header>

          <!-- Main Content -->
          <main class="main-content">
            <div class="status-container">
              <div class="error">
                <p>${this.error}</p>
                <a href="/" class="btn" data-route="/">返回首頁</a>
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
        ${this.getStyles()}
      `;
    }

    const purchase = this.purchase;
    return `
      <div class="status-page">
        <!-- Header -->
        <header class="page-header">
          <div class="header-container">
            <div class="header-left">
              <a href="/" class="logo" data-route="/">
                <div class="logo-icon">文</div>
                <h1 class="logo-text">文成公主國際基金會</h1>
              </a>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
          <div class="status-container">
            <div class="status-header">
              <h1>登記狀態查詢</h1>
              <p>查看您的預購登記詳情和狀態</p>
            </div>

            <!-- Status Badge -->
            <div style="text-align: center; margin-bottom: 1rem;">
              <div class="status-badge ${purchase.status}">
                ${this.getStatusText(purchase.status)}
              </div>
            </div>

            <!-- Event Poster -->
            <div class="event-poster">
              ${purchase.event && purchase.event.image ? `
                <img src="${purchase.event.image}" alt="${purchase.event.title}" 
                     onerror="this.src='https://via.placeholder.com/300x400/000000/ffffff?text=Event+Poster'">
              ` : ''}
            </div>

            <!-- Info Grid -->
            <div class="info-grid">
              <!-- Event Information -->
              <div class="info-card">
                <h3>活動資訊</h3>
                <div class="info-item">
                  <span class="info-label">活動名稱</span>
                  <span class="info-value">${purchase.event ? purchase.event.title : '-'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">活動日期</span>
                  <span class="info-value">${purchase.event ? new Date(purchase.event.date).toLocaleDateString('zh-TW') : '-'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">活動時間</span>
                  <span class="info-value">${purchase.event ? purchase.event.time : '-'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">活動地點</span>
                  <span class="info-value">${purchase.event ? purchase.event.venue : '-'}</span>
                </div>
              </div>

              <!-- Ticket Information -->
              <div class="info-card">
                <h3>票券資訊</h3>
                <div class="info-item">
                  <span class="info-label">票券類型</span>
                  <span class="info-value">${purchase.ticket ? purchase.ticket.name : '-'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">票券價格</span>
                  <span class="info-value">${purchase.ticket ? `HK$${purchase.ticket.price}/每場` : '-'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">購買數量</span>
                  <span class="info-value">${purchase.quantity || '-'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">總金額</span>
                  <span class="info-value">HK$${purchase.totalPrice || purchase.totalAmount || 0}</span>
                </div>
              </div>

              <!-- User Information -->
              <div class="info-card">
                <h3>用戶資訊</h3>
                <div class="info-item">
                  <span class="info-label">姓名</span>
                  <span class="info-value">${purchase.username || '-'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">電子郵件</span>
                  <span class="info-value">${purchase.email || '-'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">聯絡方式</span>
                  <span class="info-value">${this.getContactMethodText(purchase.contactMethod)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">聯絡資訊</span>
                  <span class="info-value">${purchase.contactInfo || '-'}</span>
                </div>
              </div>

              <!-- Purchase Information -->
              <div class="info-card">
                <h3>登記資訊</h3>
                <div class="info-item">
                  <span class="info-label">登記時間</span>
                  <span class="info-value">${new Date(purchase.createdAt).toLocaleString('zh-TW')}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">登記狀態</span>
                  <span class="info-value">${this.getStatusText(purchase.status)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">確認狀態</span>
                  <span class="info-value">${purchase.confirmationSent ? '已發送' : '未發送'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">登記編號</span>
                  <span class="info-value">${this.getShortId(purchase.uniqueId)}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="actions">
              <a href="/" class="btn" data-route="/">返回首頁</a>
              <button id="printBtn" class="btn btn-secondary">列印登記資料</button>
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
      ${this.getStyles()}
    `;
  }

  getStyles() {
    return `
      <style>
        /* 包含所有狀態頁面的 CSS 樣式 */
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
        
        .status-page {
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
        
        .status-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 2rem;
          background: rgba(55, 65, 81, 0.3);
          border-radius: 12px;
          padding: 2rem;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }
        
        .status-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .status-header h1 {
          color: #ef4444;
          margin-bottom: 0.5rem;
        }
        
        .status-header p {
          color: #9ca3af;
        }
        
        /* Status Badge */
        .status-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          text-align: center;
          width: 100%;
          max-width: 200px;
        }
        
        .status-badge.pending {
          background: rgba(251, 191, 36, 0.2);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.3);
        }
        
        .status-badge.confirmed {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        
        .status-badge.cancelled {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        
        .status-badge.completed {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }
        
        /* Info Cards */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .info-card {
          background: rgba(55, 65, 81, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          border-left: 4px solid #ef4444;
        }
        
        .info-card h3 {
          color: #ef4444;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(75, 85, 99, 0.3);
        }
        
        .info-item:last-child {
          border-bottom: none;
        }
        
        .info-label {
          color: #9ca3af;
          font-weight: 500;
        }
        
        .info-value {
          color: white;
          font-weight: 600;
        }
        
        /* Event Poster */
        .event-poster {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .event-poster img {
          max-width: 300px;
          width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        /* Actions */
        .actions {
          text-align: center;
          margin-top: 2rem;
        }
        
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          text-decoration: none;
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
          margin: 0.5rem;
          border: none;
          cursor: pointer;
        }
        
        .btn:hover {
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
        
        /* Loading and Error States */
        .loading {
          text-align: center;
          padding: 2rem;
          color: #9ca3af;
        }
        
        .error {
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          text-align: center;
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
        
        /* Print Styles */
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body {
            background: white !important;
            color: black !important;
            font-size: 12pt;
            line-height: 1.4;
            margin: 0;
            padding: 0;
          }
          
          .page-header {
            background: white !important;
            border-bottom: 2px solid #333 !important;
            padding: 1rem 0 !important;
            margin-bottom: 1rem !important;
          }
          
          .logo-icon {
            background: #333 !important;
            color: white !important;
          }
          
          .logo-text {
            color: #333 !important;
          }
          
          .main-content {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .status-container {
            background: white !important;
            border: 1px solid #333 !important;
            border-radius: 0 !important;
            padding: 1rem !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          
          .status-header {
            text-align: center !important;
            margin-bottom: 1rem !important;
            border-bottom: 1px solid #333 !important;
            padding-bottom: 1rem !important;
          }
          
          .status-header h1 {
            color: #333 !important;
            font-size: 18pt !important;
            margin-bottom: 0.5rem !important;
          }
          
          .status-header p {
            color: #666 !important;
            font-size: 10pt !important;
          }
          
          .status-badge {
            background: #f0f0f0 !important;
            color: #333 !important;
            border: 1px solid #333 !important;
            font-size: 10pt !important;
            padding: 0.3rem 0.8rem !important;
            margin: 0 auto 1rem !important;
            display: block !important;
            width: fit-content !important;
          }
          
          .event-poster {
            text-align: center !important;
            margin-bottom: 1rem !important;
          }
          
          .event-poster img {
            max-width: 200px !important;
            height: auto !important;
            border: 1px solid #333 !important;
          }
          
          .info-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 1rem !important;
            margin-bottom: 1rem !important;
          }
          
          .info-card {
            background: white !important;
            border: 1px solid #333 !important;
            border-radius: 0 !important;
            padding: 0.8rem !important;
            border-left: 4px solid #333 !important;
            page-break-inside: avoid !important;
          }
          
          .info-card h3 {
            color: #333 !important;
            font-size: 12pt !important;
            margin-bottom: 0.5rem !important;
            border-bottom: 1px solid #333 !important;
            padding-bottom: 0.3rem !important;
          }
          
          .info-item {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 0.2rem 0 !important;
            border-bottom: 1px solid #ddd !important;
            font-size: 10pt !important;
          }
          
          .info-item:last-child {
            border-bottom: none !important;
          }
          
          .info-label {
            color: #666 !important;
            font-weight: normal !important;
          }
          
          .info-value {
            color: #333 !important;
            font-weight: bold !important;
          }
          
          .actions {
            display: none !important;
          }
          
          .page-footer {
            display: none !important;
          }
          
          /* 確保內容適合 A4 頁面 */
          @page {
            size: A4;
            margin: 1cm;
          }
          
          /* 避免分頁 */
          .status-container {
            page-break-inside: avoid !important;
          }
          
          .info-grid {
            page-break-inside: avoid !important;
          }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
          .main-content {
            padding: 1rem 0;
          }
          
          .status-container {
            padding: 1rem;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .header-container {
            padding: 0 1rem;
          }

          .footer-container {
            padding: 0 1rem;
          }
        }
      </style>
    `;
  }

  getStatusText(status) {
    const statusMap = {
      'pending': '待付款',
      'confirmed': '已付款',
      'cancelled': '已取消',
      'completed': '已完成'
    };
    return statusMap[status] || status;
  }

  getContactMethodText(method) {
    const methodMap = {
      'whatsapp': 'WhatsApp',
      'email': '電子郵件',
      'phone': '電話'
    };
    return methodMap[method] || method;
  }

  getShortId(uniqueId) {
    if (!uniqueId) return 'N/A';
    return `${uniqueId.substring(0, 8)}...${uniqueId.substring(uniqueId.length - 8)}`;
  }
}







