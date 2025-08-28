/**
 * שירות Cache פשוט לאנליטיקה
 * במקום Redis, נשתמש ב-memory cache פשוט
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttlMap = new Map();
    
    // ניקוי cache כל 5 דקות
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * שמירת ערך ב-cache
   */
  set(key, value, ttlSeconds = 300) { // ברירת מחדל: 5 דקות
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    
    this.cache.set(key, value);
    this.ttlMap.set(key, expiresAt);
    
    return true;
  }

  /**
   * קבלת ערך מה-cache
   */
  get(key) {
    const expiresAt = this.ttlMap.get(key);
    
    if (!expiresAt || Date.now() > expiresAt) {
      // המפתח פג תוקף
      this.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  /**
   * מחיקת מפתח מה-cache
   */
  delete(key) {
    this.cache.delete(key);
    this.ttlMap.delete(key);
    return true;
  }

  /**
   * בדיקה אם מפתח קיים ולא פג תוקף
   */
  has(key) {
    const expiresAt = this.ttlMap.get(key);
    
    if (!expiresAt || Date.now() > expiresAt) {
      this.delete(key);
      return false;
    }
    
    return this.cache.has(key);
  }

  /**
   * ניקוי מפתחות שפג תוקפם
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, expiresAt] of this.ttlMap.entries()) {
      if (now > expiresAt) {
        this.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleanedCount} expired keys`);
    }
  }

  /**
   * מחיקת כל ה-cache
   */
  clear() {
    this.cache.clear();
    this.ttlMap.clear();
    return true;
  }

  /**
   * קבלת סטטיסטיקות cache
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * פונקציה עוזרת לcaching של פונקציות
   */
  async cached(key, asyncFunction, ttlSeconds = 300) {
    // בדיקה אם הערך כבר קיים ב-cache
    const cachedValue = this.get(key);
    if (cachedValue !== null) {
      return cachedValue;
    }

    // הפעלת הפונקציה וshמירה ב-cache
    try {
      const result = await asyncFunction();
      this.set(key, result, ttlSeconds);
      return result;
    } catch (error) {
      console.error(`Error in cached function for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * יצירת מפתח cache מובנה
   */
  buildKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  }
}

// יצירת instance יחיד
const cacheService = new CacheService();

// מפתחות cache נפוצים
export const CACHE_KEYS = {
  REAL_TIME_DATA: 'realtime',
  DAILY_ANALYTICS: 'daily',
  HOURLY_ANALYTICS: 'hourly',
  ACTIVE_USERS: 'active_users',
  DASHBOARD_DATA: 'dashboard'
};

// זמני TTL נפוצים (בשניות)
export const CACHE_TTL = {
  REAL_TIME: 30,        // 30 שניות לנתונים בזמן אמת (הפחתת עומס)
  SHORT: 300,           // 5 דקות
  MEDIUM: 900,          // 15 דקות
  LONG: 3600,           // שעה
  DAILY: 86400          // יום
};

export default cacheService;
