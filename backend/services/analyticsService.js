import prisma from '../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import cacheService, { CACHE_KEYS, CACHE_TTL } from './cacheService.js';

export class AnalyticsService {
  
  /**
   * מעקב אחר משתמש פעיל - יוצר או מעדכן session
   */
  static async trackActiveUser(storeId, sessionId = null, customerId = null, userAgent = null, ipAddress = null) {
    try {
      const sessionIdToUse = sessionId || uuidv4();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 דקות מעכשיו
      
      const session = await prisma.activeSession.upsert({
        where: { id: sessionIdToUse },
        update: {
          lastActivity: new Date(),
          expiresAt,
          customerId,
          userAgent,
          ipAddress
        },
        create: {
          id: sessionIdToUse,
          storeId,
          customerId,
          userAgent,
          ipAddress,
          lastActivity: new Date(),
          expiresAt
        }
      });
      
      return session;
    } catch (error) {
      console.error('Error tracking active user:', error);
      throw error;
    }
  }

  /**
   * מעקב אחר אירוע אנליטיקה
   */
  static async trackEvent(storeId, eventType, eventData = {}, sessionId = null, customerId = null, ipAddress = null, userAgent = null, referrer = null) {
    try {
      // שמירת האירוע בטבלת analytics_events הקיימת
      const event = await prisma.analyticsEvent.create({
        data: {
          storeId,
          eventType,
          eventData,
          sessionId,
          customerId,
          ipAddress,
          userAgent,
          referrer
        }
      });

      // עדכון נתונים בזמן אמת אם זה session פעיל
      if (sessionId) {
        await this.trackActiveUser(storeId, sessionId, customerId, userAgent, ipAddress);
      }

      // עדכון נתונים שעתיים ויומיים
      await this.updateHourlyAnalytics(storeId, eventType, eventData);
      await this.updateDailyAnalytics(storeId, eventType, eventData);

      return event;
    } catch (error) {
      console.error('Error tracking event:', error);
      throw error;
    }
  }

  /**
   * עדכון נתונים שעתיים
   */
  static async updateHourlyAnalytics(storeId, eventType, eventData = {}) {
    try {
      const now = new Date();
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const hour = now.getHours();

      const updateData = {};
      
      switch (eventType) {
        case 'page_view':
          updateData.pageViews = { increment: 1 };
          break;
        case 'session_start':
          updateData.newSessions = { increment: 1 };
          break;
        case 'order_completed':
          updateData.orders = { increment: 1 };
          if (eventData.revenue) {
            updateData.revenue = { increment: parseFloat(eventData.revenue) };
          }
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.hourlyAnalytics.upsert({
          where: {
            storeId_date_hour: { storeId, date, hour }
          },
          update: updateData,
          create: {
            storeId,
            date,
            hour,
            ...Object.fromEntries(
              Object.entries(updateData).map(([key, value]) => [
                key, 
                typeof value === 'object' && value.increment ? value.increment : value
              ])
            )
          }
        });
      }
    } catch (error) {
      console.error('Error updating hourly analytics:', error);
    }
  }

  /**
   * עדכון נתונים יומיים
   */
  static async updateDailyAnalytics(storeId, eventType, eventData = {}) {
    try {
      const now = new Date();
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const updateData = {};
      
      switch (eventType) {
        case 'page_view':
          updateData.pageViews = { increment: 1 };
          break;
        case 'session_start':
          updateData.sessions = { increment: 1 };
          updateData.uniqueVisitors = { increment: 1 }; // נניח שכל session חדש = מבקר חדש
          break;
        case 'order_completed':
          updateData.orders = { increment: 1 };
          if (eventData.revenue) {
            updateData.revenue = { increment: parseFloat(eventData.revenue) };
          }
          break;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.dailyAnalytics.upsert({
          where: {
            storeId_date: { storeId, date }
          },
          update: updateData,
          create: {
            storeId,
            date,
            ...Object.fromEntries(
              Object.entries(updateData).map(([key, value]) => [
                key, 
                typeof value === 'object' && value.increment ? value.increment : value
              ])
            ),
            // ערכי ברירת מחדל לשדות שלא עודכנו
            uniqueVisitors: updateData.uniqueVisitors?.increment || 0,
            pageViews: updateData.pageViews?.increment || 0,
            sessions: updateData.sessions?.increment || 0,
            orders: updateData.orders?.increment || 0,
            revenue: updateData.revenue?.increment || 0,
            conversionRate: 0,
            avgSessionDuration: 0,
            bounceRate: 0
          }
        });
      }
    } catch (error) {
      console.error('Error updating daily analytics:', error);
    }
  }

  /**
   * קבלת משתמשים פעילים בזמן אמת (10 דקות האחרונות)
   */
  static async getActiveUsers(storeId) {
    const cacheKey = cacheService.buildKey(CACHE_KEYS.ACTIVE_USERS, storeId);
    
    return await cacheService.cached(cacheKey, async () => {
      try {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        
        const activeUsers = await prisma.activeSession.count({
          where: {
            storeId,
            lastActivity: {
              gte: tenMinutesAgo
            },
            expiresAt: {
              gt: new Date()
            }
          }
        });

        return activeUsers;
      } catch (error) {
        console.error('Error getting active users:', error);
        return 0;
      }
    }, CACHE_TTL.REAL_TIME);
  }

