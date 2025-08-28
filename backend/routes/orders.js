import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all orders for a store
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.query;
    const userId = req.user.id;

    // Verify user has access to this store
    const storeUser = await prisma.storeUser.findFirst({
      where: {
        storeId: parseInt(storeId),
        userId: userId,
        isActive: true
      }
    });

    if (!storeUser) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const orders = await prisma.order.findMany({
      where: {
        storeId: parseInt(storeId)
      },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                media: true
              }
            },
            variant: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        store: true,
        items: {
          include: {
            product: {
              include: {
                media: true
              }
            },
            variant: {
              include: {
                optionValues: {
                  include: {
                    option: true,
                    optionValue: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user has access to this store
    const storeUser = await prisma.storeUser.findFirst({
      where: {
        storeId: order.storeId,
        userId: userId,
        isActive: true
      }
    });

    if (!storeUser) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

// Update order status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Get order first to verify access
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user has access to this store
    const storeUser = await prisma.storeUser.findFirst({
      where: {
        storeId: order.storeId,
        userId: userId,
        isActive: true
      }
    });

    if (!storeUser) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                media: true
              }
            },
            variant: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Update payment status
router.put('/:id/payment-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const userId = req.user.id;

    // Get order first to verify access
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify user has access to this store
    const storeUser = await prisma.storeUser.findFirst({
      where: {
        storeId: order.storeId,
        userId: userId,
        isActive: true
      }
    });

    if (!storeUser) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { paymentStatus },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                media: true
              }
            },
            variant: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

export default router;
