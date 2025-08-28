import { PrismaClient } from '@prisma/client';
import systemEvents from './EventEmitter.js';

const prisma = new PrismaClient();

/**
 * שירות ניהול לקוחות
 * מטפל בעדכון סטטיסטיקות לקוחות ונתונים רלוונטיים
 */
export class CustomerService {

  /**
   * עדכון סטטיסטיקות לקוח לאחר הזמנה
   */
  static async updateCustomerStats(customerId, orderAmount) {
    if (!customerId) {
      return; // הזמנת אורח
    }

    try {
      console.log('👤 Updating customer stats:', { customerId, orderAmount });

      // עדכון סטטיסטיקות הלקוח
      const updatedCustomer = await prisma.customer.update({
        where: { id: customerId },
        data: {
          totalSpent: {
            increment: orderAmount
          },
          ordersCount: {
            increment: 1
          }
        }
      });

      console.log('✅ Customer stats updated:', {
        customerId,
        totalSpent: updatedCustomer.totalSpent,
        ordersCount: updatedCustomer.ordersCount
      });

      // בדיקה אם זה לקוח VIP (יותר מ-1000₪)
      if (updatedCustomer.totalSpent >= 1000) {
        systemEvents.emitEvent('customer.became_vip', {
          customer: updatedCustomer,
          milestone: 'vip_1000'
        });
      }

      // בדיקה אם זה הזמנה ה-10
      if (updatedCustomer.ordersCount === 10) {
        systemEvents.emitEvent('customer.milestone_reached', {
          customer: updatedCustomer,
          milestone: '10_orders'
        });
      }

      return updatedCustomer;

    } catch (error) {
      console.error('❌ Error updating customer stats:', error);
    }
  }

  /**
   * קבלת פרופיל לקוח מלא
   */
  static async getCustomerProfile(customerId) {
    return await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        addresses: true,
        couponUsages: {
          include: {
            coupon: true
          }
        }
      }
    });
  }

  /**
   * קבלת לקוחות מובילים לחנות
   */
  static async getTopCustomers(storeId, limit = 10) {
    return await prisma.customer.findMany({
      where: { storeId },
      orderBy: {
        totalSpent: 'desc'
      },
      take: limit,
      include: {
        orders: {
          select: {
            id: true,
            createdAt: true,
            totalAmount: true
          }
        }
      }
    });
  }

  /**
   * קבלת לקוחות חדשים (30 יום אחרונים)
   */
  static async getNewCustomers(storeId, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return await prisma.customer.findMany({
      where: {
        storeId,
        createdAt: {
          gte: since
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true
          }
        }
      }
    });
  }

  /**
   * חישוב Customer Lifetime Value (CLV)
   */
  static async calculateCustomerLTV(customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          where: {
            status: {
              not: 'CANCELLED'
            }
          },
          select: {
            totalAmount: true,
            createdAt: true
          }
        }
      }
    });

    if (!customer || customer.orders.length === 0) {
      return {
        ltv: 0,
        averageOrderValue: 0,
        orderFrequency: 0,
        customerLifespan: 0
      };
    }

    const totalRevenue = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalRevenue / customer.orders.length;
    
    // חישוב תדירות הזמנות (הזמנות לחודש)
    const firstOrder = new Date(Math.min(...customer.orders.map(o => new Date(o.createdAt))));
    const lastOrder = new Date(Math.max(...customer.orders.map(o => new Date(o.createdAt))));
    const lifespanMonths = Math.max(1, (lastOrder - firstOrder) / (1000 * 60 * 60 * 24 * 30));
    const orderFrequency = customer.orders.length / lifespanMonths;

    // הערכת תוחלת חיים (בחודשים) - נניח 24 חודשים כברירת מחדל
    const estimatedLifespan = Math.max(lifespanMonths, 24);
    
    const ltv = averageOrderValue * orderFrequency * estimatedLifespan;

    return {
      ltv: Math.round(ltv),
      averageOrderValue: Math.round(averageOrderValue),
      orderFrequency: Math.round(orderFrequency * 100) / 100,
      customerLifespan: Math.round(lifespanMonths * 10) / 10,
      totalOrders: customer.orders.length,
      totalSpent: totalRevenue
    };
  }

  /**
   * זיהוי לקוחות בסיכון (לא הזמינו זמן רב)
   */
  static async getAtRiskCustomers(storeId, daysThreshold = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

    // לקוחות שההזמנה האחרונה שלהם הייתה לפני יותר מ-X ימים
    const atRiskCustomers = await prisma.customer.findMany({
      where: {
        storeId,
        ordersCount: {
          gt: 0 // רק לקוחות שכבר הזמינו
        }
      },
      include: {
        orders: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    return atRiskCustomers.filter(customer => {
      const lastOrder = customer.orders[0];
      return lastOrder && new Date(lastOrder.createdAt) < cutoffDate;
    });
  }

  /**
   * סגמנטציה של לקוחות
   */
  static async segmentCustomers(storeId) {
    const customers = await prisma.customer.findMany({
      where: { storeId },
      include: {
        orders: {
          where: {
            status: {
              not: 'CANCELLED'
            }
          }
        }
      }
    });

    const segments = {
      vip: [], // יותר מ-1000₪
      regular: [], // 100-1000₪
      new: [], // פחות מ-100₪ או הזמנה אחת
      inactive: [] // לא הזמינו 90+ ימים
    };

    const now = new Date();
    const inactiveThreshold = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    customers.forEach(customer => {
      const lastOrderDate = customer.orders.length > 0 
        ? new Date(Math.max(...customer.orders.map(o => new Date(o.createdAt))))
        : null;

      // בדיקת לקוחות לא פעילים
      if (customer.orders.length > 0 && lastOrderDate < inactiveThreshold) {
        segments.inactive.push(customer);
        return;
      }

      // סגמנטציה לפי סכום הוצאה
      if (customer.totalSpent >= 1000) {
        segments.vip.push(customer);
      } else if (customer.totalSpent >= 100) {
        segments.regular.push(customer);
      } else {
        segments.new.push(customer);
      }
    });

    return {
      segments,
      summary: {
        total: customers.length,
        vip: segments.vip.length,
        regular: segments.regular.length,
        new: segments.new.length,
        inactive: segments.inactive.length
      }
    };
  }

  /**
   * עדכון תגיות לקוח
   */
  static async updateCustomerTags(customerId, tags) {
    return await prisma.customer.update({
      where: { id: customerId },
      data: { tags }
    });
  }

  /**
   * הוספת הערה ללקוח
   */
  static async addCustomerNote(customerId, note) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    const existingNotes = customer.notes || '';
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${note}`;
    const updatedNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;

    return await prisma.customer.update({
      where: { id: customerId },
      data: { notes: updatedNotes }
    });
  }
}
