import express from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/unified-auth.js';
import discountService from '../services/discountService.js';

const router = express.Router();

// POST /api/coupons/calculate - Calculate discounts for cart (public endpoint for store preview)
router.post('/calculate', async (req, res) => {
  try {
    const { cart, storeSlug, couponCode, customer } = req.body;
    
    if (!cart || !storeSlug) {
      return res.status(400).json({ error: 'Cart and store slug are required' });
    }

    // Calculate discounts using the discount service
    const result = await discountService.calculateDiscounts(cart, storeSlug, couponCode, customer);
    
    res.json(result);
  } catch (error) {
    console.error('Error calculating discounts:', error);
    res.status(500).json({ 
      error: 'Failed to calculate discounts',
      details: error.message 
    });
  }
});

// Apply authentication middleware to all other routes
router.use(requireAuth);

// GET /api/coupons - Get all coupons for a store
router.get('/', async (req, res) => {
  try {
    const { storeId } = req.query;
    
    if (!storeId) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    const coupons = await prisma.coupon.findMany({
      where: {
        storeId: parseInt(storeId)
      },
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            email: true,
            code: true
          }
        },
        usages: {
          select: {
            id: true,
            discountAmount: true,
            orderTotal: true,
            usedAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// GET /api/coupons/:id - Get a specific coupon
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await prisma.coupon.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            email: true,
            code: true
          }
        },
        usages: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                total: true,
                createdAt: true
              }
            },
            customer: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            usedAt: 'desc'
          }
        }
      }
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json(coupon);
  } catch (error) {
    console.error('Error fetching coupon:', error);
    res.status(500).json({ error: 'Failed to fetch coupon' });
  }
});

// POST /api/coupons - Create a new coupon
router.post('/', async (req, res) => {
  try {
    const {
      storeId,
      code,
      name,
      description,
      discountType,
      discountValue,
      minimumAmount,
      maximumDiscount,
      usageLimit,
      customerLimit,
      startsAt,
      expiresAt,
      applicableProducts,
      applicableCategories,
      excludedProducts,
      excludedCategories,
      influencerId
    } = req.body;

    // Validate required fields
    if (!storeId || !code || !name || !discountType) {
      return res.status(400).json({ 
        error: 'Store ID, code, name, and discount type are required' 
      });
    }

    if (discountType !== 'FREE_SHIPPING' && (!discountValue || discountValue <= 0)) {
      return res.status(400).json({ 
        error: 'Discount value is required for non-free-shipping coupons' 
      });
    }

    // Check if coupon code already exists for this store
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        storeId: parseInt(storeId),
        code: code.toUpperCase()
      }
    });

    if (existingCoupon) {
      return res.status(400).json({ 
        error: 'Coupon code already exists for this store' 
      });
    }

    // Create the coupon
    const coupon = await prisma.coupon.create({
      data: {
        storeId: parseInt(storeId),
        code: code.toUpperCase(),
        name,
        description,
        discountType,
        discountValue: discountType === 'FREE_SHIPPING' ? 0 : parseFloat(discountValue),
        minimumAmount: minimumAmount ? parseFloat(minimumAmount) : null,
        maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        customerLimit: customerLimit ? parseInt(customerLimit) : null,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        applicableProducts: applicableProducts || null,
        applicableCategories: applicableCategories || null,
        excludedProducts: excludedProducts || null,
        excludedCategories: excludedCategories || null,
        influencerId: influencerId ? parseInt(influencerId) : null
      },
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            email: true,
            code: true
          }
        }
      }
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// PUT /api/coupons/:id - Update a coupon
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minimumAmount,
      maximumDiscount,
      usageLimit,
      customerLimit,
      startsAt,
      expiresAt,
      status,
      applicableProducts,
      applicableCategories,
      excludedProducts,
      excludedCategories,
      influencerId
    } = req.body;

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    // If code is being changed, check for duplicates
    if (code && code.toUpperCase() !== existingCoupon.code) {
      const duplicateCoupon = await prisma.coupon.findFirst({
        where: {
          storeId: existingCoupon.storeId,
          code: code.toUpperCase(),
          id: { not: parseInt(id) }
        }
      });

      if (duplicateCoupon) {
        return res.status(400).json({ 
          error: 'Coupon code already exists for this store' 
        });
      }
    }

    // Update the coupon
    const updatedCoupon = await prisma.coupon.update({
      where: { id: parseInt(id) },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(discountType && { discountType }),
        ...(discountValue !== undefined && { 
          discountValue: discountType === 'FREE_SHIPPING' ? 0 : parseFloat(discountValue) 
        }),
        ...(minimumAmount !== undefined && { 
          minimumAmount: minimumAmount ? parseFloat(minimumAmount) : null 
        }),
        ...(maximumDiscount !== undefined && { 
          maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null 
        }),
        ...(usageLimit !== undefined && { 
          usageLimit: usageLimit ? parseInt(usageLimit) : null 
        }),
        ...(customerLimit !== undefined && { 
          customerLimit: customerLimit ? parseInt(customerLimit) : null 
        }),
        ...(startsAt !== undefined && { 
          startsAt: startsAt ? new Date(startsAt) : null 
        }),
        ...(expiresAt !== undefined && { 
          expiresAt: expiresAt ? new Date(expiresAt) : null 
        }),
        ...(status && { status }),
        ...(applicableProducts !== undefined && { applicableProducts }),
        ...(applicableCategories !== undefined && { applicableCategories }),
        ...(excludedProducts !== undefined && { excludedProducts }),
        ...(excludedCategories !== undefined && { excludedCategories }),
        ...(influencerId !== undefined && { 
          influencerId: influencerId ? parseInt(influencerId) : null 
        })
      },
      include: {
        influencer: {
          select: {
            id: true,
            name: true,
            email: true,
            code: true
          }
        }
      }
    });

    res.json(updatedCoupon);
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ error: 'Failed to update coupon' });
  }
});

