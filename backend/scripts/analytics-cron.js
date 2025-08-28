import cron from 'node-cron';
import prisma from '../lib/prisma.js';
import AnalyticsService from '../services/analyticsService.js';

/**
 * Cron jobs לצבירת נתונים אנליטיקה
 */

// צבירת נתונים יומיים - רץ כל יום בחצות
cron.schedule('0 0 * * *', async () => {
  console.log('🔄 Starting daily analytics aggregation...');
  
  try {
    // קבלת כל החנויות הפעילות
    const activeStores = await prisma.store.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    console.log(`📊 Found ${activeStores.length} active stores to process`);

    // צבירת נתונים לכל חנות
    for (const store of activeStores) {
      try {
        console.log(`📈 Processing analytics for store: ${store.name} (${store.slug})`);
        
        // צבירת נתונים של אתמול
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const result = await AnalyticsService.aggregateDailyData(store.id, yesterday);
        
        console.log(`✅ Aggregated data for ${store.name}:`, {
          visitors: result.uniqueVisitors,
          pageViews: result.pageViews,
          orders: result.orders,
          revenue: result.revenue
        });
        
      } catch (error) {
        console.error(`❌ Error aggregating data for store ${store.name}:`, error);
      }
    }

    console.log('✅ Daily analytics aggregation completed');
    
  } catch (error) {
    console.error('❌ Error in daily analytics aggregation:', error);
  }
});

// ניקוי sessions פגי תוקף - רץ כל שעה
cron.schedule('0 * * * *', async () => {
  console.log('🧹 Cleaning up expired sessions...');
  
  try {
    const cleanedCount = await AnalyticsService.cleanupExpiredSessions();
    console.log(`✅ Cleaned up ${cleanedCount} expired sessions`);
  } catch (error) {
    console.error('❌ Error cleaning up expired sessions:', error);
  }
});

// צבירת נתונים שעתיים - רץ כל שעה ב-5 דקות
cron.schedule('5 * * * *', async () => {
  console.log('📊 Updating hourly analytics...');
  
  try {
    const activeStores = await prisma.store.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true
      }
    });

    for (const store of activeStores) {
      try {
        // עדכון משתמשים פעילים בשעה הנוכחית
        const now = new Date();
        const currentHour = now.getHours();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const activeUsers = await AnalyticsService.getActiveUsers(store.id);
        
        await prisma.hourlyAnalytics.upsert({
          where: {
            storeId_date_hour: {
              storeId: store.id,
              date: today,
              hour: currentHour
            }
          },
          update: {
            activeUsers
          },
          create: {
            storeId: store.id,
            date: today,
            hour: currentHour,
            activeUsers
          }
        });
        
      } catch (error) {
        console.error(`Error updating hourly analytics for store ${store.id}:`, error);
      }
    }
    
    console.log('✅ Hourly analytics updated');
    
  } catch (error) {
    console.error('❌ Error updating hourly analytics:', error);
  }
});

// דוח שבועי - רץ כל יום ראשון ב-6:00
cron.schedule('0 6 * * 0', async () => {
  console.log('📈 Generating weekly analytics report...');
  
  try {
    const activeStores = await prisma.store.findMany({
      where: {
        isActive: true
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    for (const store of activeStores) {
      try {
        // נתונים של השבוע האחרון
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const weeklyData = await AnalyticsService.getHistoricalData(
          store.id,
          startDate,
          endDate,
          'daily'
        );

        if (weeklyData && weeklyData.length > 0) {
          const totalVisitors = weeklyData.reduce((sum, day) => sum + day.uniqueVisitors, 0);
          const totalOrders = weeklyData.reduce((sum, day) => sum + day.orders, 0);
          const totalRevenue = weeklyData.reduce((sum, day) => sum + day.revenue, 0);
          
          console.log(`📊 Weekly report for ${store.name}:`, {
            visitors: totalVisitors,
            orders: totalOrders,
            revenue: totalRevenue
          });

          // כאן ניתן להוסיף שליחת דוח במייל
          // await sendWeeklyReport(store.user.email, {
          //   storeName: store.name,
          //   visitors: totalVisitors,
          //   orders: totalOrders,
          //   revenue: totalRevenue
          // });
        }
        
      } catch (error) {
        console.error(`Error generating weekly report for store ${store.name}:`, error);
      }
    }
    
    console.log('✅ Weekly analytics reports generated');
    
  } catch (error) {
    console.error('❌ Error generating weekly reports:', error);
  }
});

// ניקוי נתונים ישנים - רץ כל יום ב-2:00
cron.schedule('0 2 * * *', async () => {
  console.log('🗑️ Cleaning up old analytics data...');
  
  try {
    // מחיקת אירועים ישנים יותר מ-90 יום
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const deletedEvents = await prisma.analyticsEvent.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo
        }
      }
    });

    console.log(`🗑️ Deleted ${deletedEvents.count} old analytics events`);

    // מחיקת נתוני ביצועים ישנים יותר מ-30 יום
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deletedMetrics = await prisma.performanceMetric.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    console.log(`🗑️ Deleted ${deletedMetrics.count} old performance metrics`);
    
    console.log('✅ Old analytics data cleaned up');
    
  } catch (error) {
    console.error('❌ Error cleaning up old data:', error);
  }
});

console.log('🚀 Analytics cron jobs initialized');
console.log('📅 Scheduled jobs:');
console.log('  - Daily aggregation: Every day at midnight');
console.log('  - Session cleanup: Every hour');
console.log('  - Hourly updates: Every hour at 5 minutes past');
console.log('  - Weekly reports: Every Sunday at 6 AM');
console.log('  - Data cleanup: Every day at 2 AM');

export default {
  // פונקציה להפעלה ידנית של צבירת נתונים
  runDailyAggregation: async (storeId = null, date = null) => {
    console.log('🔄 Running manual daily aggregation...');
    
    try {
      if (storeId) {
        // צבירה לחנות ספציפית
        const result = await AnalyticsService.aggregateDailyData(storeId, date);
        console.log('✅ Manual aggregation completed:', result);
        return result;
      } else {
        // צבירה לכל החנויות
        const activeStores = await prisma.store.findMany({
          where: { isActive: true },
          select: { id: true, name: true }
        });

        const results = [];
        for (const store of activeStores) {
          const result = await AnalyticsService.aggregateDailyData(store.id, date);
          results.push({ storeId: store.id, storeName: store.name, ...result });
        }
        
        console.log('✅ Manual aggregation completed for all stores');
        return results;
      }
    } catch (error) {
      console.error('❌ Error in manual aggregation:', error);
      throw error;
    }
  }
};
