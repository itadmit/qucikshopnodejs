import api from '../services/api';
import pixelService from '../services/pixelService';

class AnalyticsTracker {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.storeId = null;
    this.customerId = null;
    this.isInitialized = false;
    this.eventQueue = [];
    this.isOnline = navigator.onLine;
    this.batchQueue = [];
    this.batchTimer = null;
    
    // האזנה לשינויים בחיבור לאינטרנט
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEventQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // יצירת session ID ייחודי
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // קבלת או יצירת session ID (נשמר ב-localStorage, משותף לכל הטאבים)
  getOrCreateSessionId() {
    const SESSION_KEY = 'analytics_session_id';
    const SESSION_EXPIRY_KEY = 'analytics_session_expiry';
    const BROWSER_SESSION_KEY = 'analytics_browser_session';
    
    // יצירת מזהה ייחודי לדפדפן (נשמר עד סגירת הדפדפן)
    let browserSessionId = sessionStorage.getItem(BROWSER_SESSION_KEY);
    if (!browserSessionId) {
      browserSessionId = 'browser_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem(BROWSER_SESSION_KEY, browserSessionId);
    }
    
    // בדיקה אם יש session קיים ותקף לדפדפן הזה
    const sessionKey = SESSION_KEY + '_' + browserSessionId;
    const expiryKey = SESSION_EXPIRY_KEY + '_' + browserSessionId;
    
    const existingSessionId = localStorage.getItem(sessionKey);
    const sessionExpiry = localStorage.getItem(expiryKey);
    
    if (existingSessionId && sessionExpiry && Date.now() < parseInt(sessionExpiry)) {
      // Session קיים ותקף - נאריך אותו ב-30 דקות
      const newExpiry = Date.now() + (30 * 60 * 1000);
      localStorage.setItem(expiryKey, newExpiry.toString());
      return existingSessionId;
    }
    
    // יצירת session חדש לדפדפן הזה
    const newSessionId = this.generateSessionId();
    const expiry = Date.now() + (30 * 60 * 1000); // 30 דקות
    
    localStorage.setItem(sessionKey, newSessionId);
    localStorage.setItem(expiryKey, expiry.toString());
    
    return newSessionId;
  }