  /**
   * קבלת נתונים בזמן אמת
   */
  static async getRealTimeData(storeId) {
    const cacheKey = cacheService.buildKey(CACHE_KEYS.REAL_TIME_DATA, storeId);
    
    return await cacheService.cached(cacheKey, async () => {
      try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const currentHour = now.getHours();

        // משתמשים פעילים
        const activeUsers = await this.getActiveUsers(storeId);

        // נתונים של השעה הנוכחית
        const currentHourData = await prisma.hourlyAnalytics.findUnique({
          where: {
            storeId_date_hour: { storeId, date: today, hour: currentHour }
          }
        });

        // נתונים של היום
        const todayData = await prisma.dailyAnalytics.findUnique({
          where: {
            storeId_date: { storeId, date: today }
          }
        });

        // אירועים אחרונים (30 דקות אחרונות)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const recentEvents = await prisma.analyticsEvent.count({
          where: {
            storeId,
            createdAt: {
              gte: thirtyMinutesAgo
            }
          }
        });

        return {
          activeUsers,
          currentHour: {
            pageViews: currentHourData?.pageViews || 0,
            newSessions: currentHourData?.newSessions || 0,
            orders: currentHourData?.orders || 0,
            revenue: currentHourData?.revenue || 0
          },
          today: {
            uniqueVisitors: todayData?.uniqueVisitors || 0,
            pageViews: todayData?.pageViews || 0,
            sessions: todayData?.sessions || 0,
            orders: todayData?.orders || 0,
            revenue: todayData?.revenue || 0,
            conversionRate: todayData?.conversionRate || 0
          },
          recentActivity: recentEvents
        };
      } catch (error) {
        console.error('Error getting real-time data:', error);
        throw error;
      }
    }, CACHE_TTL.REAL_TIME);
  }

  /**
   * קבלת נתונים היסטוריים
   */
  static async getHistoricalData(storeId, startDate, endDate, period = 'daily') {
    const cacheKey = cacheService.buildKey(
      period === 'daily' ? CACHE_KEYS.DAILY_ANALYTICS : CACHE_KEYS.HOURLY_ANALYTICS,
      storeId,
      startDate,
      endDate
    );
    
    return await cacheService.cached(cacheKey, async () => {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (period === 'daily') {
          const data = await prisma.dailyAnalytics.findMany({
            where: {
              storeId,
              date: {
                gte: start,
                lte: end
              }
            },
            orderBy: {
              date: 'asc'
            }
          });

          return data;
        } else if (period === 'hourly') {
          const data = await prisma.hourlyAnalytics.findMany({
            where: {
              storeId,
              date: {
                gte: start,
                lte: end
              }
            },
            orderBy: [
              { date: 'asc' },
              { hour: 'asc' }
            ]
          });

          return data;
        }
      } catch (error) {
        console.error('Error getting historical data:', error);
        throw error;
      }
    }, CACHE_TTL.MEDIUM);
  }

  /**
   * צבירת נתונים יומיים - יופעל בcron job
   */
  static async aggregateDailyData(storeId, date = null) {
    try {
      const targetDate = date ? new Date(date) : new Date();
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

      // צבירת נתונים מהאירועים
      const events = await prisma.analyticsEvent.findMany({
        where: {
          storeId,
          createdAt: {
            gte: startOfDay,
            lt: endOfDay
          }
        }
      });

      // חישוב מטריקות
      const uniqueVisitors = new Set(events.map(e => e.sessionId || e.ipAddress)).size;
      const pageViews = events.filter(e => e.eventType === 'page_view').length;
      const sessions = new Set(events.map(e => e.sessionId).filter(Boolean)).size;
      const orders = events.filter(e => e.eventType === 'order_completed').length;
      const revenue = events
        .filter(e => e.eventType === 'order_completed')
        .reduce((sum, e) => sum + (parseFloat(e.eventData?.revenue) || 0), 0);

      const conversionRate = sessions > 0 ? (orders / sessions) * 100 : 0;

      // שמירת הנתונים
      await prisma.dailyAnalytics.upsert({
        where: {
          storeId_date: { storeId, date: startOfDay }
        },
        update: {
          uniqueVisitors,
          pageViews,
          sessions,
          orders,
          revenue,
          conversionRate
        },
        create: {
          storeId,
          date: startOfDay,
          uniqueVisitors,
          pageViews,
          sessions,
          orders,
          revenue,
          conversionRate
        }
      });

      // ניקוי cache רלוונטי לאחר עדכון הנתונים
      this.clearCacheForStore(storeId);

      return { uniqueVisitors, pageViews, sessions, orders, revenue, conversionRate };
    } catch (error) {
      console.error('Error aggregating daily data:', error);
      throw error;
    }
  }

  /**
   * ניקוי sessions פגי תוקף
   */
  static async cleanupExpiredSessions() {
    try {
      const result = await prisma.activeSession.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      console.log(`Cleaned up ${result.count} expired sessions`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      throw error;
    }
  }

  /**
   * ניקוי cache לחנות ספציפית
   */
  static clearCacheForStore(storeId) {
    const keysToDelete = [
      cacheService.buildKey(CACHE_KEYS.REAL_TIME_DATA, storeId),
      cacheService.buildKey(CACHE_KEYS.ACTIVE_USERS, storeId),
      cacheService.buildKey(CACHE_KEYS.DASHBOARD_DATA, storeId)
    ];

    keysToDelete.forEach(key => {
      cacheService.delete(key);
    });

    console.log(`🧹 Cleared cache for store ${storeId}`);
  }

  /**
   * ניקוי כל ה-cache
   */
  static clearAllCache() {
    cacheService.clear();
    console.log('🧹 Cleared all analytics cache');
  }
}

export default AnalyticsService;
