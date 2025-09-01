import express from 'express';
import { Store } from '../models/Store.js';
import { requireDashboardAccess, requireAuth, requireActiveSubscription } from '../middleware/unified-auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = express.Router();

// Get dashboard statistics
router.get('/stats', requireDashboardAccess, async (req, res) => {
  try {
    const store = req.currentStore;
    
    // חישוב סטטיסטיקות לחנות הנוכחית
    const stats = await Promise.all([
      // סה"כ הכנסות מהזמנות שהושלמו
      prisma.order.aggregate({
        where: { 
          storeId: store.id,
          OR: [
            { status: 'DELIVERED' },
            { fulfillmentStatus: 'FULFILLED' }
          ]
        },
        _sum: { totalAmount: true }
      }),
      // סה"כ הזמנות
      prisma.order.count({
        where: { storeId: store.id }
      }),
      // סה"כ מוצרים פעילים
      prisma.product.count({
        where: { 
          storeId: store.id,
          status: 'ACTIVE'
        }
      }),
      // סה"כ לקוחות
      prisma.customer.count({
        where: { storeId: store.id }
      })
    ]);

    const result = {
      totalRevenue: stats[0]._sum.totalAmount || 0,
      totalOrders: stats[1] || 0,
      totalProducts: stats[2] || 0,
      totalCustomers: stats[3] || 0,
      revenueGrowth: 0, // TODO: חישוב גידול
      ordersGrowth: 0,  // TODO: חישוב גידול
      productsGrowth: 0, // TODO: חישוב גידול
      customersGrowth: 0 // TODO: חישוב גידול
    };
    
    res.json(result);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      message: error.message 
    });
  }
});

// Get recent orders
router.get('/recent-orders', requireDashboardAccess, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    
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
router.get('/popular-products', requireDashboardAccess, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    
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
router.get('/user-stores', requireDashboardAccess, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    
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
router.get('/user-store/:storeId', requireDashboardAccess, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
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
router.get('/user-store', requireDashboardAccess, async (req, res) => {
  try {
    const userId = req.authenticatedUser.id;
    
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
router.get('/setup-progress/:storeId', requireDashboardAccess, async (req, res) => {
  try {
    const store = req.currentStore;
    const storeId = store.id;
    
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