  // אתחול המעקב
  async init(storeId, customerId = null, storeSettings = null) {
    this.storeId = storeId;
    this.customerId = customerId;
    
    // אתחול פיקסלים אם יש הגדרות
    if (storeSettings) {
      try {
        await pixelService.init(storeSettings);
      } catch (error) {
        console.error('Failed to initialize pixels:', error);
      }
    }
    
    this.isInitialized = true;
    
    // מעקב אחר תחילת session
    this.trackEvent('session_start');
    
    // מעקב אחר page views
    this.trackPageView();
    
    // מעקב אחר יציאה מהדף
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end');
    });
    
    // מעקב אחר פעילות המשתמש
    this.startActivityTracking();
  }

  // מעקב אחר אירוע (עם קיבוץ לחיסכון בעומס)
  async trackEvent(eventType, eventData = {}) {
    if (!this.isInitialized || !this.storeId) {
      console.warn('Analytics tracker not initialized');
      return;
    }

    const event = {
      storeId: Number(this.storeId),
      eventType,
      eventData,
      sessionId: this.sessionId,
      customerId: this.customerId ? Number(this.customerId) : null,
      timestamp: new Date().toISOString()
    };

    // הוספה לתור הקיבוץ
    this.batchQueue.push(event);

    // אירועים קריטיים נשלחים מיד
    const criticalEvents = ['order_completed', 'session_start', 'session_end'];
    if (criticalEvents.includes(eventType)) {
      await this.flushBatchQueue();
    } else {
      // אירועים רגילים נשלחים בקיבוץ כל 10 שניות
      this.scheduleBatchSend();
    }
  }

  // תזמון שליחה מקובצת
  scheduleBatchSend() {
    if (this.batchTimer) return; // כבר מתוזמן

    this.batchTimer = setTimeout(() => {
      this.flushBatchQueue();
    }, 10000); // 10 שניות
  }

  // שליחת כל האירועים בתור
  async flushBatchQueue() {
    if (this.batchQueue.length === 0) return;

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    const eventsToSend = [...this.batchQueue];
    this.batchQueue = [];

    if (this.isOnline) {
      try {
        // שליחה מקובצת של כל האירועים
        await api.post('/analytics/track-batch', { events: eventsToSend });
      } catch (error) {
        console.error('Failed to send batch events:', error);
        // החזרה לתור במקרה של שגיאה
        this.eventQueue.push(...eventsToSend);
      }
    } else {
      this.eventQueue.push(...eventsToSend);
    }
  }

  // שליחת אירוע לשרת
  async sendEvent(event) {
    try {
      await api.post('/analytics/track', event);
    } catch (error) {
      throw error;
    }
  }

  // שליחת כל האירועים בתור
  async flushEventQueue() {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    for (const event of eventsToSend) {
      try {
        await this.sendEvent(event);
      } catch (error) {
        console.error('Failed to send queued event:', error);
        this.eventQueue.push(event);
      }
    }
  }

  // מעקב אחר צפייה בדף
  trackPageView(page = window.location.pathname) {
    // מעקב פנימי
    this.trackEvent('page_view', {
      page,
      title: document.title,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timestamp: new Date().toISOString()
    });

    // מעקב פיקסלים
    pixelService.trackPageView(page, document.title);
  }

  // מעקב אחר צפייה במוצר
  trackProductView(productId, productName, category = null, price = null) {
    const productData = {
      id: productId,
      name: productName,
      category,
      price
    };

    // מעקב פנימי
    this.trackEvent('product_view', {
      productId,
      productName,
      category,
      price,
      page: window.location.pathname
    });

    // מעקב פיקסלים
    pixelService.trackViewContent(productData);
  }

  // מעקב אחר הוספה לעגלה
  trackAddToCart(productId, productName, quantity = 1, price = null, category = null) {
    const productData = {
      id: productId,
      name: productName,
      price,
      category
    };

    // מעקב פנימי
    this.trackEvent('add_to_cart', {
      productId,
      productName,
      quantity,
      price,
      totalValue: price ? price * quantity : null
    });

    // מעקב פיקסלים
    pixelService.trackAddToCart(productData, quantity);
  }

  // מעקב אחר הסרה מהעגלה
  trackRemoveFromCart(productId, productName, quantity = 1, price = null, category = null) {
    const productData = {
      id: productId,
      name: productName,
      price,
      category
    };

    // מעקב פנימי
    this.trackEvent('remove_from_cart', {
      productId,
      productName,
      quantity
    });

    // מעקב פיקסלים
    pixelService.trackRemoveFromCart(productData, quantity);
  }

  // מעקב אחר תחילת תהליך רכישה
  trackBeginCheckout(cartValue, itemCount, items = []) {
    const cartData = {
      value: cartValue,
      itemCount,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category || '',
        price: item.price || 0,
        quantity: item.quantity || 1
      }))
    };

    // מעקב פנימי
    this.trackEvent('begin_checkout', {
      cartValue,
      itemCount,
      currency: 'ILS'
    });

    // מעקב פיקסלים
    pixelService.trackBeginCheckout(cartData);
  }

  // מעקב אחר השלמת הזמנה
  trackPurchase(orderId, revenue, items = []) {
    const orderData = {
      orderId,
      revenue,
      items: items.map(item => ({
        productId: item.productId || item.id,
        productName: item.productName || item.name,
        category: item.category || '',
        price: item.price || 0,
        quantity: item.quantity || 1
      }))
    };

    // מעקב פנימי - השלמת הזמנה
    this.trackEvent('order_completed', {
      orderId,
      revenue,
      currency: 'ILS',
      items,
      itemCount: items.length,
      timestamp: new Date().toISOString()
    });

    // מעקב פנימי נוסף - conversion value
    this.trackEvent('conversion_value', {
      orderId,
      value: revenue,
      currency: 'ILS',
      conversionType: 'purchase'
    });

    // מעקב פיקסלים
    pixelService.trackPurchase(orderData);
  }

  // מעקב אחר צפייה בעמוד תודה
  trackThankYouPageView(orderId, orderValue) {
    this.trackEvent('thank_you_page_view', {
      orderId,
      orderValue,
      currency: 'ILS',
      page: '/thank-you'
    });
  }

  // מעקב אחר שיתוף הזמנה
  trackOrderShare(orderId, platform) {
    this.trackEvent('order_shared', {
      orderId,
      platform,
      shareSource: 'thank_you_page'
    });
  }

  // מעקב אחר חיפוש
  trackSearch(searchTerm, resultsCount = null) {
    // מעקב פנימי
    this.trackEvent('search', {
      searchTerm,
      resultsCount,
      page: window.location.pathname
    });

    // מעקב פיקסלים
    pixelService.trackSearch(searchTerm, resultsCount);
  }

  // מעקב אחר לחיצה על קישור חיצוני
  trackOutboundClick(url, linkText = null) {
    this.trackEvent('outbound_click', {
      url,
      linkText,
      page: window.location.pathname
    });
  }

  // מעקב אחר שגיאות JavaScript
  trackError(error, errorInfo = null) {
    this.trackEvent('javascript_error', {
      error: error.toString(),
      stack: error.stack,
      errorInfo,
      page: window.location.pathname,
      userAgent: navigator.userAgent
    });
  }

  // מעקב אחר פעילות המשתמש (heartbeat)
  startActivityTracking() {
    let lastActivity = Date.now();
    
    // עדכון זמן פעילות אחרונה
    const updateActivity = () => {
      lastActivity = Date.now();
    };

    // האזנה לאירועי פעילות
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // שליחת heartbeat כל דקה
    setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      
      // אם המשתמש פעיל ב-5 דקות האחרונות
      if (timeSinceLastActivity < 5 * 60 * 1000) {
        this.trackEvent('user_active', {
          sessionDuration: Date.now() - this.sessionStartTime,
          page: window.location.pathname
        });
      }
    }, 60000); // כל דקה

    this.sessionStartTime = Date.now();
  }

  // עדכון פרטי לקוח
  setCustomer(customerId) {
    this.customerId = customerId;
    this.trackEvent('customer_identified', {
      customerId
    });
  }

  // ניקוי session (למשל בהתנתקות)
  clearSession() {
    this.trackEvent('session_end');
    this.sessionId = this.generateSessionId();
    this.customerId = null;
  }

  // קבלת מידע על ה-session הנוכחי
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      storeId: Number(this.storeId),
      customerId: this.customerId ? Number(this.customerId) : null,
      isInitialized: this.isInitialized,
      queuedEvents: this.eventQueue.length
    };
  }
}

// יצירת instance יחיד
const analyticsTracker = new AnalyticsTracker();

// הוספת מעקב אחר שגיאות JavaScript גלובליות
window.addEventListener('error', (event) => {
  analyticsTracker.trackError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// הוספת מעקב אחר שגיאות Promise שלא נתפסו
window.addEventListener('unhandledrejection', (event) => {
  analyticsTracker.trackError(new Error('Unhandled Promise Rejection'), {
    reason: event.reason
  });
});

export default analyticsTracker;
