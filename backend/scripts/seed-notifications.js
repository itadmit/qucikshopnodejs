import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNotifications() {
  console.log('🔔 Starting to seed notifications...');

  try {
    // Find the demo user
    const demoUser = await prisma.user.findFirst({
      where: {
        email: 'demo@quickshop.com'
      }
    });

    if (!demoUser) {
      console.log('❌ Demo user not found. Please run seed-stores.js first.');
      return;
    }

    // Create sample notifications
    const notifications = [
      {
        userId: demoUser.id,
        type: 'ORDER_RECEIVED',
        title: 'הזמנה חדשה התקבלה!',
        message: 'קיבלת הזמנה חדשה מהלקוח יוסי כהן בסכום של ₪299',
        actionUrl: '/dashboard/orders/1',
        priority: 'HIGH',
        metadata: {
          orderId: 1,
          customerName: 'יוסי כהן',
          amount: 299
        }
      },
      {
        userId: demoUser.id,
        type: 'LOW_STOCK',
        title: 'מלאי נמוך!',
        message: 'המוצר "אוזניות אלחוטיות מקצועיות" נמצא במלאי נמוך (נותרו 3 יחידות)',
        actionUrl: '/dashboard/products/1',
        priority: 'NORMAL',
        metadata: {
          productId: 1,
          productName: 'אוזניות אלחוטיות מקצועיות',
          currentStock: 3
        }
      },
      {
        userId: demoUser.id,
        type: 'NEW_CUSTOMER',
        title: 'לקוח חדש נרשם!',
        message: 'הלקוח שרה לוי נרשמה לחנות שלך',
        actionUrl: '/dashboard/customers',
        priority: 'LOW',
        metadata: {
          customerName: 'שרה לוי',
          customerEmail: 'sarah@example.com'
        }
      },
      {
        userId: demoUser.id,
        type: 'TRIAL_ENDING',
        title: 'תקופת הניסיון מסתיימת בקרוב',
        message: 'תקופת הניסיון שלך מסתיימת בעוד 3 ימים. שדרג עכשיו כדי להמשיך ליהנות מכל התכונות',
        actionUrl: '/dashboard/billing',
        priority: 'HIGH',
        metadata: {
          daysLeft: 3,
          planType: 'TRIAL'
        }
      },
      {
        userId: demoUser.id,
        type: 'PAYMENT_RECEIVED',
        title: 'תשלום התקבל בהצלחה',
        message: 'התקבל תשלום בסכום ₪450 עבור הזמנה #1001',
        actionUrl: '/dashboard/orders/1001',
        priority: 'NORMAL',
        metadata: {
          orderId: 1001,
          amount: 450,
          paymentMethod: 'credit_card'
        }
      },
      {
        userId: demoUser.id,
        type: 'SYSTEM_UPDATE',
        title: 'עדכון מערכת זמין',
        message: 'גרסה חדשה של QuickShop זמינה עם תכונות חדשות ושיפורי ביצועים',
        actionUrl: '/dashboard/updates',
        priority: 'LOW',
        metadata: {
          version: '2.1.0',
          features: ['Page Builder משופר', 'דוחות אנליטיקה חדשים']
        }
      }
    ];

    // Create notifications
    for (const notification of notifications) {
      const created = await prisma.notification.create({
        data: notification
      });
      console.log(`✅ Notification created: ${created.title}`);
    }

    // Mark some notifications as read (to show variety)
    await prisma.notification.updateMany({
      where: {
        userId: demoUser.id,
        type: {
          in: ['PAYMENT_RECEIVED', 'SYSTEM_UPDATE']
        }
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    console.log('🎉 Notifications seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedNotifications();
