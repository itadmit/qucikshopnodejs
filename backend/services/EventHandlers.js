import { PrismaClient } from '@prisma/client';
import systemEvents from './EventEmitter.js';
import { InventoryService } from './InventoryService.js';
import { NotificationService } from './NotificationService.js';
import { CustomerService } from './CustomerService.js';
import { AnalyticsService } from './analyticsService.js';
import { DiscountService } from './discountService.js';

const prisma = new PrismaClient();

/**
 * מרכז Event Handlers למערכת
 * כל האירועים מטופלים כאן בצורה מרכזית
 */
export class EventHandlers {
  
  /**
   * אתחול כל ה-Event Handlers
   */
  static initialize() {
    console.log('🎯 Initializing event handlers...');

    // אירועי הזמנות
    this.setupOrderEventHandlers();
    
    // אירועי מלאי
    this.setupInventoryEventHandlers();
    
    // אירועי לקוחות
    this.setupCustomerEventHandlers();
    
    // אירועי אנליטיקס
    this.setupAnalyticsEventHandlers();

    console.log('✅ Event handlers initialized successfully');
  }

  /**
   * Event Handlers להזמנות
   */
  static setupOrderEventHandlers() {
    
    // יצירת הזמנה חדשה
    systemEvents.onEvent('order.created', async (data) => {
      const { order, items, coupons, discounts } = data;
      
      console.log('🛍️ Processing order.created event:', order.id);

      // רצף הפעולות הנדרשות:
      await Promise.all([
        // 1. עדכון מלאי
        InventoryService.updateStockForOrder(items),
        
        // 2. שליחת התראות
        NotificationService.sendOrderNotificationToOwner(order),
        NotificationService.sendOrderConfirmationToCustomer(order),
        
        // 3. עדכון סטטיסטיקות לקוח
        CustomerService.updateCustomerStats(order.customerId, order.totalAmount),
        
        // 4. מעקב אנליטיקס
        AnalyticsService.trackEvent(
          order.storeId, 
          'order_completed', 
          {
            orderId: order.id,
            orderNumber: order.orderNumber,
            revenue: order.totalAmount,
            itemCount: items.length,
            customerType: order.customerId ? 'registered' : 'guest'
          }
        )
      ]);

      // 5. רישום שימוש בקופונים והנחות
      if (coupons && coupons.length > 0) {
        for (const couponCode of coupons) {
          // TODO: יישום רישום שימוש בקופונים
          console.log('📋 Recording coupon usage:', couponCode);
        }
      }

      console.log('✅ Order.created event processed successfully');
    });

    // עדכון סטטוס הזמנה
    systemEvents.onEvent('order.status_updated', async (data) => {
      const { order, previousStatus, newStatus } = data;
      
      console.log('📦 Processing order.status_updated event:', {
        orderId: order.id,
        from: previousStatus,
        to: newStatus
      });

      // שליחת עדכון ללקוח
      await NotificationService.sendOrderStatusUpdateToCustomer(order, previousStatus, newStatus);

      // אם ההזמנה בוטלה - החזרת מלאי
      if (newStatus === 'CANCELLED' && previousStatus !== 'CANCELLED') {
        await InventoryService.restoreStockForOrder(order.items);
      }

      // מעקב אנליטיקס
      await AnalyticsService.trackEvent(
        order.storeId,
        'order_status_changed',
        {
          orderId: order.id,
          previousStatus,
          newStatus
        }
      );
    });

    // עדכון סטטוס תשלום
    systemEvents.onEvent('order.payment_updated', async (data) => {
      const { order, paymentStatus } = data;
      
      console.log('💳 Processing order.payment_updated event:', {
        orderId: order.id,
        paymentStatus
      });

      // שליחת התראה ללקוח
      await NotificationService.sendPaymentNotificationToCustomer(order, paymentStatus);

      // מעקב אנליטיקס
      await AnalyticsService.trackEvent(
        order.storeId,
        'payment_status_changed',
        {
          orderId: order.id,
          paymentStatus,
          amount: order.totalAmount
        }
      );
    });
  }

  /**
   * Event Handlers למלאי
   */
  static setupInventoryEventHandlers() {
    
    // מלאי נמוך
    systemEvents.onEvent('inventory.low_stock', async (data) => {
      console.log('⚠️ Processing inventory.low_stock event:', data.productName);
      
      await NotificationService.sendLowStockAlert(data);
      
      // מעקב אנליטיקס
      await AnalyticsService.trackEvent(
        data.storeId,
        'low_stock_alert',
        {
          productId: data.productId,
          variantId: data.variantId,
          currentQuantity: data.currentQuantity,
          type: data.type
        }
      );
    });

    // מלאי אפס
    systemEvents.onEvent('inventory.out_of_stock', async (data) => {
      console.log('🚨 Processing inventory.out_of_stock event:', data.productName);
      
      await NotificationService.sendOutOfStockAlert(data);
      
      // מעקב אנליטיקס
      await AnalyticsService.trackEvent(
        data.storeId,
        'out_of_stock',
        {
          productId: data.productId,
          type: data.type
        }
      );
    });
  }

  /**
   * Event Handlers ללקוחות
   */
  static setupCustomerEventHandlers() {
    
    // לקוח חדש
    systemEvents.onEvent('customer.created', async (data) => {
      const { customer } = data;
      
      console.log('👤 Processing customer.created event:', customer.email);
      
      await Promise.all([
        // התראה לבעל החנות
        NotificationService.sendNewCustomerNotification(customer),
        
        // מעקב אנליטיקס
        AnalyticsService.trackEvent(
          customer.storeId,
          'new_customer_registered',
          {
            customerId: customer.id,
            customerEmail: customer.email
          }
        )
      ]);
    });

    // לקוח הפך ל-VIP
    systemEvents.onEvent('customer.became_vip', async (data) => {
      const { customer, milestone } = data;
      
      console.log('⭐ Processing customer.became_vip event:', customer.email);
      
      // TODO: שליחת מייל מיוחד ללקוח VIP
      // TODO: הפעלת הנחות מיוחדות
      
      // מעקב אנליטיקס
      await AnalyticsService.trackEvent(
        customer.storeId,
        'customer_milestone',
        {
          customerId: customer.id,
          milestone,
          totalSpent: customer.totalSpent
        }
      );
    });

    // לקוח הגיע לאבן דרך
    systemEvents.onEvent('customer.milestone_reached', async (data) => {
      const { customer, milestone } = data;
      
      console.log('🎯 Processing customer.milestone_reached event:', {
        customer: customer.email,
        milestone
      });
      
      // TODO: שליחת מייל ברכות
      // TODO: הענקת קופון מיוחד
      
      // מעקב אנליטיקס
      await AnalyticsService.trackEvent(
        customer.storeId,
        'customer_milestone',
        {
          customerId: customer.id,
          milestone,
          ordersCount: customer.ordersCount
        }
      );
    });
  }

  /**
   * Event Handlers לאנליטיקס
   */
  static setupAnalyticsEventHandlers() {
    
    // מעקב שליחת מיילים
    systemEvents.onEvent('email.sent', async (data) => {
      const { type, recipient, orderId } = data;
      
      // מעקב אנליטיקס על שליחת מיילים
      // (אם יש storeId זמין)
      if (orderId) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          select: { storeId: true }
        });
        
        if (order) {
          await AnalyticsService.trackEvent(
            order.storeId,
            'email_sent',
            {
              emailType: type,
              recipient,
              orderId
            }
          );
        }
      }
    });
  }
}
