const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  constructor() {
    this.stripe = stripe;
  }

  // 創建支付連結
  async createPaymentLink(purchaseData) {
    try {
      const { 
        purchaseId, 
        totalPrice, 
        currency = 'hkd', 
        ticketName, 
        eventTitle,
        username,
        email 
      } = purchaseData;

      // 創建 Stripe 產品
      const product = await this.stripe.products.create({
        name: `${eventTitle} - ${ticketName}`,
        description: `票券購買 - ${username}`,
        metadata: {
          purchaseId: purchaseId.toString(),
          eventTitle: eventTitle,
          ticketName: ticketName,
          username: username,
          email: email
        }
      });

      // 創建價格
      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: totalPrice * 100, // Stripe 使用分為單位
        currency: currency,
        metadata: {
          purchaseId: purchaseId.toString()
        }
      });

      // 創建支付連結
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        metadata: {
          purchaseId: purchaseId.toString()
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${process.env.FRONTEND_URL}/status/${purchaseData.uniqueId}`
          }
        },
        allow_promotion_codes: false,
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['HK', 'TW', 'CN', 'US', 'GB'],
        },
        phone_number_collection: {
          enabled: true,
        },
      });

      return {
        success: true,
        paymentLinkUrl: paymentLink.url,
        paymentLinkId: paymentLink.id,
        productId: product.id,
        priceId: price.id
      };

    } catch (error) {
      console.error('創建 Stripe 支付連結失敗:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 驗證 webhook 簽名
  verifyWebhookSignature(payload, signature) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return { success: true, event };
    } catch (error) {
      console.error('Webhook 簽名驗證失敗:', error);
      return { success: false, error: error.message };
    }
  }

  // 處理支付成功事件
  async handlePaymentSuccess(event) {
    try {
      const session = event.data.object;
      
      // 從 metadata 獲取購買 ID
      const purchaseId = session.metadata?.purchaseId;
      
      if (!purchaseId) {
        console.error('找不到購買 ID:', session.metadata);
        return { success: false, error: '找不到購買 ID' };
      }

      return {
        success: true,
        purchaseId: purchaseId,
        sessionId: session.id,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email,
        amountTotal: session.amount_total,
        currency: session.currency
      };

    } catch (error) {
      console.error('處理支付成功事件失敗:', error);
      return { success: false, error: error.message };
    }
  }

  // 處理支付失敗事件
  async handlePaymentFailed(event) {
    try {
      const session = event.data.object;
      
      // 從 metadata 獲取購買 ID
      const purchaseId = session.metadata?.purchaseId;
      
      if (!purchaseId) {
        console.error('找不到購買 ID:', session.metadata);
        return { success: false, error: '找不到購買 ID' };
      }

      return {
        success: true,
        purchaseId: purchaseId,
        sessionId: session.id,
        paymentStatus: session.payment_status,
        failureReason: session.payment_intent?.last_payment_error?.message
      };

    } catch (error) {
      console.error('處理支付失敗事件失敗:', error);
      return { success: false, error: error.message };
    }
  }

  // 檢查支付狀態
  async checkPaymentStatus(sessionId) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      
      return {
        success: true,
        session: session,
        paymentStatus: session.payment_status,
        status: session.status
      };

    } catch (error) {
      console.error('檢查支付狀態失敗:', error);
      return { success: false, error: error.message };
    }
  }

  // 創建退款
  async createRefund(paymentIntentId, amount = null) {
    try {
      const refundParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = amount;
      }

      const refund = await this.stripe.refunds.create(refundParams);

      return {
        success: true,
        refund: refund,
        refundId: refund.id
      };

    } catch (error) {
      console.error('創建退款失敗:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new StripeService();
