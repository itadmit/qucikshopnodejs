import sgMail from '@sendgrid/mail';
import { PrismaClient } from '@prisma/client';
import systemEvents from './EventEmitter.js';

const prisma = new PrismaClient();

/**
 * שירות מיילים מרכזי עם SendGrid
 * מטפל בשליחת מיילים, ניהול תבניות ומעקב
 */
export class EmailService {
  
  constructor() {
    // הגדרת API Key של SendGrid
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      console.log('✅ SendGrid initialized');
    } else {
      console.warn('⚠️ SENDGRID_API_KEY not found in environment variables');
    }
  }

  /**
   * שליחת מייל בסיסי
   */
  static async sendEmail(emailData) {
    try {
      console.log('📧 Sending email to:', emailData.to);

      const msg = {
        to: emailData.to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@quickshop.co.il',
          name: emailData.fromName || 'QuickShop'
        },
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text || this.stripHtml(emailData.html),
        // הוספת metadata למעקב
        customArgs: {
          storeId: emailData.storeId?.toString(),
          emailType: emailData.type,
          orderId: emailData.orderId?.toString(),
          customerId: emailData.customerId?.toString()
        }
      };

      // הוספת attachments אם קיימים
      if (emailData.attachments && emailData.attachments.length > 0) {
        msg.attachments = emailData.attachments;
      }

      const result = await sgMail.send(msg);

      // שמירת לוג המייל
      await this.logEmail({
        storeId: emailData.storeId,
        to: emailData.to,
        subject: emailData.subject,
        type: emailData.type,
        status: 'sent',
        sendgridMessageId: result[0].headers['x-message-id'],
        orderId: emailData.orderId,
        customerId: emailData.customerId
      });

      console.log('✅ Email sent successfully');
      return result;

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      
      // שמירת לוג שגיאה
      await this.logEmail({
        storeId: emailData.storeId,
        to: emailData.to,
        subject: emailData.subject,
        type: emailData.type,
        status: 'failed',
        error: error.message,
        orderId: emailData.orderId,
        customerId: emailData.customerId
      });

      throw error;
    }
  }

  /**
   * שליחת מייל אישור הזמנה
   */
  static async sendOrderConfirmation(order) {
    try {
      const template = await this.getEmailTemplate('order_confirmation', order.storeId);
      const html = await this.renderTemplate(template, {
        customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'לקוח יקר',
        orderNumber: order.orderNumber,
        orderDate: new Date(order.createdAt).toLocaleDateString('he-IL'),
        orderTotal: order.totalAmount,
        currency: order.currency || 'ILS',
        items: order.items,
        shippingAddress: order.shippingAddress,
        billingAddress: order.billingAddress,
        storeName: order.store?.name || 'החנות שלנו',
        storeUrl: `https://${order.store?.domain || 'store.quickshop.co.il'}`
      });

      await this.sendEmail({
        to: order.customerEmail,
        subject: template.subject.replace('{{orderNumber}}', order.orderNumber),
        html,
        type: 'order_confirmation',
        storeId: order.storeId,
        orderId: order.id,
        customerId: order.customerId,
        fromName: order.store?.name || 'QuickShop'
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to send order confirmation:', error);
      return false;
    }
  }

  /**
   * שליחת מייל עדכון סטטוס הזמנה
   */
  static async sendOrderStatusUpdate(order, newStatus, previousStatus) {
    try {
      const template = await this.getEmailTemplate('order_status_update', order.storeId);
      
      const statusMessages = {
        'PROCESSING': 'ההזמנה שלך בטיפול',
        'SHIPPED': 'ההזמנה שלך נשלחה',
        'DELIVERED': 'ההזמנה שלך הגיעה ליעדה',
        'CANCELLED': 'ההזמנה שלך בוטלה',
        'REFUNDED': 'ההזמנה שלך הוחזרה'
      };

      const html = await this.renderTemplate(template, {
        customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'לקוח יקר',
        orderNumber: order.orderNumber,
        statusMessage: statusMessages[newStatus] || newStatus,
        newStatus,
        previousStatus,
        trackingNumber: order.trackingNumber,
        storeName: order.store?.name || 'החנות שלנו',
        storeUrl: `https://${order.store?.domain || 'store.quickshop.co.il'}`
      });

      await this.sendEmail({
        to: order.customerEmail,
        subject: template.subject.replace('{{orderNumber}}', order.orderNumber),
        html,
        type: 'order_status_update',
        storeId: order.storeId,
        orderId: order.id,
        customerId: order.customerId,
        fromName: order.store?.name || 'QuickShop'
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to send order status update:', error);
      return false;
    }
  }

  /**
   * שליחת מייל עגלה נטושה
   */
  static async sendAbandonedCart(cartData) {
    try {
      const template = await this.getEmailTemplate('abandoned_cart', cartData.storeId);
      
      const html = await this.renderTemplate(template, {
        customerName: cartData.customerName || 'לקוח יקר',
        items: cartData.items,
        cartTotal: cartData.total,
        currency: cartData.currency || 'ILS',
        cartUrl: `${cartData.storeUrl}/cart?restore=${cartData.cartId}`,
        storeName: cartData.storeName,
        storeUrl: cartData.storeUrl
      });

      await this.sendEmail({
        to: cartData.customerEmail,
        subject: template.subject,
        html,
        type: 'abandoned_cart',
        storeId: cartData.storeId,
        customerId: cartData.customerId,
        fromName: cartData.storeName || 'QuickShop'
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to send abandoned cart email:', error);
      return false;
    }
  }

  /**
   * שליחת מייל ברכות ללקוח חדש
   */
  static async sendWelcomeEmail(customer, store) {
    try {
      const template = await this.getEmailTemplate('welcome', store.id);
      
      const html = await this.renderTemplate(template, {
        customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'לקוח יקר',
        storeName: store.name,
        storeUrl: `https://${store.domain || 'store.quickshop.co.il'}`,
        customerEmail: customer.email
      });

      await this.sendEmail({
        to: customer.email,
        subject: template.subject,
        html,
        type: 'welcome',
        storeId: store.id,
        customerId: customer.id,
        fromName: store.name || 'QuickShop'
      });

      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * קבלת תבנית מייל
   */
  static async getEmailTemplate(type, storeId) {
    try {
      // חיפוש תבנית מותאמת לחנות
      let template = await prisma.emailTemplate.findFirst({
        where: {
          storeId: parseInt(storeId),
          type,
          isActive: true
        }
      });

      // אם לא נמצאה תבנית מותאמת, השתמש בברירת המחדל
      if (!template) {
        template = await this.getDefaultTemplate(type);
      }

      return template;
    } catch (error) {
      console.error('❌ Failed to get email template:', error);
      return await this.getDefaultTemplate(type);
    }
  }

  /**
   * קבלת תבנית ברירת מחדל
   */
  static async getDefaultTemplate(type) {
    const defaultTemplates = {
      order_confirmation: {
        subject: 'אישור הזמנה #{{orderNumber}}',
        htmlContent: this.getDefaultOrderConfirmationTemplate(),
        type: 'order_confirmation'
      },
      order_status_update: {
        subject: 'עדכון הזמנה #{{orderNumber}}',
        htmlContent: this.getDefaultStatusUpdateTemplate(),
        type: 'order_status_update'
      },
      abandoned_cart: {
        subject: 'שכחת משהו בעגלה? 🛒',
        htmlContent: this.getDefaultAbandonedCartTemplate(),
        type: 'abandoned_cart'
      },
      welcome: {
        subject: 'ברוכים הבאים ל{{storeName}}! 🎉',
        htmlContent: this.getDefaultWelcomeTemplate(),
        type: 'welcome'
      }
    };

    return defaultTemplates[type] || {
      subject: 'הודעה מ{{storeName}}',
      htmlContent: '<p>{{message}}</p>',
      type: 'generic'
    };
  }

  /**
   * רינדור תבנית עם משתנים
   */
  static async renderTemplate(template, variables) {
    let html = template.htmlContent || template.html;
    
    // החלפת משתנים בתבנית
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value || '');
    }

    // החלפת משתנים מורכבים (לולאות, תנאים)
    html = await this.processAdvancedTemplating(html, variables);

    return html;
  }

  /**
   * עיבוד תבניות מתקדמות (לולאות, תנאים)
   */
  static async processAdvancedTemplating(html, variables) {
    // עיבוד לולאת פריטים
    if (variables.items && Array.isArray(variables.items)) {
      const itemsRegex = /{{#each items}}(.*?){{\/each}}/gs;
      html = html.replace(itemsRegex, (match, itemTemplate) => {
        return variables.items.map(item => {
          let itemHtml = itemTemplate;
          itemHtml = itemHtml.replace(/{{name}}/g, item.productName || item.name || '');
          itemHtml = itemHtml.replace(/{{quantity}}/g, item.quantity || 1);
          itemHtml = itemHtml.replace(/{{price}}/g, item.price || 0);
          itemHtml = itemHtml.replace(/{{total}}/g, item.total || (item.price * item.quantity));
          return itemHtml;
        }).join('');
      });
    }

    // עיבוד תנאים
    const ifRegex = /{{#if (\w+)}}(.*?){{\/if}}/gs;
    html = html.replace(ifRegex, (match, condition, content) => {
      return variables[condition] ? content : '';
    });

    return html;
  }

  /**
   * שמירת לוג מייל
   */
  static async logEmail(logData) {
    try {
      await prisma.emailLog.create({
        data: {
          storeId: logData.storeId ? parseInt(logData.storeId) : null,
          to: logData.to,
          subject: logData.subject,
          type: logData.type,
          status: logData.status,
          sendgridMessageId: logData.sendgridMessageId,
          error: logData.error,
          orderId: logData.orderId ? parseInt(logData.orderId) : null,
          customerId: logData.customerId ? parseInt(logData.customerId) : null,
          sentAt: logData.status === 'sent' ? new Date() : null
        }
      });
    } catch (error) {
      console.error('❌ Failed to log email:', error);
    }
  }

  /**
   * הסרת HTML מטקסט
   */
  static stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * קבלת סטטיסטיקות מיילים
   */
  static async getEmailStats(storeId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [total, sent, failed, byType] = await Promise.all([
      prisma.emailLog.count({
        where: {
          storeId: parseInt(storeId),
          createdAt: { gte: since }
        }
      }),
      prisma.emailLog.count({
        where: {
          storeId: parseInt(storeId),
          status: 'sent',
          createdAt: { gte: since }
        }
      }),
      prisma.emailLog.count({
        where: {
          storeId: parseInt(storeId),
          status: 'failed',
          createdAt: { gte: since }
        }
      }),
      prisma.emailLog.groupBy({
        by: ['type'],
        where: {
          storeId: parseInt(storeId),
          createdAt: { gte: since }
        },
        _count: { id: true }
      })
    ]);

    return {
      total,
      sent,
      failed,
      successRate: total > 0 ? (sent / total * 100).toFixed(2) : 0,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.id;
        return acc;
      }, {})
    };
  }

  // תבניות ברירת מחדל
  static getDefaultOrderConfirmationTemplate() {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>אישור הזמנה</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { padding: 12px; text-align: right; border-bottom: 1px solid #eee; }
        .items-table th { background-color: #f8f9fa; font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; color: #28a745; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
        @media (max-width: 600px) { .container { width: 100% !important; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>תודה על ההזמנה! 🎉</h1>
            <p>הזמנה מספר #{{orderNumber}}</p>
        </div>
        
        <div class="content">
            <p>שלום {{customerName}},</p>
            <p>תודה שבחרת ב{{storeName}}! ההזמנה שלך התקבלה בהצלחה ואנחנו כבר מתחילים לעבד אותה.</p>
            
            <div class="order-details">
                <h3>פרטי ההזמנה</h3>
                <p><strong>מספר הזמנה:</strong> #{{orderNumber}}</p>
                <p><strong>תאריך הזמנה:</strong> {{orderDate}}</p>
                <p><strong>סכום כולל:</strong> {{orderTotal}} {{currency}}</p>
            </div>

            <h3>פריטים שהוזמנו</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>מוצר</th>
                        <th>כמות</th>
                        <th>מחיר</th>
                        <th>סה"כ</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each items}}
                    <tr>
                        <td>{{name}}</td>
                        <td>{{quantity}}</td>
                        <td>{{price}} ₪</td>
                        <td>{{total}} ₪</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>

            <div class="total">
                <p>סה"כ לתשלום: {{orderTotal}} {{currency}}</p>
            </div>

            {{#if shippingAddress}}
            <div class="order-details">
                <h3>כתובת משלוח</h3>
                <p>{{shippingAddress.firstName}} {{shippingAddress.lastName}}</p>
                <p>{{shippingAddress.address}}</p>
                <p>{{shippingAddress.city}} {{shippingAddress.postalCode}}</p>
            </div>
            {{/if}}
        </div>

        <div class="footer">
            <p>תודה שבחרת ב{{storeName}}</p>
            <p><a href="{{storeUrl}}">בקר באתר שלנו</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  static getDefaultStatusUpdateTemplate() {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>עדכון הזמנה</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .status-update { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>עדכון הזמנה 📦</h1>
            <p>הזמנה מספר #{{orderNumber}}</p>
        </div>
        
        <div class="content">
            <p>שלום {{customerName}},</p>
            
            <div class="status-update">
                <h2>{{statusMessage}}</h2>
                {{#if trackingNumber}}
                <p><strong>מספר מעקב:</strong> {{trackingNumber}}</p>
                {{/if}}
            </div>

            <p>תודה על הסבלנות ועל שבחרת ב{{storeName}}!</p>
        </div>

        <div class="footer">
            <p><a href="{{storeUrl}}">בקר באתר שלנו</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  static getDefaultAbandonedCartTemplate() {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>שכחת משהו בעגלה</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .cta-button { display: inline-block; background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>שכחת משהו בעגלה? 🛒</h1>
        </div>
        
        <div class="content">
            <p>שלום {{customerName}},</p>
            <p>שמנו לב שהשארת כמה פריטים מעניינים בעגלת הקניות שלך ב{{storeName}}.</p>
            
            <p>לא תרצה לפספס אותם!</p>
            
            <div style="text-align: center;">
                <a href="{{cartUrl}}" class="cta-button">חזור לעגלה ושלם עכשיו</a>
            </div>
            
            <p>אם יש לך שאלות, אנחנו כאן לעזור!</p>
        </div>

        <div class="footer">
            <p><a href="{{storeUrl}}">{{storeName}}</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  static getDefaultWelcomeTemplate() {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ברוכים הבאים</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .cta-button { display: inline-block; background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ברוכים הבאים! 🎉</h1>
        </div>
        
        <div class="content">
            <p>שלום {{customerName}},</p>
            <p>ברוכים הבאים ל{{storeName}}! אנחנו שמחים שהצטרפת אלינו.</p>
            
            <p>כעת תוכל ליהנות מ:</p>
            <ul>
                <li>מוצרים איכותיים במחירים מעולים</li>
                <li>משלוח מהיר ואמין</li>
                <li>שירות לקוחות מקצועי</li>
                <li>הצעות מיוחדות ללקוחות רשומים</li>
            </ul>
            
            <div style="text-align: center;">
                <a href="{{storeUrl}}" class="cta-button">התחל לקנות עכשיו</a>
            </div>
        </div>

        <div class="footer">
            <p>תודה שבחרת ב{{storeName}}</p>
            <p><a href="{{storeUrl}}">בקר באתר שלנו</a></p>
        </div>
    </div>
</body>
</html>`;
  }
}

// יצירת instance יחיד
const emailService = new EmailService();
export default emailService;
