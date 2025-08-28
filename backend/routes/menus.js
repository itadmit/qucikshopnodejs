/**
 * 🧭 Menus API Routes
 * API לניהול תפריטי הניווט של החנות
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all menus for a store
router.get('/:storeSlug', async (req, res) => {
  try {
    const { storeSlug } = req.params;
    
    // Find store by slug
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get all menus for this store
    const menus = await prisma.menu.findMany({
      where: { storeId: store.id },
      orderBy: { sortOrder: 'asc' }
    });

    res.json(menus);

  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific menu by handle
router.get('/:storeSlug/:handle', async (req, res) => {
  try {
    const { storeSlug, handle } = req.params;
    
    // Find store by slug
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get specific menu
    const menu = await prisma.menu.findUnique({
      where: {
        storeId_handle: {
          storeId: store.id,
          handle: handle
        }
      }
    });

    if (!menu) {
      // Return default menu structure if not found
      const defaultMenu = getDefaultMenu(handle);
      return res.json(defaultMenu);
    }

    res.json(menu);

  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update menu
router.post('/:storeSlug/:handle', async (req, res) => {
  try {
    const { storeSlug, handle } = req.params;
    const { name, items } = req.body;
    
    // Find store by slug
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Upsert menu
    const menu = await prisma.menu.upsert({
      where: {
        storeId_handle: {
          storeId: store.id,
          handle: handle
        }
      },
      update: {
        name: name || handle,
        items: items || [],
        updatedAt: new Date()
      },
      create: {
        storeId: store.id,
        name: name || handle,
        handle: handle,
        items: items || [],
        isActive: true
      }
    });

    res.json(menu);

  } catch (error) {
    console.error('Error saving menu:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete menu
router.delete('/:storeSlug/:handle', async (req, res) => {
  try {
    const { storeSlug, handle } = req.params;
    
    // Find store by slug
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Delete menu
    await prisma.menu.delete({
      where: {
        storeId_handle: {
          storeId: store.id,
          handle: handle
        }
      }
    });

    res.json({ success: true });

  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get default menu structure
function getDefaultMenu(handle) {
  const defaultMenus = {
    'main-menu': {
      handle: 'main-menu',
      name: 'תפריט ראשי',
      items: [
        {
          id: '1',
          title: 'בית',
          url: '/',
          type: 'page',
          target: '_self'
        },
        {
          id: '2',
          title: 'מוצרים',
          url: '/products',
          type: 'collection',
          target: '_self',
          children: [
            {
              id: '2-1',
              title: 'כל המוצרים',
              url: '/products',
              type: 'collection',
              target: '_self'
            }
          ]
        },
        {
          id: '3',
          title: 'אודות',
          url: '/about',
          type: 'page',
          target: '_self'
        },
        {
          id: '4',
          title: 'צור קשר',
          url: '/contact',
          type: 'page',
          target: '_self'
        }
      ],
      isActive: true
    },
    'footer-menu': {
      handle: 'footer-menu',
      name: 'תפריט פוטר',
      items: [
        {
          id: '1',
          title: 'מדיניות פרטיות',
          url: '/privacy',
          type: 'page',
          target: '_self'
        },
        {
          id: '2',
          title: 'תנאי שימוש',
          url: '/terms',
          type: 'page',
          target: '_self'
        },
        {
          id: '3',
          title: 'החזרות והחלפות',
          url: '/returns',
          type: 'page',
          target: '_self'
        }
      ],
      isActive: true
    }
  };

  return defaultMenus[handle] || {
    handle: handle,
    name: handle,
    items: [],
    isActive: true
  };
}

export default router;
