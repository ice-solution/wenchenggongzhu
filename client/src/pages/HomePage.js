import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  AccessTime,
  Facebook,
  Instagram
} from '@mui/icons-material';

import i18n from '../utils/i18n.js';

export class HomePage {
  constructor(api) {
    this.api = api;
    this.events = [];
    this.currentLanguage = i18n.getCurrentLanguage();
  }

  async init() {
    try {
      const response = await this.api.getEvents();
      this.events = response.data;
      this.renderEvents();
      this.setupLanguageChangeListener();
    } catch (error) {
      console.error('載入活動失敗:', error);
      this.showError(i18n.t('reload'));
    }
  }

  setupLanguageChangeListener() {
    window.addEventListener('languageChanged', () => {
      this.currentLanguage = i18n.getCurrentLanguage();
      this.render();
      this.renderEvents();
    });

    // 設置語言選擇器
    setTimeout(() => {
      const languageSelect = document.getElementById('language-select');
      if (languageSelect) {
        languageSelect.value = this.currentLanguage;
        languageSelect.addEventListener('change', (e) => {
          i18n.setLanguage(e.target.value);
        });
      }
    }, 100);
  }

  render() {
    return `
      <div>
        <!-- Header -->
        <header>
          <div class="mui-appbar">
            <div class="mui-toolbar">
              <div class="mui-toolbar-left">
                <div class="logo-container">
                  <div class="logo-icon">M</div>
                  <h1 class="logo-text">文成公主國際基金會</h1>
                </div>
              </div>
              <div class="mui-toolbar-right">
                <div class="language-selector">
                  <select id="language-select" class="language-dropdown">
                    <option value="zh-TW">繁體中文</option>
                    <option value="zh-CN">简体中文</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
          <div class="content-container">
            <div class="page-header">
              <h1 class="page-title">${i18n.t('upcomingEvents')}</h1>
              <p class="page-subtitle">${i18n.t('exploreEvents')}</p>
            </div>

            <!-- Events List -->
            <div id="events-container" class="events-container">
              <!-- 載入中 -->
              <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>${i18n.t('loading')}</p>
              </div>
            </div>
          </div>
        </main>

        <!-- Footer -->
        <footer class="footer">
          <div class="footer-container">
            <div class="footer-grid">
              <!-- Logo and Copyright -->
              <div class="footer-section">
                <div class="footer-logo">
                  <div class="logo-icon">文</div>
                  <h3 class="footer-logo-text">文成公主國際基金會</h3>
                </div>
                <p class="footer-copyright">${i18n.t('copyright')}</p>
                <p class="footer-subtitle">${i18n.t('pccwMember')}</p>
              </div>

              <!-- Navigation Links -->
              <div class="footer-section">
                <h4 class="footer-title">${i18n.t('quickLinks')}</h4>
                <div class="footer-links">
                  <a href="#" class="footer-link">${i18n.t('home')}</a>
                  <a href="#" class="footer-link">${i18n.t('aboutUs')}</a>
                  <a href="#" class="footer-link">${i18n.t('faq')}</a>
                  <a href="#" class="footer-link">${i18n.t('termsOfUse')}</a>
                  <a href="#" class="footer-link">${i18n.t('privacyPolicy')}</a>
                </div>
              </div>

              <!-- Social Media -->
              <div class="footer-section">
                <h4 class="footer-title">${i18n.t('followUs')}</h4>
                <div class="social-buttons">
                  <button class="social-button">
                    <svg class="social-icon" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </button>
                  <button class="social-button">
                    <svg class="social-icon" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.033-.394 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>

        <style>
          /* Header Styles */
          .mui-appbar {
            background-color: #000000;
            border-bottom: 1px solid #374151;
            padding: 0 1rem;
          }
          
          .mui-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem 0;
          }
          
          .mui-toolbar-left {
            display: flex;
            align-items: center;
          }
          
          .logo-container {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .logo-icon {
            width: 2rem;
            height: 2rem;
            background-color: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 0.875rem;
          }
          
          .logo-text {
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
            margin: 0;
          }
          
          .mui-toolbar-right {
            display: flex;
            align-items: center;
            gap: 1rem;
          }
          
          .language-selector {
            position: relative;
          }
          
          .language-dropdown {
            background-color: #374151;
            color: white;
            border: 1px solid #4b5563;
            border-radius: 0.375rem;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            cursor: pointer;
            transition: border-color 0.3s ease;
          }
          
          .language-dropdown:hover {
            border-color: #6b7280;
          }
          
          .language-dropdown:focus {
            outline: none;
            border-color: #ef4444;
          }
          
          .mui-button-text {
            color: white;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            transition: color 0.3s ease;
          }
          
          .mui-button-text:hover {
            color: #d1d5db;
          }
          
          .mui-icon-button {
            color: white;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            transition: background-color 0.3s ease;
          }
          
          .mui-icon-button:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
          
          .mui-icon {
            width: 1.5rem;
            height: 1.5rem;
            fill: currentColor;
          }
          
          /* Main Content */
          .main-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
          }
          
          .content-container {
            width: 100%;
          }
          
          .page-header {
            margin-bottom: 2rem;
          }
          
          .page-title {
            font-size: 3rem;
            font-weight: 800;
            color: white;
            margin-bottom: 1rem;
            text-align: center;
            background: linear-gradient(135deg, #ffffff 0%, #d1d5db 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .page-subtitle {
            color: #9ca3af;
            font-size: 1.2rem;
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
          }
          
          .events-container {
            display: flex;
            flex-direction: column;
            gap: 3rem;
          }
          
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            color: #9ca3af;
          }
          
          /* Event Card Styles */
          .event-card {
            display: flex;
            flex-direction: row;
            gap: 0;
            align-items: stretch;
            margin-bottom: 3rem;
            background: rgba(55, 65, 81, 0.1);
            border: 1px solid rgba(75, 85, 99, 0.2);
            border-radius: 12px;
            overflow: hidden;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            min-height: 500px;
          }
          
          .event-card:hover {
            border-color: rgba(239, 68, 68, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            transform: translateY(-2px);
          }
          
          .event-card.reverse {
            flex-direction: row-reverse;
          }
          
          .event-image-container {
            flex: 0 0 60%;
            position: relative;
            border: none;
            border-radius: 0;
            overflow: hidden;
            box-shadow: none;
            margin: 0;
            max-height: 500px;
          }
          
          .event-image {
            width: 100%;
            height: 100%;
            max-height: 500px;
            object-fit: cover;
            object-position: center;
            cursor: pointer;
            transition: all 0.3s ease;
            display: block;
          }
          
          .event-image:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }
          
          .event-content {
            flex: 0 0 40%;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            background: transparent;
            position: relative;
            min-height: 500px;
          }
          
          .event-title {
            font-size: 1.6rem;
            font-weight: 700;
            color: white;
            margin-bottom: 1.5rem;
            line-height: 1.4;
            text-align: left;
          }
          
          .event-description {
            color: #d1d5db;
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
            text-align: left;
          }
          
          .event-meta {
            display: flex;
            align-items: center;
            gap: 1.2rem;
            color: #9ca3af;
            margin-bottom: 2rem;
            flex-wrap: wrap;
          }
          
          .event-meta-item {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            font-size: 0.9rem;
            background: rgba(55, 65, 81, 0.4);
            padding: 0.6rem 1rem;
            border-radius: 18px;
            backdrop-filter: blur(10px);
          }
          
          .event-footer {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            margin-top: 2rem;
          }
          
          .event-organizer {
            font-size: 0.85rem;
            color: #9ca3af;
            text-align: left;
            margin-bottom: 0.5rem;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 10px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            min-width: 140px;
            text-align: center;
            box-shadow: 0 3px 12px rgba(239, 68, 68, 0.3);
            align-self: flex-start;
          }
          
          .btn-primary:hover {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          }
          
          /* Footer */
          .footer {
            background-color: #000000;
            border-top: 1px solid #374151;
            margin-top: 4rem;
            padding: 2rem 1rem;
          }
          
          .footer-container {
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
          }
          
          .footer-section {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .footer-logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }
          
          .footer-logo-text {
            font-size: 1.25rem;
            font-weight: bold;
            color: white;
            margin: 0;
          }
          
          .footer-copyright {
            color: #9ca3af;
            font-size: 0.875rem;
            margin: 0;
          }
          
          .footer-subtitle {
            color: #9ca3af;
            font-size: 0.875rem;
            margin: 0;
          }
          
          .footer-title {
            color: white;
            font-weight: 600;
            margin: 0;
          }
          
          .footer-links {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
          
          .footer-link {
            color: #9ca3af;
            text-decoration: none;
            font-size: 0.875rem;
            transition: color 0.3s ease;
          }
          
          .footer-link:hover {
            color: white;
          }
          
          /* 響應式設計 */
          @media (max-width: 768px) {
            .page-title {
              font-size: 2.5rem;
            }
            
            .page-subtitle {
              font-size: 1rem;
            }
            
            .event-card {
              flex-direction: column;
              min-height: auto;
            }
            
            .event-image-container {
              flex: none;
              height: 300px;
              max-height: 300px;
            }
            
            .event-image {
              min-height: 300px;
              max-height: 300px;
            }
            
            .event-content {
              flex: none;
              padding: 2rem 1.5rem;
              min-height: auto;
            }
            
            .event-title {
              font-size: 1.4rem;
              text-align: center;
              margin-bottom: 1.2rem;
            }
            
            .event-description {
              font-size: 0.95rem;
              text-align: center;
              margin-bottom: 1.8rem;
            }
            
            .event-meta {
              justify-content: center;
              gap: 1rem;
              margin-bottom: 1.8rem;
            }
            
            .event-meta-item {
              font-size: 0.85rem;
              padding: 0.5rem 0.8rem;
            }
            
            .event-organizer {
              text-align: center;
              margin-bottom: 0.8rem;
            }
            
            .btn-primary {
              align-self: center;
              padding: 0.8rem 1.5rem;
              font-size: 0.9rem;
              min-width: 130px;
            }
          }
          
          @media (max-width: 480px) {
            .page-title {
              font-size: 2rem;
            }
            
            .event-image-container {
              height: 250px;
              max-height: 250px;
            }
            
            .event-image {
              min-height: 250px;
              max-height: 250px;
            }
            
            .event-content {
              padding: 1.5rem 1rem;
            }
            
            .event-title {
              font-size: 1.2rem;
              margin-bottom: 1rem;
            }
            
            .event-description {
              font-size: 0.9rem;
              margin-bottom: 1.5rem;
            }
            
            .event-meta {
              flex-direction: column;
              gap: 0.8rem;
              margin-bottom: 1.5rem;
            }
            
            .event-meta-item {
              font-size: 0.8rem;
              padding: 0.4rem 0.7rem;
            }
          }
          
          .app-buttons {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }
          
          .app-button {
            background-color: #374151;
            color: white;
            border: none;
            padding: 0.5rem 0.75rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }
          
          .app-button:hover {
            background-color: #4b5563;
          }
          
          .social-buttons {
            display: flex;
            gap: 0.5rem;
          }
          
          .social-button {
            color: #9ca3af;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            transition: color 0.3s ease;
          }
          
          .social-button:hover {
            color: white;
          }
          
          .social-icon {
            width: 1.25rem;
            height: 1.25rem;
            fill: currentColor;
          }
          
          /* Responsive Design */
          @media (min-width: 768px) {
            .event-card {
              flex-direction: row;
              align-items: flex-start;
            }
            
            .event-card.reverse {
              flex-direction: row-reverse;
            }
            
            .event-image-container {
              width: 50%;
            }
            
            .event-content {
              width: 50%;
              padding: 0 2rem;
            }
          }
        </style>
      </div>
    `;
  }

  renderEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;

    if (this.events.length === 0) {
      container.innerHTML = `
        <div class="loading-container">
          <p>目前沒有活動</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.events.map((event, index) => {
      const isLeft = index % 2 === 0;
      return this.renderEventCard(event, isLeft);
    }).join('');
  }

  renderEventCard(event, isLeft) {
    const date = new Date(event.date);
    const formattedDate = date.toLocaleDateString('zh-TW', {
      month: 'numeric',
      day: 'numeric'
    });
    const formattedTime = event.time;

    return `
      <div class="event-card ${!isLeft ? 'reverse' : ''}">
        <!-- Event Image -->
        <div class="event-image-container">
          <img 
            src="${event.image}" 
            alt="${event.title}"
            class="event-image"
            data-route="/event?id=${event._id}"
            onerror="this.src='https://via.placeholder.com/600x400/000000/ffffff?text=Event+Image'"
          />
        </div>

        <!-- Event Info -->
        <div class="event-content">
          <h3 class="event-title">${event.title}</h3>
          <p class="event-description">${event.shortDescription}</p>
          <div class="event-meta">
            <div class="event-meta-item">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span>${formattedDate}</span>
            </div>
            <div class="event-meta-item">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>${formattedTime}</span>
            </div>
          </div>
          <div class="event-footer">
            <span class="event-organizer">${i18n.t('organizer')}: ${event.organizer}</span>
            <button 
              class="btn-primary"
              data-route="/event?id=${event._id}"
            >
              ${i18n.t('viewDetails')}
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  showError(message) {
    const container = document.getElementById('events-container');
    if (container) {
      container.innerHTML = `
        <div class="loading-container">
          <div style="color: #ef4444; font-size: 1.125rem; margin-bottom: 1rem;">${message}</div>
          <button 
            onclick="location.reload()" 
            class="btn-primary"
          >
            重新載入
          </button>
        </div>
      `;
    }
  }

  destroy() {
    // 清理事件監聽器或其他資源
  }
}