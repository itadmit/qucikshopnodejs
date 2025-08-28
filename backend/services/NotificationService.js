import { PrismaClient } from '@prisma/client';
import systemEvents from './EventEmitter.js';
import { EmailService } from './EmailService.js';

const prisma = new PrismaClient();

/**
 * שירות התראות ומיילים
 * מטפל בשליחת התראות למשתמשים ומיילים ללקוחות
 */
export class NotificationService {

  /**
   * שליחת התראת הזמנה חדשה לבעל החנות
   */
  static async sendOrderNotificationToOwner(order) {
    try {
      // קבלת פרטי בעל החנות
      const store = await prisma.store.findUnique({
        where: { id: order.storeId },
        include: { user: true }
      });

      if (!store || !store.user) {
        console.warn('⚠️ Store or user not found for order notification');
        return;
      }

      // יצירת התראה במערכת
      await prisma.notification.create({
        data: {
          userId: store.userId,
          type: 'ORDER_RECEIVED',
          title: 'הזמנה חדשה התקבלה',
          message: `הזמנה מספר #${order.orderNumber} בסך ${order.totalAmount}₪ התקבלה מ${order.customerEmail || 'לקוח אורח'}`,
          actionUrl: `/dashboard/orders/${order.id}`,
          priority: 'HIGH',
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            customerEmail: order.customerEmail
          }
        }
      });

      console.log('✅ Order notification sent to store owner:', store.user.email);

      // TODO: שליחת מייל לבעל החנות
      // await this.sendEmailToStoreOwner(store.user.email, order);

    } catch (error) {
      console.error('❌ Error sending order notification to owner:', error);
    }
  }

  /**
   * שליחת מייל אישור הזמנה ללקוח
   */
  static async sendOrderConfirmationToCustomer(order) {
    try {
      if (!order.customerEmail) {
        console.log('ℹ️ No customer email for order confirmation');
        return;
      }

      console.log('📧 Sending order confirmation email to:', order.customerEmail);

      // שליחת מייל אמיתי דרך EmailService
      const success = await EmailService.sendOrderConfirmation(order);

      if (success) {
        // הפעלת אירוע שליחת מייל
        systemEvents.emitEvent('email.sent', {
          type: 'order_confirmation',
          recipient: order.customerEmail,
          orderId: order.id
        });
      }

    } catch (error) {
      console.error('❌ Error sending order confirmation email:', error);
    }
  }

  /**
   * שליחת התראת מלאי נמוך
   */
  static async sendLowStockAlert(stockData) {
    try {
      // קבלת פרטי בעל החנות
      const store = await prisma.store.findUnique({
        where: { id: stockData.storeId },
        include: { user: true }
      });

      if (!store || !store.user) {
        return;
      }

      // יצירת התראה
      await prisma.notification.create({
        data: {
          userId: store.userId,
          type: 'LOW_STOCK',
          title: 'מלאי נמוך',
          message: `המוצר "${stockData.productName}" נותר במלאי: ${stockData.currentQuantity} יחידות`,
          actionUrl: `/dashboard/products/${stockData.productId}`,
          priority: 'NORMAL',
          metadata: {
            productId: stockData.productId,
            variantId: stockData.variantId,
            currentQuantity: stockData.currentQuantity,
            type: stockData.type
          }
        }
      });

      console.log('✅ Low stock alert sent for:', stockData.productName);

    } catch (error) {
      console.error('❌ Error sending low stock alert:', error);
    }
  }

  /**
   * שליחת התראת מלאי אפס
   */
  static async sendOutOfStockAlert(stockData) {
    try {
      // קבלת פרטי בעל החנות
      const store = await prisma.store.findUnique({
        where: { id: stockData.storeId },
        include: { user: true }
      });

      if (!store || !store.user) {
        return;
      }

      // יצירת התראה
      await prisma.notification.create({
        data: {
          userId: store.userId,
          type: 'OUT_OF_STOCK',
          title: 'מוצר אזל מהמלאי',
          message: `המוצר "${stockData.productName}" אזל מהמלאי`,
          actionUrl: `/dashboard/products/${stockData.productId}`,
          priority: 'HIGH',
          metadata: {
            productId: stockData.productId,
            type: stockData.type
          }
        }
      });

      console.log('✅ Out of stock alert sent for:', stockData.productName);

    } catch (error) {
      console.error('❌ Error sending out of stock alert:', error);
    }
  }

  /**
   * שליחת התראת עדכון סטטוס הזמנה ללקוח
   */
  static async sendOrderStatusUpdateToCustomer(order, previousStatus, newStatus) {
    try {
      if (!order.customerEmail) {
        return;
      }

      console.log('📧 Sending status update email to:', order.customerEmail);

      // שליחת מייל אמיתי דרך EmailService
      const success = await EmailService.sendOrderStatusUpdate(order, newStatus, previousStatus);

      if (success) {
        systemEvents.emitEvent('email.sent', {
          type: 'order_status_update',
          recipient: order.customerEmail,
          orderId: order.id
        });
      }

    } catch (error) {
      console.error('❌ Error sending status update email:', error);
    }
  }

  /**
   * שליחת התראת תשלום ללקוח
   */
  static async sendPaymentNotificationToCustomer(order, paymentStatus) {
    try {
      if (!order.customerEmail) {
        return;
      }

      const statusMessages = {
        'PAID': 'התשלום עבור ההזמנה אושר בהצלחה',
        'FAILED': 'התשלום עבור ההזמנה נכשל',
        'REFUNDED': 'התשלום עבור ההזמנה הוחזר'
      };

      const message = statusMessages[paymentStatus] || `סטטוס התשלום עודכן ל: ${paymentStatus}`;

      console.log('📧 Sending payment notification to:', order.customerEmail);

      // TODO: יישום שליחת מייל אמיתי
      const emailData = {
        to: order.customerEmail,
        subject: `עדכון תשלום - הזמנה #${order.orderNumber}`,
        template: 'payment-notification',
        data: {
          orderNumber: order.orderNumber,
          customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'לקוח יקר',
          paymentMessage: message,
          paymentStatus,
          totalAmount: order.totalAmount
        }
      };

      console.log('📧 Payment notification email would be sent:', emailData);

    } catch (error) {
      console.error('❌ Error sending payment notification:', error);
    }
  }

  /**
   * שליחת התראת לקוח חדש
   */
  static async sendNewCustomerNotification(customer) {
    try {
      // קבלת פרטי בעל החנות
      const store = await prisma.store.findUnique({
        where: { id: customer.storeId },
        include: { user: true }
      });

      if (!store || !store.user) {
        return;
      }

      // יצירת התראה
      await prisma.notification.create({
        data: {
          userId: store.userId,
          type: 'NEW_CUSTOMER',
          title: 'לקוח חדש נרשם',
          message: `לקוח חדש נרשם: ${customer.firstName} ${customer.lastName} (${customer.email})`,
          actionUrl: `/dashboard/customers/${customer.id}`,
          priority: 'NORMAL',
          metadata: {
            customerId: customer.id,
            customerEmail: customer.email
          }
        }
      });

      console.log('✅ New customer notification sent:', customer.email);

    } catch (error) {
      console.error('❌ Error sending new customer notification:', error);
    }
  }

  /**
   * מחיקת התראות ישנות (ניקוי תקופתי)
   */
  static async cleanupOldNotifications(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate
          },
          isRead: true // מוחק רק התראות שנקראו
        }
      });

      console.log(`🧹 Cleaned up ${result.count} old notifications`);
      return result.count;

    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
      return 0;
    }
  }
}
