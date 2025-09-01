// Environment Configuration
// מרכז את כל הגדרות הסביבה במקום אחד

// בדיקת סביבת פיתוח
const isDevelopment = () => {
  // בזמן build, אין window object, אז נסתמך על environment variables
  if (typeof window === 'undefined') {
    return import.meta.env.DEV || import.meta.env.MODE === 'development';
  }
  
  return (
    import.meta.env.DEV ||
    import.meta.env.MODE === 'development' ||
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.localhost')
  );
};

// הגדרות דומיין
export const DOMAIN_CONFIG = {
  // Development domains
  DEV_MAIN: 'localhost:5173',
  DEV_API: 'api.my-quickshop.com',
  DEV_STORE_PATTERN: '*.localhost:5173',

  // Production domains
  PROD_MAIN: 'my-quickshop.com',
  PROD_API: 'api.my-quickshop.com',
  PROD_STORE_PATTERN: '*.my-quickshop.com',
};

// הגדרות API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 
    `https://${DOMAIN_CONFIG.PROD_API}/api`,  // Always use production API
  
  TIMEOUT: 30000, // 30 שניות
};

// הגדרות כלליות
export const APP_CONFIG = {
  IS_DEVELOPMENT: isDevelopment(),
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  VERSION: '1.0.0',
};

// פונקציות עזר
export const getApiUrl = (endpoint = '') => {
  const baseUrl = API_CONFIG.BASE_URL;
  
  // Both development and production use the same pattern now
  return `${baseUrl}${endpoint}`;
};

// בדיקה אם זה חנות (סאב-דומיין)
export const isStoreSubdomain = () => {
  const hostname = window.location.hostname;
  
  if (isDevelopment()) {
    // בפיתוח: *.localhost
    return hostname !== 'localhost' && hostname.endsWith('.localhost');
  } else {
    // בפרודקשן: *.my-quickshop.com (לא api.my-quickshop.com)
    return hostname !== DOMAIN_CONFIG.PROD_MAIN && 
           hostname.endsWith('.my-quickshop.com') && 
           !hostname.startsWith('api.');
  }
};

// קבלת שם החנות מהסאב-דומיין
export const getStoreSlugFromDomain = () => {
  const hostname = window.location.hostname;
  
  if (isDevelopment()) {
    // yogevstore.localhost -> yogevstore
    return hostname.replace('.localhost', '');
  } else {
    // yogevstore.my-quickshop.com -> yogevstore
    return hostname.replace('.my-quickshop.com', '');
  }
};

// ייצוא ברירת מחדל
export default {
  API_CONFIG,
  DOMAIN_CONFIG,
  APP_CONFIG,
  getApiUrl,
  isDevelopment,
  isStoreSubdomain,
  getStoreSlugFromDomain,
};
