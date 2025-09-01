/**
import { getApiUrl } from './/environment.js';
 * הגדרות לפיתוח לוקאלי
 * קובץ זה מכיל הגדרות ספציפיות לפיתוח לוקאלי
 */

// זיהוי אם אנחנו בפיתוח לוקאלי
export const isLocalDevelopment = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  return (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' ||
    port === '5173' ||
    port === '5174' ||
    port === '5175'
  );
};

// הגדרות API לפיתוח לוקאלי
export const getApiConfig = () => {
  if (isLocalDevelopment()) {
    return {
      baseUrl: 'http://localhost:3001/api',
      timeout: 10000,
      retries: 3
    };
  }
  
  // פרודקשן
  return {
    baseUrl: getApiUrl(''),
    timeout: 15000,
    retries: 2
  };
};

// הגדרות debug לפיתוח לוקאלי
export const debugConfig = {
  enableLogs: isLocalDevelopment(),
  enableApiLogs: isLocalDevelopment(),
  enablePerformanceLogs: isLocalDevelopment(),
  enableErrorBoundary: true
};

// הגדרות features לפיתוח לוקאלי
export const featureFlags = {
  enableDevTools: isLocalDevelopment(),
  enableMockData: false, // שנה ל-true אם רוצה נתונים מדומים
  enableHotReload: isLocalDevelopment(),
  enableSourceMaps: isLocalDevelopment()
};

// פונקציית עזר ללוגים
export const devLog = (message, data = null) => {
  if (debugConfig.enableLogs) {
    console.log(`[DEV] ${message}`, data || '');
  }
};

// פונקציית עזר לשגיאות
export const devError = (message, error = null) => {
  if (debugConfig.enableLogs) {
    console.error(`[DEV ERROR] ${message}`, error || '');
  }
};

export default {
  isLocalDevelopment,
  getApiConfig,
  debugConfig,
  featureFlags,
  devLog,
  devError
};
