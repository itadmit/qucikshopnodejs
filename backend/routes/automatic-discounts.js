import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/automatic-discounts - Get all automatic discounts for a store
router.get('/', async (req, res) => {
  try {
    const { storeId } = req.query;
    
    if (!storeId) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    const automaticDiscounts = await prisma.automaticDiscount.findMany({
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
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(automaticDiscounts);
  } catch (error) {
    console.error('Error fetching automatic discounts:', error);
    res.status(500).json({ error: 'Failed to fetch automatic discounts' });
  }
});

// GET /api/automatic-discounts/:id - Get a specific automatic discount
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const automaticDiscount = await prisma.automaticDiscount.findUnique({
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
        }
      }
    });

    if (!automaticDiscount) {
      return res.status(404).json({ error: 'Automatic discount not found' });
    }

    res.json(automaticDiscount);
  } catch (error) {
    console.error('Error fetching automatic discount:', error);
    res.status(500).json({ error: 'Failed to fetch automatic discount' });
  }
});

// POST /api/automatic-discounts - Create a new automatic discount
router.post('/', async (req, res) => {
  try {
    const {
      storeId,
      name,
      description,
      discountType,
      discountValue,
      minimumAmount,
      maximumDiscount,
      priority,
      stackable,
      startsAt,
      expiresAt,
      buyQuantity,
      getQuantity,
      tieredRules,
      applicableProducts,
      applicableCategories,
      excludedProducts,
      excludedCategories,
      influencerId,
      // Advanced BOGO fields
      buyProducts,
      buyCategories,
      getProducts,
      getCategories,
      getDiscountType,
      getDiscountValue
    } = req.body;

    // Validate required fields
    if (!storeId || !name || !discountType) {
      return res.status(400).json({ 
        error: 'Store ID, name, and discount type are required' 
      });
    }

    if (discountType !== 'FREE_SHIPPING' && discountType !== 'BUY_X_GET_Y' && (!discountValue || discountValue <= 0)) {
      return res.status(400).json({ 
        error: 'Discount value is required for this discount type' 
      });
    }

    if (discountType === 'BUY_X_GET_Y') {
      if (!buyQuantity || !getQuantity || buyQuantity <= 0 || getQuantity <= 0) {
        return res.status(400).json({ 
          error: 'Buy quantity and get quantity are required for BOGO discounts' 
        });
      }
    }

    // Create the automatic discount
    const automaticDiscount = await prisma.automaticDiscount.create({
      data: {
        storeId: parseInt(storeId),
        name,
        description,
        discountType,
        discountValue: discountType === 'FREE_SHIPPING' ? 0 : parseFloat(discountValue || 0),
        minimumAmount: minimumAmount ? parseFloat(minimumAmount) : null,
        maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null,
        priority: priority ? parseInt(priority) : 0,
        stackable: stackable || false,
        startsAt: startsAt ? new Date(startsAt) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        buyQuantity: buyQuantity ? parseInt(buyQuantity) : null,
        getQuantity: getQuantity ? parseInt(getQuantity) : null,
        tieredRules: tieredRules || null,
        applicableProducts: applicableProducts || null,
        applicableCategories: applicableCategories || null,
        excludedProducts: excludedProducts || null,
        excludedCategories: excludedCategories || null,
        influencerId: influencerId ? parseInt(influencerId) : null,
        // Advanced BOGO fields
        buyProducts: buyProducts || null,
        buyCategories: buyCategories || null,
        getProducts: getProducts || null,
        getCategories: getCategories || null,
        getDiscountType: getDiscountType || null,
        getDiscountValue: getDiscountValue ? parseFloat(getDiscountValue) : null
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

    res.status(201).json(automaticDiscount);
  } catch (error) {
    console.error('Error creating automatic discount:', error);
    res.status(500).json({ error: 'Failed to create automatic discount' });
  }
});

// PUT /api/automatic-discounts/:id - Update an automatic discount
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      discountType,
      discountValue,
      minimumAmount,
      maximumDiscount,
      priority,
      stackable,
      startsAt,
      expiresAt,
      status,
      buyQuantity,
      getQuantity,
      tieredRules,
      applicableProducts,
      applicableCategories,
      excludedProducts,
      excludedCategories,
      influencerId,
      // Advanced BOGO fields
      buyProducts,
      buyCategories,
      getProducts,
      getCategories,
      getDiscountType,
      getDiscountValue
    } = req.body;

    // Check if automatic discount exists
    const existingDiscount = await prisma.automaticDiscount.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingDiscount) {
      return res.status(404).json({ error: 'Automatic discount not found' });
    }

    // Update the automatic discount
    const updatedDiscount = await prisma.automaticDiscount.update({
      where: { id: parseInt(id) },
      data: {
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
        ...(priority !== undefined && { priority: parseInt(priority) }),
        ...(stackable !== undefined && { stackable }),
        ...(startsAt !== undefined && { 
          startsAt: startsAt ? new Date(startsAt) : null 
        }),
        ...(expiresAt !== undefined && { 
          expiresAt: expiresAt ? new Date(expiresAt) : null 
        }),
        ...(status && { status }),
        ...(buyQuantity !== undefined && { 
          buyQuantity: buyQuantity ? parseInt(buyQuantity) : null 
        }),
        ...(getQuantity !== undefined && { 
          getQuantity: getQuantity ? parseInt(getQuantity) : null 
        }),
        ...(tieredRules !== undefined && { tieredRules }),
        ...(applicableProducts !== undefined && { applicableProducts }),
        ...(applicableCategories !== undefined && { applicableCategories }),
        ...(excludedProducts !== undefined && { excludedProducts }),
        ...(excludedCategories !== undefined && { excludedCategories }),
        ...(influencerId !== undefined && { 
          influencerId: influencerId ? parseInt(influencerId) : null 
        }),
        // Advanced BOGO fields
        ...(buyProducts !== undefined && { buyProducts }),
        ...(buyCategories !== undefined && { buyCategories }),
        ...(getProducts !== undefined && { getProducts }),
        ...(getCategories !== undefined && { getCategories }),
        ...(getDiscountType !== undefined && { getDiscountType }),
        ...(getDiscountValue !== undefined && { 
          getDiscountValue: getDiscountValue ? parseFloat(getDiscountValue) : null 
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

    res.json(updatedDiscount);
  } catch (error) {
    console.error('Error updating automatic discount:', error);
    res.status(500).json({ error: 'Failed to update automatic discount' });
  }
});

// DELETE /api/automatic-discounts/:id - Delete an automatic discount
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if automatic discount exists
    const existingDiscount = await prisma.automaticDiscount.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingDiscount) {
      return res.status(404).json({ error: 'Automatic discount not found' });
    }

    // Delete the automatic discount
    await prisma.automaticDiscount.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Automatic discount deleted successfully' });
  } catch (error) {
    console.error('Error deleting automatic discount:', error);
    res.status(500).json({ error: 'Failed to delete automatic discount' });
  }
});

// GET /api/automatic-discounts/active/:storeId - Get active automatic discounts for a store (for frontend calculation)
router.get('/active/:storeId', async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const now = new Date();
    
    const activeDiscounts = await prisma.automaticDiscount.findMany({
      where: {
        storeId: parseInt(storeId),
        status: 'ACTIVE',
        OR: [
          { startsAt: null },
          { startsAt: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: now } }
            ]
          }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(activeDiscounts);
  } catch (error) {
    console.error('Error fetching active automatic discounts:', error);
    res.status(500).json({ error: 'Failed to fetch active automatic discounts' });
  }
});

export default router;
