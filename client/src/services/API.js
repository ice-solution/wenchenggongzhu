export class API {
  constructor() {
    // 在生產環境中使用相對路徑，開發環境使用完整 URL
    this.baseURL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001/api' 
      : '/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        // 創建更詳細的錯誤訊息
        const errorMessage = data.message || data.error || '請求失敗';
        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('API 請求錯誤:', error);
      
      // 如果是網絡錯誤或其他錯誤，提供更友好的錯誤訊息
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('網絡連接失敗，請檢查您的網絡連接');
      }
      
      throw error;
    }
  }

  // 活動相關 API
  async getEvents() {
    return this.request('/events');
  }

  async getEvent(id) {
    return this.request(`/events/${id}`);
  }

  async createEvent(eventData) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  async updateEvent(id, eventData) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  }

  async deleteEvent(id) {
    return this.request(`/events/${id}`, {
      method: 'DELETE'
    });
  }

  // 票券相關 API
  async getTickets() {
    return this.request('/tickets');
  }

  async getTicketsByEvent(eventId) {
    return this.request(`/tickets/event/${eventId}`);
  }

  async getTicket(id) {
    return this.request(`/tickets/${id}`);
  }

  async createTicket(ticketData) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  }

  async updateTicket(id, ticketData) {
    return this.request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData)
    });
  }

  async deleteTicket(id) {
    return this.request(`/tickets/${id}`, {
      method: 'DELETE'
    });
  }

  // 購買相關 API
  async createPurchase(purchaseData) {
    return this.request('/purchases', {
      method: 'POST',
      body: JSON.stringify(purchaseData)
    });
  }

  async getPurchases(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/purchases${queryString ? `?${queryString}` : ''}`);
  }

  async getPurchase(id) {
    return this.request(`/purchases/${id}`);
  }

  async getPurchasesByEmail(email) {
    return this.request(`/purchases/email/${email}`);
  }

  async updatePurchaseStatus(id, status) {
    return this.request(`/purchases/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async markConfirmationSent(id, method = 'email') {
    return this.request(`/purchases/${id}/confirmation`, {
      method: 'PUT',
      body: JSON.stringify({ method })
    });
  }

  // 根據票券獲取活動資訊
  async getEventByTicket(ticketId) {
    // 先獲取票券資訊，然後獲取活動資訊
    const ticketResponse = await this.getTicket(ticketId);
    if (ticketResponse.success && ticketResponse.data.event) {
      // 確保 event 是字符串 ID，而不是對象
      const eventId = typeof ticketResponse.data.event === 'string' 
        ? ticketResponse.data.event 
        : ticketResponse.data.event._id || ticketResponse.data.event.id;
      
      if (eventId) {
        return this.getEvent(eventId);
      }
    }
    return { success: false, message: '找不到相關活動' };
  }
}
