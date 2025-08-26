import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { User } from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireActiveSubscription = async (req, res, next) => {
  try {
    const isActive = await User.isSubscriptionActive(req.user.id);
    
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
    const userPlan = req.user.plan_type;
    
    // Pro plan has access to everything
    if (userPlan === 'pro') {
      return next();
    }
    
    // Basic plan only has access to basic features
    if (requiredPlan === 'basic' && userPlan === 'basic') {
      return next();
    }
    
    return res.status(403).json({
      error: 'Upgrade required',
      message: `This feature requires ${requiredPlan} plan or higher`
    });
  };
};
