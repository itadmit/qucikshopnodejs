import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Store } from '../models/Store.js';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import { config } from '../config.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, storeName } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !storeName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['email', 'password', 'firstName', 'lastName', 'storeName']
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Generate store slug
    const storeSlug = Store.generateSlug(storeName);
    
    // Check if store slug is available
    const isSlugAvailable = await Store.isSlugAvailable(storeSlug);
    if (!isSlugAvailable) {
      return res.status(409).json({ 
        error: 'Store name not available',
        suggestion: `${storeSlug}-${Date.now()}`
      });
    }

    // Create user and store in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        phone
      });

      // Create store
      const store = await Store.create({
        userId: user.id,
        name: storeName,
        slug: storeSlug
      });

      return { user, store };
    });

    // Generate auth token
    const authResult = await User.authenticate(email, password);

    res.status(201).json({
      message: 'Registration successful',
      user: authResult.user,
      store: result.store,
      token: authResult.token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: error.message 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const result = await User.authenticate(email, password);
    
    if (!result) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Get user's store
    const store = await Store.findByUserId(result.user.id);

    res.json({
      message: 'Login successful',
      user: result.user,
      store,
      token: result.token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const store = await Store.findByUserId(user.id);
    
    // Remove sensitive data
    delete user.password_hash;
    
    res.json({
      user,
      store,
      subscription: {
        isActive: await User.isSubscriptionActive(user.id),
        isTrialExpired: await User.isTrialExpired(user.id),
        planType: user.plan_type,
        subscriptionStatus: user.subscription_status,
        trialEndsAt: user.trial_ends_at,
        subscriptionEndsAt: user.subscription_ends_at
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const userId = req.user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, phone }
    });

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Failed to update profile'
    });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    // Verify current password
    const user = await User.findById(userId);
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Current password is incorrect'
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, config.bcryptRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      error: 'Failed to change password'
    });
  }
});

// Demo login for development
router.post('/demo-login', async (req, res) => {
  try {
    // Login with demo user
    const result = await User.authenticate('demo@quickshop.co.il', 'demo123');
    
    if (!result) {
      return res.status(404).json({
        error: 'Demo user not found. Please run the seed script first.'
      });
    }

    // Get user's store
    const store = await Store.findByUserId(result.user.id);

    res.json({
      message: 'Demo login successful',
      user: result.user,
      store,
      token: result.token
    });

  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({
      error: 'Demo login failed',
      message: error.message
    });
  }
});

// Complete onboarding
router.post('/complete-onboarding', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { hasCompletedOnboarding: true }
    });

    res.json({ message: 'Onboarding completed successfully' });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      error: 'Failed to complete onboarding'
    });
  }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', authenticateToken, (req, res) => {
  // In a more sophisticated setup, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

export default router;
