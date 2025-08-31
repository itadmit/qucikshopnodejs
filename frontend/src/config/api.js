// הגדרות API מרכזיות לפרויקט QuickShop
// כל הגדרות ה-API צריכות להיות כאן כדי להבטיח עקביות

// הגדרת URL בסיס
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.my-quickshop.com/api';

// נתיבי API - כל הנתיבים מתחילים ללא /api כי זה כבר כלול ב-BASE_URL
export const API_ENDPOINTS = {
  // אימות
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    COMPLETE_ONBOARDING: '/auth/complete-onboarding',
    DEMO_LOGIN: '/auth/demo-login'
  },
  
  // דשבורד
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ORDERS: '/dashboard/recent-orders',
    ANALYTICS: '/dashboard/analytics'
  },
  
  // חנויות
  STORES: {
    LIST: '/stores',
    CREATE: '/stores',
    GET: (id) => `/stores/${id}`,
    UPDATE: (id) => `/stores/${id}`,
    DELETE: (id) => `/stores/${id}`,
    SETTINGS: (id) => `/stores/${id}/settings`,
    SECTIONS: (id) => `/stores/${id}/sections`
  },
  
  // מוצרים
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    GET: (id) => `/products/${id}`,
    UPDATE: (id) => `/products/${id}`,
    DELETE: (id) => `/products/${id}`,
    UPLOAD_IMAGE: '/products/upload-image'
  },
  
  // הזמנות
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    GET: (id) => `/orders/${id}`,
    UPDATE: (id) => `/orders/${id}`,
    DELETE: (id) => `/orders/${id}`,
    UPDATE_STATUS: (id) => `/orders/${id}/status`
  },
  
  // התראות
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read'
  },
  
  // משתמשי חנות
  STORE_USERS: {
    LIST: '/store-users',
    INVITE: '/store-users/invite',
    UPDATE_ROLE: (id) => `/store-users/${id}/role`,
    REMOVE: (id) => `/store-users/${id}`
  },
  
  // מדיה
  MEDIA: {
    UPLOAD: '/media/upload',
    DELETE: (id) => `/media/${id}`
  },
  
  // שדות מותאמים
  CUSTOM_FIELDS: {
    LIST: '/custom-fields',
    CREATE: '/custom-fields',
    UPDATE: (id) => `/custom-fields/${id}`,
    DELETE: (id) => `/custom-fields/${id}`
  },
  
  // אנליטיקס
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    SALES: '/analytics/sales',
    PRODUCTS: '/analytics/products',
    CUSTOMERS: '/analytics/customers'
  },
  
  // פיקסלים
  PIXELS: {
    LIST: '/pixels',
    CREATE: '/pixels',
    UPDATE: (id) => `/pixels/${id}`,
    DELETE: (id) => `/pixels/${id}`,
    TEST: (id) => `/pixels/${id}/test`
  },
  
  // שותפים
  PARTNERS: {
    REGISTER: '/partners/register',
    LOGIN: '/partners/login',
    DASHBOARD: '/partners/dashboard',
    COMMISSIONS: '/partners/commissions'
  },
  
  // משפיעים
  INFLUENCERS: {
    REGISTER: '/influencers/register',
    LOGIN: '/influencers/login',
    DASHBOARD: '/influencers/dashboard',
    CAMPAIGNS: '/influencers/campaigns'
  },
  
  // בריאות המערכת
  HEALTH: '/health'
};

// פונקציה לבניית URL מלא
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// פונקציה לבדיקת תקינות נתיב
export const validateEndpoint = (endpoint) => {
  if (!endpoint.startsWith('/')) {
    console.warn(`⚠️ נתיב API צריך להתחיל ב-/ : ${endpoint}`);
    return `/${endpoint}`;
  }
  
  if (endpoint.startsWith('/api/')) {
    console.warn(`⚠️ נתיב API לא צריך להתחיל ב-/api/ : ${endpoint}`);
    return endpoint.replace('/api/', '/');
  }
  
  return endpoint;
};

// הגדרות ברירת מחדל לבקשות
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// הגדרות timeout
export const REQUEST_TIMEOUT = 30000; // 30 שניות

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildApiUrl,
  validateEndpoint,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT
}; 