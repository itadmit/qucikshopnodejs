/**
 * 🌐 Global Settings API Routes
 * API להגדרות גלובליות של החנות (הדר, פוטר, תמה)
 */

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get global settings by type
router.get('/:storeSlug/:type', async (req, res) => {
  try {
    const { storeSlug, type } = req.params;
    
    // Find store by slug
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get global settings
    const globalSettings = await prisma.globalSettings.findUnique({
      where: {
        storeId_type: {
          storeId: store.id,
          type: type.toUpperCase()
        }
      }
    });

    if (!globalSettings) {
      // Return default structure if not found
      const defaultSettings = getDefaultSettings(type.toUpperCase());
      return res.json(defaultSettings);
    }

    res.json({
      id: globalSettings.id,
      type: globalSettings.type,
      settings: globalSettings.settings,
      blocks: globalSettings.blocks,
      isActive: globalSettings.isActive,
      updatedAt: globalSettings.updatedAt
    });

  } catch (error) {
    console.error('Error fetching global settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save global settings
router.post('/:storeSlug/:type', async (req, res) => {
  try {
    const { storeSlug, type } = req.params;
    const { settings, blocks } = req.body;
    
    // Find store by slug
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Upsert global settings
    const globalSettings = await prisma.globalSettings.upsert({
      where: {
        storeId_type: {
          storeId: store.id,
          type: type.toUpperCase()
        }
      },
      update: {
        settings: settings || {},
        blocks: blocks || [],
        updatedAt: new Date()
      },
      create: {
        storeId: store.id,
        type: type.toUpperCase(),
        settings: settings || {},
        blocks: blocks || [],
        isActive: true
      }
    });

    res.json({
      id: globalSettings.id,
      type: globalSettings.type,
      settings: globalSettings.settings,
      blocks: globalSettings.blocks,
      isActive: globalSettings.isActive,
      updatedAt: globalSettings.updatedAt
    });

  } catch (error) {
    console.error('Error saving global settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get default settings for a type
function getDefaultSettings(type) {
  switch (type) {
    case 'HEADER':
      return {
        type: 'HEADER',
        settings: {
          header_design: 'logo-center-menu-left',
          container: 'container-fluid',
          header_sticky: true,
          transparent_on_top: false,
          logo_text: 'החנות שלי',
          logo_max_width: 145,
          sticky_logo_max_width: 145,
          mobile_logo_max_width: 110,
          uppercase_parent_level: true,
          search: 'hide',
          show_account_icon: true,
          show_cart_icon: true,
          show_wishlist_icon: true,
          show_currency_switcher: true,
          show_country_selector: false,
          show_language_switcher: true
        },
        blocks: [
          {
            type: 'menu_item',
            settings: {
              title: 'בית',
              link: '/'
            }
          },
          {
            type: 'menu_item',
            settings: {
              title: 'מוצרים',
              link: '/products'
            }
          },
          {
            type: 'menu_item',
            settings: {
              title: 'אודות',
              link: '/about'
            }
          },
          {
            type: 'menu_item',
            settings: {
              title: 'צור קשר',
              link: '/contact'
            }
          }
        ],
        isActive: true
      };

    case 'FOOTER':
      return {
        type: 'FOOTER',
        settings: {
          store_name: 'החנות שלי',
          description: 'החנות המובילה למוצרי איכות עם שירות מעולה ומשלוחים מהירים',
          phone: '03-1234567',
          email: 'info@mystore.co.il',
          address: 'רחוב הראשי 123, תל אביב',
          background_color: '#1f2937',
          text_color: '#ffffff',
          show_newsletter: true,
          show_payment_icons: true
        },
        blocks: [
          {
            type: 'footer_column',
            settings: {
              title: 'קישורים מהירים'
            }
          },
          {
            type: 'footer_link',
            settings: {
              title: 'אודות',
              link: '/about'
            }
          },
          {
            type: 'footer_link',
            settings: {
              title: 'צור קשר',
              link: '/contact'
            }
          }
        ],
        isActive: true
      };

    default:
      return {
        type: type,
        settings: {},
        blocks: [],
        isActive: true
      };
  }
}

export default router;
