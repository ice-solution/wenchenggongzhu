import en from '../locales/en.js';
import zhTW from '../locales/zh-TW.js';
import zhCN from '../locales/zh-CN.js';

class I18n {
  constructor() {
    this.currentLanguage = this.getStoredLanguage() || 'zh-TW';
    this.translations = {
      'en': en,
      'zh-TW': zhTW,
      'zh-CN': zhCN
    };
  }

  // 獲取存儲的語言設定
  getStoredLanguage() {
    return localStorage.getItem('preferred-language');
  }

  // 設置語言
  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('preferred-language', language);
      
      // 觸發語言變更事件
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language }
      }));
      
      return true;
    }
    return false;
  }

  // 獲取當前語言
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // 獲取翻譯文本
  t(key, params = {}) {
    const translation = this.translations[this.currentLanguage];
    
    if (!translation) {
      console.warn(`Translation not found for language: ${this.currentLanguage}`);
      return key;
    }

    let text = translation[key];
    
    if (!text) {
      console.warn(`Translation key not found: ${key} for language: ${this.currentLanguage}`);
      // 嘗試從英文獲取備用翻譯
      text = this.translations['en'][key] || key;
    }

    // 替換參數
    if (params && typeof params === 'object') {
      Object.keys(params).forEach(param => {
        text = text.replace(`{{${param}}}`, params[param]);
      });
    }

    return text;
  }

  // 獲取所有可用語言
  getAvailableLanguages() {
    return [
      { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
      { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
      { code: 'en', name: 'English', nativeName: 'English' }
    ];
  }

  // 檢測瀏覽器語言
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    
    // 簡化語言代碼處理
    const lang = browserLang.toLowerCase();
    
    if (lang.startsWith('zh-cn') || lang.startsWith('zh_hans')) {
      return 'zh-CN';
    } else if (lang.startsWith('zh-tw') || lang.startsWith('zh_hant') || lang.startsWith('zh-hk')) {
      return 'zh-TW';
    } else if (lang.startsWith('en')) {
      return 'en';
    }
    
    // 預設返回繁體中文
    return 'zh-TW';
  }

  // 初始化語言設定
  init() {
    // 如果沒有存儲的語言設定，使用瀏覽器語言
    if (!this.getStoredLanguage()) {
      const detectedLang = this.detectBrowserLanguage();
      this.setLanguage(detectedLang);
    }
  }

  // 獲取語言選擇器的 HTML
  getLanguageSelector() {
    const languages = this.getAvailableLanguages();
    
    return `
      <select id="language-select" class="language-selector">
        ${languages.map(lang => `
          <option value="${lang.code}" ${lang.code === this.currentLanguage ? 'selected' : ''}>
            ${lang.nativeName}
          </option>
        `).join('')}
      </select>
    `;
  }

  // 設置語言選擇器事件
  setupLanguageSelector() {
    const selector = document.getElementById('language-select');
    if (selector) {
      selector.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
    }
  }
}

// 創建單例實例
const i18n = new I18n();

// 初始化
i18n.init();

export default i18n;
