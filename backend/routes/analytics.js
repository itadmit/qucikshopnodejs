import express from 'express';
import { requireAuth, requireActiveSubscription } from '../middleware/unified-auth.js';
import AnalyticsService from '../services/analyticsService.js';
import { Store } from '../models/Store.js';

const router = express.Router();

/**
 * מעקב אחר מספר אירועי אנליטיקה בבת אחת (אופטימיזציה)
 */
router.post('/track-batch', async (req, res) => {
  try {
    const { events } = req.body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        error: 'events array is required'
      });
    }

    const results = [];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const referrer = req.get('Referer');

    // עיבוד כל האירועים בבת אחת
    for (const eventData of events) {
      const { 
        storeId, 
        eventType, 
        eventData: data = {}, 
        sessionId, 
        customerId 
      } = eventData;

      if (!storeId || !eventType) {
        continue; // דלג על אירועים לא תקינים
      }

      try {
        const event = await AnalyticsService.trackEvent(
          storeId,
          eventType,
          data,
          sessionId,
          customerId,
          ipAddress,
          userAgent,
          referrer
        );

        results.push({
          success: true,
          eventId: Number(event.id)
        });
      } catch (error) {
        console.error('Error tracking batch event:', error);
        results.push({
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      processed: results.length,
      results
    });

  } catch (error) {
    console.error('Batch analytics tracking error:', error);
    res.status(500).json({
      error: 'Failed to track batch events',
      message: error.message
    });
  }
});

/**
 * מעקב אחר אירוע אנליטיקה יחיד
 */
router.post('/track', async (req, res) => {
  try {
    const { 
      storeId, 
      eventType, 
      eventData = {}, 
      sessionId, 
      customerId 
    } = req.body;

    // קבלת מידע נוסף מה-request
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const referrer = req.get('Referer');

    if (!storeId || !eventType) {
      return res.status(400).json({
        error: 'storeId and eventType are required'
      });
    }

    const event = await AnalyticsService.trackEvent(
      storeId,
      eventType,
      eventData,
      sessionId,
      customerId,
      ipAddress,
      userAgent,
      referrer
    );

    res.json({
      success: true,
      event: {
        id: Number(event.id), // המרה ל-Number כדי למנוע בעיות BigInt
        sessionId: event.sessionId
      }
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({
      error: 'Failed to track event',
      message: error.message
    });
  }
});

/**
 * קבלת נתונים בזמן אמת
 */
router.get('/realtime/:storeId', requireAuth, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.authenticatedUser.id;

    // בדיקה שהמשתמש הוא בעל החנות
    const store = await Store.findById(parseInt(storeId));
    if (!store || store.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied to this store'
      });
    }

    const realTimeData = await AnalyticsService.getRealTimeData(parseInt(storeId));

    res.json({
      success: true,
      data: realTimeData
    });

  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch real-time data',
      message: error.message
    });
  }
});

/**
 * קבלת נתונים היסטוריים
 */
router.get('/historical/:storeId', requireAuth, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { startDate, endDate, period = 'daily' } = req.query;
    const userId = req.authenticatedUser.id;

    // בדיקה שהמשתמש הוא בעל החנות
    const store = await Store.findById(parseInt(storeId));
    if (!store || store.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied to this store'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required'
      });
    }

    const historicalData = await AnalyticsService.getHistoricalData(
      parseInt(storeId),
      startDate,
      endDate,
      period
    );

    res.json({
      success: true,
      data: historicalData,
      period
    });

  } catch (error) {
    console.error('Historical analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch historical data',
      message: error.message
    });
  }
});

/**
 * קבלת סיכום נתונים לדאשבורד
 */
router.get('/dashboard/:storeId', requireAuth, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.authenticatedUser.id;

    // בדיקה שהמשתמש הוא בעל החנות
    const store = await Store.findById(parseInt(storeId));
    if (!store || store.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied to this store'
      });
    }

    // נתונים בזמן אמת
    const realTimeData = await AnalyticsService.getRealTimeData(parseInt(storeId));

    // נתונים של השבוע האחרון
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyData = await AnalyticsService.getHistoricalData(
      parseInt(storeId),
      startDate,
      endDate,
      'daily'
    );

    // חישוב מגמות
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const today = realTimeData.today;
    const yesterday = weeklyData.length >= 2 ? weeklyData[weeklyData.length - 2] : null;

    const growth = yesterday ? {
      visitors: calculateGrowth(today.uniqueVisitors, yesterday.uniqueVisitors),
      pageViews: calculateGrowth(today.pageViews, yesterday.pageViews),
      orders: calculateGrowth(today.orders, yesterday.orders),
      revenue: calculateGrowth(today.revenue, yesterday.revenue)
    } : {
      visitors: 0,
      pageViews: 0,
      orders: 0,
      revenue: 0
    };

    res.json({
      success: true,
      data: {
        realTime: realTimeData,
        weekly: weeklyData,
        growth,
        summary: {
          totalVisitors: weeklyData.reduce((sum, day) => sum + day.uniqueVisitors, 0),
          totalPageViews: weeklyData.reduce((sum, day) => sum + day.pageViews, 0),
          totalOrders: weeklyData.reduce((sum, day) => sum + day.orders, 0),
          totalRevenue: weeklyData.reduce((sum, day) => sum + day.revenue, 0),
          avgConversionRate: weeklyData.length > 0 
            ? weeklyData.reduce((sum, day) => sum + day.conversionRate, 0) / weeklyData.length 
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});

/**
 * הפעלה ידנית של צבירת נתונים יומיים
 */
router.post('/aggregate/:storeId', requireAuth, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { date } = req.body;
    const userId = req.authenticatedUser.id;

    // בדיקה שהמשתמש הוא בעל החנות
    const store = await Store.findById(parseInt(storeId));
    if (!store || store.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied to this store'
      });
    }

    const result = await AnalyticsService.aggregateDailyData(parseInt(storeId), date);

    res.json({
      success: true,
      message: 'Daily data aggregated successfully',
      data: result
    });

  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).json({
      error: 'Failed to aggregate data',
      message: error.message
    });
  }
});

/**
 * ניקוי sessions פגי תוקף
 */
router.post('/cleanup', requireAuth, async (req, res) => {
  try {
    const cleanedCount = await AnalyticsService.cleanupExpiredSessions();

    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired sessions`
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      error: 'Failed to cleanup sessions',
      message: error.message
    });
  }
});

export default router;
