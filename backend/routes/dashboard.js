import express from 'express';
import { Store } from '../models/Store.js';
import { authenticateToken, requireActiveSubscription } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // For new users, return empty stats
    const stats = {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
      revenueGrowth: 0,
      ordersGrowth: 0,
      productsGrowth: 0,
      customersGrowth: 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      message: error.message 
    });
  }
});

// Get recent orders
router.get('/recent-orders', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // For new users, return empty orders
    const recentOrders = [];
    
    res.json(recentOrders);
  } catch (error) {
    console.error('Recent orders error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recent orders',
      message: error.message 
    });
  }
});

// Get popular products
router.get('/popular-products', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // For new users, return empty products
    const popularProducts = [];
    
    res.json(popularProducts);
  } catch (error) {
    console.error('Popular products error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch popular products',
      message: error.message 
    });
  }
});

// Get user stores
router.get('/user-stores', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all stores the user owns or has access to
    const ownedStores = await prisma.store.findMany({
      where: {
        userId: userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        domain: true,
        planType: true,
        subscriptionStatus: true,
        isActive: true,
        createdAt: true
      }
    });

    const sharedStores = await prisma.storeUser.findMany({
      where: {
        userId: userId,
        isActive: true,
        acceptedAt: { not: null }
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            domain: true,
            planType: true,
            subscriptionStatus: true,
            isActive: true,
            createdAt: true
          }
        }
      }
    });

    const stores = [
      ...ownedStores.map(store => ({ ...store, role: 'OWNER', isOwner: true })),
      ...sharedStores.map(su => ({ ...su.store, role: su.role, isOwner: false }))
    ];
    
    res.json(stores);
  } catch (error) {
    console.error('User stores error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user stores',
      message: error.message 
    });
  }
});

// Get specific store by ID
router.get('/user-store/:storeId', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId } = req.params;
    
    // Check if user has access to this store (either as owner or team member)
    const storeAccess = await prisma.store.findFirst({
      where: {
        id: parseInt(storeId),
        isActive: true,
        OR: [
          { userId: userId }, // User is owner
          { 
            storeUsers: {
              some: {
                userId: userId,
                isActive: true,
                acceptedAt: { not: null }
              }
            }
          } // User is team member
        ]
      },
      include: {
        storeUsers: {
          where: {
            userId: userId,
            isActive: true
          },
          select: {
            role: true
          }
        }
      }
    });
    
    if (!storeAccess) {
      return res.status(404).json({ 
        error: 'Store not found or access denied',
        message: 'אין לך גישה לחנות זו' 
      });
    }
    
    // Determine user role
    const role = storeAccess.userId === userId ? 'OWNER' : storeAccess.storeUsers[0]?.role || 'VIEWER';
    
    const storeData = {
      id: storeAccess.id,
      name: storeAccess.name,
      slug: storeAccess.slug,
      description: storeAccess.description,
      domain: storeAccess.domain,
      logoUrl: storeAccess.logoUrl,
      planType: storeAccess.planType,
      subscriptionStatus: storeAccess.subscriptionStatus,
      isActive: storeAccess.isActive,
      createdAt: storeAccess.createdAt,
      role: role
    };
    
    res.json({
      success: true,
      data: storeData
    });
    
  } catch (error) {
    console.error('Error fetching specific store:', error);
    res.status(500).json({
      error: 'Failed to fetch store',
      message: error.message
    });
  }
});

// Get primary/default store (for backward compatibility)
router.get('/user-store', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the user's first active store
    const store = await prisma.store.findFirst({
      where: {
        userId: userId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        domain: true,
        planType: true,
        subscriptionStatus: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    if (!store) {
      return res.status(404).json({ 
        error: 'Store not found',
        message: 'לא נמצאה חנות עבור המשתמש הזה' 
      });
    }
    
    res.json({ ...store, role: 'OWNER', isOwner: true });
  } catch (error) {
    console.error('User store error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user store',
      message: error.message 
    });
  }
});

// Get store setup progress
router.get('/setup-progress/:storeId', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const userId = req.user.id;
    const storeId = parseInt(req.params.storeId);
    
    // Check if user has access to this store
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        OR: [
          { userId: userId },
          {
            storeUsers: {
              some: {
                userId: userId,
                isActive: true,
                acceptedAt: { not: null }
              }
            }
          }
        ]
      }
    });
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }
    
    // Check various completion criteria
    const [
      productsCount,
      ordersCount,
      teamMembersCount,
      hasLogo,
      hasCustomDomain,
      hasPaymentMethod
    ] = await Promise.all([
      prisma.product.count({ where: { storeId, status: 'ACTIVE' } }),
      prisma.order.count({ where: { storeId } }),
      prisma.storeUser.count({ where: { storeId, isActive: true, acceptedAt: { not: null } } }),
      store.logoUrl ? 1 : 0,
      store.domain ? 1 : 0,
      // For now, assume no payment method is set up
      0
    ]);
    
    const progress = {
      hasProducts: productsCount > 0,
      hasOrders: ordersCount > 0,
      hasTeamMembers: teamMembersCount > 0,
      hasLogo: hasLogo > 0,
      hasCustomDomain: hasCustomDomain > 0,
      hasPaymentMethod: hasPaymentMethod > 0,
      hasCustomization: false, // TODO: Check theme customization
      
      // Counts for reference
      productsCount,
      ordersCount,
      teamMembersCount
    };
    
    res.json(progress);
  } catch (error) {
    console.error('Setup progress error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch setup progress',
      message: error.message 
    });
  }
});

export default router;
