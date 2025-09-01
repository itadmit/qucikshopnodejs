import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Unified Authentication Middleware
 * מטפל בכל סוגי האימות באפליקציה
 */

// בדיקת טוקן JWT בסיסית
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    console.log('🔐 Auth middleware hit:', { 
      method: req.method, 
      url: req.url.split('?')[0] 
    });

    const decoded = jwt.verify(token, config.jwt.secret);
    console.log('🔓 Token decoded:', { userId: decoded.userId });
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.name + ':', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Please login again'
      });
    }
    
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error'
    });
  }
};

// אימות משתמש מלא (כולל בדיקת קיום במסד נתונים)
export const authenticateUser = async (req, res, next) => {
  try {
    // קודם נבדוק את הטוקן
    await new Promise((resolve, reject) => {
      verifyToken(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // עכשיו נבדוק שהמשתמש קיים במסד הנתונים
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        planType: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        stores: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'Please login again'
      });
    }

    console.log('✅ User authenticated:', { id: user.id, email: user.email });
    
    req.authenticatedUser = user;
    next();
  } catch (error) {
    console.error('❌ User authentication error:', error.message);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Failed to authenticate user'
    });
  }
};

// בדיקת מנוי פעיל
export const requireActiveSubscription = (req, res, next) => {
  const user = req.authenticatedUser;
  
  if (!user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please login first'
    });
  }

  // בדיקת סטטוס מנוי
  if (user.subscriptionStatus === 'ACTIVE') {
    return next();
  }

  // בדיקת תקופת ניסיון
  if (user.subscriptionStatus === 'TRIAL' && user.trialEndsAt) {
    const now = new Date();
    const trialEnd = new Date(user.trialEndsAt);
    
    if (now <= trialEnd) {
      return next();
    }
  }

  return res.status(402).json({
    error: 'Active subscription required',
    message: 'Your trial has expired or subscription is inactive'
  });
};

// זיהוי החנות הנוכחית מהדומיין או מהפרמטרים
export const identifyCurrentStore = async (req, res, next) => {
  try {
    const user = req.authenticatedUser;
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please login first'
      });
    }

    let storeSlug = null;
    let storeId = null;

    // 1. ניסיון לזהות מהדומיין (סאב-דומיין)
    const host = req.get('host') || '';
    if (host.includes('.localhost:') || host.includes('.my-quickshop.com')) {
      const parts = host.split('.');
      if (parts.length >= 2 && parts[0] !== 'api' && parts[0] !== 'www') {
        storeSlug = parts[0];
      }
    }

    // 2. אם לא נמצא בדומיין, ננסה מהפרמטרים
    if (!storeSlug) {
      storeSlug = req.params.storeSlug || req.body.storeSlug || req.query.storeSlug;
      storeId = req.params.storeId || req.body.storeId || req.query.storeId;
    }

    // 3. חיפוש החנות במסד הנתונים
    let store = null;
    
    if (storeSlug) {
      store = user.stores.find(s => s.slug === storeSlug);
    } else if (storeId) {
      store = user.stores.find(s => s.id === parseInt(storeId));
    }

    // 4. אם לא נמצאה חנות ספציפית, ניקח את הראשונה הפעילה
    if (!store) {
      store = user.stores.find(s => s.isActive);
    }

    if (!store) {
      return res.status(404).json({
        error: 'No store found',
        message: 'לא נמצאה חנות פעילה עבור המשתמש'
      });
    }

    // בדיקת הרשאות - המשתמש יכול לגשת רק לחנויות שלו
    const hasAccess = user.stores.some(s => s.id === store.id);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'אין לך הרשאה לגשת לחנות זו'
      });
    }

    req.currentStore = store;
    req.storeId = store.id;
    next();
  } catch (error) {
    console.error('❌ Store identification error:', error.message);
    return res.status(500).json({
      error: 'Store identification error',
      message: 'Failed to identify current store'
    });
  }
};

// Middleware משולב לדשבורד (אימות + מנוי + זיהוי חנות)
export const requireDashboardAccess = [
  authenticateUser,
  requireActiveSubscription,
  identifyCurrentStore
];

// Middleware בסיסי לAPI (רק אימות)
export const requireAuth = authenticateUser;

// Middleware לפיצ'רים פרימיום
export const requirePremium = [
  authenticateUser,
  requireActiveSubscription,
  (req, res, next) => {
    const user = req.authenticatedUser;
    if (user.planType === 'BASIC') {
      return res.status(403).json({
        error: 'Premium feature',
        message: 'This feature requires a premium subscription'
      });
    }
    next();
  }
];

// Middleware לחנות (אימות + זיהוי חנות)
export const requireStoreAccess = [
  authenticateUser,
  identifyCurrentStore
];

export default {
  verifyToken,
  authenticateUser,
  requireActiveSubscription,
  identifyCurrentStore,
  requireDashboardAccess,
  requireAuth,
  requirePremium,
  requireStoreAccess
};
