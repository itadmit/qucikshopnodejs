import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireActiveSubscription } from '../middleware/unified-auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Get user notifications
router.get('/', requireAuth, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    const { limit = 10, unreadOnly = false } = req.query;
    
    const where = { userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }
    
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notifications',
      message: error.message 
    });
  }
});

// Get unread notifications count
router.get('/unread-count', requireAuth, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch unread count',
      message: error.message 
    });
  }
});

// Mark notification as read
router.patch('/:id/read', requireAuth, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    const notificationId = parseInt(req.params.id);
    
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId // Ensure user can only update their own notifications
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
    
    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ 
      error: 'Failed to mark notification as read',
      message: error.message 
    });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', requireAuth, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
    
    res.json({ updatedCount: result.count });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ 
      error: 'Failed to mark all notifications as read',
      message: error.message 
    });
  }
});

// Create notification (for testing)
router.post('/', requireAuth, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    const { type, title, message, actionUrl, priority = 'NORMAL', metadata } = req.body;
    
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        actionUrl,
        priority,
        metadata
      }
    });
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ 
      error: 'Failed to create notification',
      message: error.message 
    });
  }
});

export default router;
