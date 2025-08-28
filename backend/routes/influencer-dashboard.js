import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateInfluencer } from './influencer-auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateInfluencer);

// GET /api/influencer-dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const influencerId = req.influencer.id;

    // Get total earnings and orders
    const stats = await prisma.influencer.findUnique({
      where: { id: influencerId },
      select: {
        totalEarnings: true,
        totalOrders: true,
        commissionRate: true
      }
    });

    // Get active coupons count
    const activeCoupons = await prisma.coupon.count({
      where: {
        influencerId,
        status: 'ACTIVE'
      }
    });

    // Calculate conversion rate (simplified - would need more data in production)
    const totalCouponUses = await prisma.couponUsage.count({
      where: {
        coupon: {
          influencerId
        }
      }
    });

    const conversionRate = totalCouponUses > 0 ? (stats.totalOrders / totalCouponUses) * 100 : 0;

    res.json({
      totalEarnings: stats.totalEarnings,
      totalOrders: stats.totalOrders,
      activeCoupons,
      conversionRate: Math.min(conversionRate, 100) // Cap at 100%
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/influencer-dashboard/coupons
router.get('/coupons', async (req, res) => {
  try {
    const influencerId = req.influencer.id;

    const coupons = await prisma.coupon.findMany({
      where: {
        influencerId
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        discountType: true,
        discountValue: true,
        status: true,
        usageCount: true,
        usageLimit: true,
        expiresAt: true,
        _count: {
          select: {
            usages: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add usage count from _count
    const couponsWithUsage = coupons.map(coupon => ({
      ...coupon,
      usageCount: coupon._count.usages,
      _count: undefined
    }));

    res.json(couponsWithUsage);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// GET /api/influencer-dashboard/recent-orders
router.get('/recent-orders', async (req, res) => {
  try {
    const influencerId = req.influencer.id;

    // Get recent orders that used influencer's coupons
    const recentOrders = await prisma.order.findMany({
      where: {
        couponUsages: {
          some: {
            coupon: {
              influencerId
            }
          }
        }
      },
      select: {
        id: true,
        totalAmount: true,
        orderNumber: true,
        createdAt: true,
        couponUsages: {
          select: {
            coupon: {
              select: {
                code: true,
                discountType: true,
                discountValue: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    // Calculate commission for each order
    const ordersWithCommission = recentOrders.map(order => {
      const coupon = order.couponUsages[0]?.coupon;
      let discount = 0;
      
      if (coupon) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = (order.total * coupon.discountValue) / 100;
        } else if (coupon.discountType === 'FIXED_AMOUNT') {
          discount = coupon.discountValue;
        }
      }
      
      const commission = discount * req.influencer.commissionRate;
      
      return {
        id: order.id,
        total: order.total,
        createdAt: order.createdAt,
        couponCode: coupon?.code || 'N/A',
        commission
      };
    });

    res.json(ordersWithCommission);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
});

// GET /api/influencer-dashboard/monthly-stats
router.get('/monthly-stats', async (req, res) => {
  try {
    const influencerId = req.influencer.id;
    const { year, month } = req.query;
    
    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) - 1, 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    const monthlyStats = await prisma.influencerStats.findMany({
      where: {
        influencerId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    res.json(monthlyStats);
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ error: 'Failed to fetch monthly stats' });
  }
});

export default router;
