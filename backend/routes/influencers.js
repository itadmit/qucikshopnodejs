import express from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/unified-auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// GET /api/influencers - Get all influencers for a store
router.get('/', async (req, res) => {
  try {
    const { storeId } = req.query;
    
    if (!storeId) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    const influencers = await prisma.influencer.findMany({
      where: {
        storeId: parseInt(storeId)
      },
      include: {
        coupons: {
          select: {
            id: true,
            code: true,
            name: true,
            status: true,
            usageCount: true
          }
        },
        automaticDiscounts: {
          select: {
            id: true,
            name: true,
            status: true,
            usageCount: true
          }
        },
        _count: {
          select: {
            coupons: true,
            automaticDiscounts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(influencers);
  } catch (error) {
    console.error('Error fetching influencers:', error);
    res.status(500).json({ error: 'Failed to fetch influencers' });
  }
});

// GET /api/influencers/:id - Get a specific influencer
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const influencer = await prisma.influencer.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        coupons: {
          include: {
            usages: {
              select: {
                id: true,
                discountAmount: true,
                orderTotal: true,
                usedAt: true
              }
            }
          }
        },
        automaticDiscounts: true,
        influencerStats: {
          orderBy: {
            date: 'desc'
          },
          take: 30 // Last 30 days
        }
      }
    });

    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    res.json(influencer);
  } catch (error) {
    console.error('Error fetching influencer:', error);
    res.status(500).json({ error: 'Failed to fetch influencer' });
  }
});

// POST /api/influencers - Create a new influencer
router.post('/', async (req, res) => {
  try {
    const {
      storeId,
      name,
      email,
      phone,
      password,
      commissionRate
    } = req.body;

    // Validate required fields
    if (!storeId || !name || !email || !password) {
      return res.status(400).json({ 
        error: 'Store ID, name, email, and password are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if influencer email already exists for this store
    const existingInfluencerByEmail = await prisma.influencer.findFirst({
      where: {
        storeId: parseInt(storeId),
        email: email.toLowerCase()
      }
    });

    if (existingInfluencerByEmail) {
      return res.status(400).json({ 
        error: 'Influencer with this email already exists for this store' 
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique code for the influencer (using first name + random number)
    const firstName = name.split(' ')[0].toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000);
    let code = `${firstName}${randomNum}`;
    
    // Check if generated code exists and regenerate if needed
    let codeExists = true;
    let attempts = 0;
    while (codeExists && attempts < 10) {
      const existing = await prisma.influencer.findFirst({
        where: {
          storeId: parseInt(storeId),
          code: code
        }
      });
      
      if (!existing) {
        codeExists = false;
      } else {
        code = `${firstName}${Math.floor(Math.random() * 10000)}`;
        attempts++;
      }
    }

    // Create the influencer
    const influencer = await prisma.influencer.create({
      data: {
        storeId: parseInt(storeId),
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        code: code,
        password: hashedPassword,
        commissionRate: commissionRate ? parseFloat(commissionRate) : 0.1, // Default 10%
        status: 'ACTIVE'
      }
    });

    res.status(201).json(influencer);
  } catch (error) {
    console.error('Error creating influencer:', error);
    res.status(500).json({ error: 'Failed to create influencer' });
  }
});

// PUT /api/influencers/:id - Update an influencer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      code,
      commissionRate,
      status
    } = req.body;

    // Check if influencer exists
    const existingInfluencer = await prisma.influencer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingInfluencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    // If email is being changed, validate and check for duplicates
    if (email && email.toLowerCase() !== existingInfluencer.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Invalid email format' 
        });
      }

      const duplicateInfluencer = await prisma.influencer.findFirst({
        where: {
          storeId: existingInfluencer.storeId,
          email: email.toLowerCase(),
          id: { not: parseInt(id) }
        }
      });

      if (duplicateInfluencer) {
        return res.status(400).json({ 
          error: 'Influencer with this email already exists for this store' 
        });
      }
    }

    // If code is being changed, check for duplicates
    if (code && code.toUpperCase() !== existingInfluencer.code) {
      const duplicateInfluencer = await prisma.influencer.findFirst({
        where: {
          storeId: existingInfluencer.storeId,
          code: code.toUpperCase(),
          id: { not: parseInt(id) }
        }
      });

      if (duplicateInfluencer) {
        return res.status(400).json({ 
          error: 'Influencer code already exists for this store' 
        });
      }
    }

    // Update the influencer
    const updatedInfluencer = await prisma.influencer.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(phone !== undefined && { phone }),
        ...(code && { code: code.toUpperCase() }),
        ...(commissionRate !== undefined && { commissionRate: parseFloat(commissionRate) }),
        ...(status && { status })
      }
    });

    res.json(updatedInfluencer);
  } catch (error) {
    console.error('Error updating influencer:', error);
    res.status(500).json({ error: 'Failed to update influencer' });
  }
});

// DELETE /api/influencers/:id - Delete an influencer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if influencer exists
    const existingInfluencer = await prisma.influencer.findUnique({
      where: { id: parseInt(id) },
      include: {
        coupons: true,
        automaticDiscounts: true
      }
    });

    if (!existingInfluencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    // Check if influencer has associated coupons or discounts
    if (existingInfluencer.coupons.length > 0 || existingInfluencer.automaticDiscounts.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete influencer with associated coupons or discounts. Please remove them first.' 
      });
    }

    // Delete the influencer
    await prisma.influencer.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Influencer deleted successfully' });
  } catch (error) {
    console.error('Error deleting influencer:', error);
    res.status(500).json({ error: 'Failed to delete influencer' });
  }
});

// GET /api/influencers/:id/analytics - Get influencer analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Check if influencer exists
    const influencer = await prisma.influencer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!influencer) {
      return res.status(404).json({ error: 'Influencer not found' });
    }

    // Set date range (default to last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get influencer stats for the date range
    const stats = await prisma.influencerStats.findMany({
      where: {
        influencerId: parseInt(id),
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get coupon usage data
    const couponUsages = await prisma.couponUsage.findMany({
      where: {
        coupon: {
          influencerId: parseInt(id)
        },
        usedAt: {
          gte: start,
          lte: end
        }
      },
      include: {
        coupon: {
          select: {
            code: true,
            name: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            total: true
          }
        }
      }
    });

    // Calculate totals
    const totalStats = stats.reduce((acc, stat) => ({
      orders: acc.orders + stat.orders,
      revenue: acc.revenue + stat.revenue,
      commission: acc.commission + stat.commission,
      couponUses: acc.couponUses + stat.couponUses,
      newCustomers: acc.newCustomers + stat.newCustomers
    }), {
      orders: 0,
      revenue: 0,
      commission: 0,
      couponUses: 0,
      newCustomers: 0
    });

    res.json({
      influencer: {
        id: influencer.id,
        name: influencer.name,
        code: influencer.code,
        commissionRate: influencer.commissionRate
      },
      dateRange: {
        start,
        end
      },
      totals: totalStats,
      dailyStats: stats,
      couponUsages
    });
  } catch (error) {
    console.error('Error fetching influencer analytics:', error);
    res.status(500).json({ error: 'Failed to fetch influencer analytics' });
  }
});

export default router;