// DELETE /api/coupons/:id - Delete a coupon
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if coupon exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    // Delete the coupon
    await prisma.coupon.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

// POST /api/coupons/:code/validate - Validate a coupon code
router.post('/:code/validate', async (req, res) => {
  try {
    const { code } = req.params;
    const { storeId, cartTotal, customerId } = req.body;

    if (!storeId || cartTotal === undefined) {
      return res.status(400).json({ 
        error: 'Store ID and cart total are required' 
      });
    }

    // Find the coupon
    const coupon = await prisma.coupon.findFirst({
      where: {
        storeId: parseInt(storeId),
        code: code.toUpperCase(),
        status: 'ACTIVE'
      }
    });

    if (!coupon) {
      return res.status(404).json({ 
        error: 'Coupon not found or inactive',
        valid: false 
      });
    }

    // Check if coupon is within date range
    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      return res.status(400).json({ 
        error: 'Coupon is not yet active',
        valid: false 
      });
    }

    if (coupon.expiresAt && now > coupon.expiresAt) {
      return res.status(400).json({ 
        error: 'Coupon has expired',
        valid: false 
      });
    }

    // Check usage limits
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ 
        error: 'Coupon usage limit reached',
        valid: false 
      });
    }

    // Check minimum amount
    if (coupon.minimumAmount && cartTotal < coupon.minimumAmount) {
      return res.status(400).json({ 
        error: `Minimum order amount is ₪${coupon.minimumAmount}`,
        valid: false 
      });
    }

    // Check customer usage limit if customer is provided
    if (customerId && coupon.customerLimit) {
      const customerUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          customerId: parseInt(customerId)
        }
      });

      if (customerUsageCount >= coupon.customerLimit) {
        return res.status(400).json({ 
          error: 'Customer usage limit reached for this coupon',
          valid: false 
        });
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    
    switch (coupon.discountType) {
      case 'PERCENTAGE':
        discountAmount = (cartTotal * coupon.discountValue) / 100;
        if (coupon.maximumDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
        }
        break;
      case 'FIXED_AMOUNT':
        discountAmount = Math.min(coupon.discountValue, cartTotal);
        break;
      case 'FREE_SHIPPING':
        discountAmount = 0; // Shipping discount is handled separately
        break;
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discountAmount,
      freeShipping: coupon.discountType === 'FREE_SHIPPING'
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

export default router;