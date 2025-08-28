import { PrismaClient } from '@prisma/client';
import systemEvents from './EventEmitter.js';

const prisma = new PrismaClient();

/**
 * שירות מרכזי לניהול הזמנות
 * מטפל בכל הלוגיקה העסקית של יצירת והזמנות
 */
export class OrderService {
  
  /**
   * יצירת הזמנה חדשה
   * @param {Object} orderData - נתוני ההזמנה
   * @param {number} orderData.storeId - מזהה החנות
   * @param {number} orderData.customerId - מזהה הלקוח (אופציונלי)
   * @param {Array} orderData.items - פריטי ההזמנה
   * @param {Object} orderData.customer - פרטי הלקוח
   * @param {Object} orderData.shipping - פרטי משלוח
   * @param {Object} orderData.billing - פרטי חיוב
   * @param {Array} orderData.coupons - קופונים מופעלים
   * @param {Array} orderData.discounts - הנחות אוטומטיות
   * @param {string} orderData.paymentMethod - אמצעי תשלום
   * @param {string} orderData.notes - הערות
   * @returns {Object} ההזמנה שנוצרה
   */
  static async createOrder(orderData) {
    console.log('🛍️ Creating new order:', { storeId: orderData.storeId });

    return await prisma.$transaction(async (tx) => {
      // 1. יצירת מספר הזמנה חדש לפי החנות
      const orderNumber = await this.generateOrderNumber(orderData.storeId, tx);

      // 2. חישוב סכומים
      const totals = this.calculateTotals(orderData.items, orderData.discounts);

      // 3. יצירת או מציאת לקוח
      const customer = await this.findOrCreateCustomer(orderData.customer, orderData.storeId, tx);

      // 4. יצירת ההזמנה
      const order = await tx.order.create({
        data: {
          storeId: orderData.storeId,
          customerId: customer?.id || null,
          orderNumber,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          fulfillmentStatus: 'UNFULFILLED',
          subtotal: totals.subtotal,
          taxAmount: totals.tax,
          shippingAmount: totals.shipping,
          discountAmount: totals.discount,
          totalAmount: totals.total,
          currency: orderData.currency || 'ILS',
          customerEmail: orderData.customer.email,
          customerPhone: orderData.customer.phone,
          billingAddress: orderData.billing,
          shippingAddress: orderData.shipping,
          notes: orderData.notes,
          couponCodes: orderData.coupons || null,
          appliedDiscounts: orderData.discounts || null,
          paymentMethod: orderData.paymentMethod,
          items: {
            create: orderData.items.map(item => ({
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: item.quantity,
              price: item.price,
              total: item.price * item.quantity,
              productName: item.name,
              productSku: item.sku,
              variantOptions: item.variantOptions || null
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true,
              variant: true
            }
          },
          customer: true,
          store: true
        }
      });

      // 5. הפעלת אירועים
      systemEvents.emitEvent('order.created', {
        order,
        items: orderData.items,
        coupons: orderData.coupons,
        discounts: orderData.discounts
      });

      console.log('✅ Order created successfully:', { 
        orderId: order.id, 
        orderNumber: order.orderNumber,
        total: order.totalAmount 
      });

      return order;
    });
  }

  /**
   * יצירת מספר הזמנה חדש לפי החנות
   */
  static async generateOrderNumber(storeId, tx = prisma) {
    // עדכון מונה ההזמנות בחנות
    const store = await tx.store.update({
      where: { id: storeId },
      data: {
        orderSequence: {
          increment: 1
        }
      }
    });

    return store.orderSequence;
  }

  /**
   * חישוב סכומים של ההזמנה
   */
  static calculateTotals(items, discounts = []) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = discounts.reduce((sum, discount) => sum + discount.amount, 0);
    const tax = 0; // לעדכן לפי הצורך
    const shipping = 0; // לעדכן לפי הצורך
    const total = subtotal + tax + shipping - discountAmount;

    return {
      subtotal,
      tax,
      shipping,
      discount: discountAmount,
      total
    };
  }

  /**
   * מציאת או יצירת לקוח
   */
  static async findOrCreateCustomer(customerData, storeId, tx = prisma) {
    if (!customerData.email) {
      return null; // הזמנת אורח
    }

    // חיפוש לקוח קיים
    let customer = await tx.customer.findFirst({
      where: {
        storeId,
        email: customerData.email
      }
    });

    // יצירת לקוח חדש אם לא קיים
    if (!customer) {
      customer = await tx.customer.create({
        data: {
          storeId,
          email: customerData.email,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          phone: customerData.phone
        }
      });

      // אירוע לקוח חדש
      systemEvents.emitEvent('customer.created', { customer });
    }

    return customer;
  }

  /**
   * עדכון סטטוס הזמנה
   */
  static async updateOrderStatus(orderId, status, userId) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: true,
        customer: true,
        store: true
      }
    });

    // הפעלת אירוע עדכון סטטוס
    systemEvents.emitEvent('order.status_updated', {
      order,
      previousStatus: order.status,
      newStatus: status,
      updatedBy: userId
    });

    return order;
  }

  /**
   * עדכון סטטוס תשלום
   */
  static async updatePaymentStatus(orderId, paymentStatus, paymentReference = null) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { 
        paymentStatus,
        paymentReference
      },
      include: {
        items: true,
        customer: true,
        store: true
      }
    });

    // הפעלת אירוע עדכון תשלום
    systemEvents.emitEvent('order.payment_updated', {
      order,
      paymentStatus,
      paymentReference
    });

    return order;
  }

  /**
   * קבלת הזמנה לפי מזהה
   */
  static async getOrderById(orderId) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                media: true
              }
            },
            variant: {
              include: {
                optionValues: {
                  include: {
                    option: true,
                    optionValue: true
                  }
                }
              }
            }
          }
        },
        customer: true,
        store: true,
        couponUsages: {
          include: {
            coupon: true
          }
        }
      }
    });
  }

  /**
   * קבלת הזמנות לפי חנות
   */
  static async getOrdersByStore(storeId, options = {}) {
    const { limit = 50, offset = 0, status = null } = options;
    
    const where = { storeId };
    if (status) {
      where.status = status;
    }

    return await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });
  }
}
