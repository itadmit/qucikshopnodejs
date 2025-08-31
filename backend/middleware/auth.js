import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export const authenticateToken = async (req, res, next) => {
  console.log('🔐 Auth middleware hit:', { method: req.method, url: req.url });
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }



  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔓 Token decoded:', { userId: decoded.userId || decoded.id });
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        planType: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        hasCompletedOnboarding: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found for token');
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('✅ User authenticated:', { id: user.id, email: user.email });
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireActiveSubscription = async (req, res, next) => {
  try {
    const user = req.user;
    const now = new Date();
    
    // Check if subscription is active or trial is still valid
    const isActive = user.subscriptionStatus === 'ACTIVE' || 
                    (user.subscriptionStatus === 'TRIAL' && user.trialEndsAt && new Date(user.trialEndsAt) > now);
    
    if (!isActive) {
      return res.status(402).json({ 
        error: 'Active subscription required',
        message: 'Your trial has expired or subscription is inactive'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify subscription' });
  }
};

export const requirePlan = (requiredPlan) => {
  return (req, res, next) => {
    const userPlan = req.user.planType;
    
    // PRO plan has access to everything
    if (userPlan === 'PRO') {
      return next();
    }
    
    // BASIC plan only has access to basic features
    if (requiredPlan === 'BASIC' && userPlan === 'BASIC') {
      return next();
    }
    
    return res.status(403).json({
      error: 'Upgrade required',
      message: `This feature requires ${requiredPlan} plan or higher`
    });
  };
};
