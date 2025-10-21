import { HomePage } from './pages/HomePage.js';
import { EventDetailsPage } from './pages/EventDetailsPage.js';
import { PurchaseFormPage } from './pages/PurchaseFormPage.js';
import { StatusPage } from './pages/StatusPage.js';
import { API } from './services/API.js';

export class App {
  constructor() {
    this.api = new API();
    this.currentPage = null;
    this.routes = {
      '/': HomePage,
      '/event': EventDetailsPage,
      '/purchase': PurchaseFormPage,
      '/status': StatusPage
    };
  }

  async init() {
    this.setupRouting();
    await this.render();
  }

  setupRouting() {
    // 監聽瀏覽器前進後退
    window.addEventListener('popstate', async () => {
      await this.render();
    });

    // 攔截所有內部連結點擊
    document.addEventListener('click', async (e) => {
      if (e.target.matches('[data-route]')) {
        e.preventDefault();
        const route = e.target.getAttribute('data-route');
        await this.navigateTo(route);
      }
    });
  }

  async navigateTo(route) {
    window.history.pushState({}, '', route);
    await this.render();
  }

  async render() {
    const path = window.location.pathname;
    let PageComponent = HomePage;
    
    // 檢查路由匹配
    if (path === '/') {
      PageComponent = HomePage;
    } else if (path.startsWith('/event')) {
      PageComponent = EventDetailsPage;
    } else if (path.startsWith('/purchase')) {
      PageComponent = PurchaseFormPage;
    } else if (path.startsWith('/status')) {
      PageComponent = StatusPage;
    }
    
    // 清理當前頁面
    if (this.currentPage && this.currentPage.destroy) {
      this.currentPage.destroy();
    }

    // 渲染新頁面
    this.currentPage = new PageComponent(this.api);
    document.getElementById('app').innerHTML = this.currentPage.render();
    
    // 初始化頁面
    if (this.currentPage.init) {
      await this.currentPage.init();
    }
  }
}
