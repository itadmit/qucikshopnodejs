// Environment Configuration
// מרכז את כל הגדרות הסביבה במקום אחד

// בדיקת סביבת פיתוח
const isDevelopment = () => {
  return (
    import.meta.env.DEV ||
    import.meta.env.MODE === 'development' ||
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.localhost') ||
    window.location.port === '5173'
  );
};

// הגדרות דומיין
export const DOMAIN_CONFIG = {
  // Development domains
  DEV_MAIN: 'localhost:5173',
  DEV_API: '127.0.0.1:3001',
  DEV_STORE_PATTERN: '*.localhost:5173',

  // Production domains
  PROD_MAIN: 'my-quickshop.com',
  PROD_API: '3.64.187.151:3001',
  PROD_STORE_PATTERN: '*.my-quickshop.com',
};

// הגדרות API
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || (
    isDevelopment() 
      ? `http://${DOMAIN_CONFIG.DEV_API}/api`  // Development - direct to api.localhost:3001
      : `http://${DOMAIN_CONFIG.PROD_API}/api`    // Production - direct to EC2 server with /api prefix
  ),
  
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
  
  if (isDevelopment()) {
    // Development: http://api.localhost:3001/api + endpoint
    return `${baseUrl}${endpoint}`;
  } else {
    // Production: https://api.my-quickshop.com + endpoint (no /api prefix)
    return `${baseUrl}${endpoint}`;
  }
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
