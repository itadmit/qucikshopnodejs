import express from 'express'
import prisma from '../lib/prisma.js'
import { authenticateToken, requireActiveSubscription } from '../middleware/auth.js'

const router = express.Router()

// Reset store to defaults - MUST be before /:slug route
router.post('/:storeId/reset-to-defaults', authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    console.log(`🔄 Resetting store ${storeId} to defaults for user ${userId}`);

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: parseInt(storeId),
        userId: userId
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    // Start transaction to reset everything
    await prisma.$transaction(async (tx) => {
      console.log(`🗑️ Deleting existing data for store ${storeId}`);

      // Delete existing menus
      await tx.menu.deleteMany({
        where: { storeId: parseInt(storeId) }
      });

      // Delete existing pages
      await tx.page.deleteMany({
        where: { storeId: parseInt(storeId) }
      });

      // Delete existing global settings (note: GlobalSettings not GlobalSetting)
      await tx.globalSettings.deleteMany({
        where: { storeId: parseInt(storeId) }
      });

      // Delete existing custom pages (from builder)
      await tx.customPage.deleteMany({
        where: { storeId: parseInt(storeId) }
      });

      console.log(`✅ Deleted existing data for store ${storeId}`);
    });

    // Import the setup function
    const { setupNewStore } = await import('../services/storeSetup.js');
    
    // Setup default data
    await setupNewStore(storeId);

    console.log(`🎉 Successfully reset store ${storeId} to defaults`);

    res.json({
      success: true,
      message: 'Store has been reset to defaults successfully',
      storeId: parseInt(storeId)
    });

  } catch (error) {
    console.error('Error resetting store to defaults:', error);
    res.status(500).json({ 
      error: 'Failed to reset store to defaults',
      message: error.message 
    });
  }
});

// Get store by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    
    const store = await prisma.store.findUnique({
      where: { 
        slug: slug,
        isActive: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }
    
    // Return store data without sensitive information
    const storeData = {
      id: store.id,
      name: store.name,
      slug: store.slug,
      domain: store.domain,
      logoUrl: store.logoUrl,
      faviconUrl: store.faviconUrl,
      description: store.description,
      templateName: store.templateName,
      settings: store.settings,
      createdAt: store.createdAt,
      owner: store.user
    }
    
    res.json(storeData)
  } catch (error) {
    console.error('Error fetching store:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get store categories
router.get('/:slug/categories', async (req, res) => {
  try {
    const { slug } = req.params
    
    // First get the store
    const store = await prisma.store.findUnique({
      where: { slug: slug, isActive: true }
    })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }
    
    const categories = await prisma.category.findMany({
      where: {
        storeId: store.id,
        isActive: true
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE'
              }
            }
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })
    
    // Transform the data
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      productCount: category._count.products
    }))
    
    res.json(transformedCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get category by slug
router.get('/:storeSlug/categories/:categorySlug', async (req, res) => {
  try {
    const { storeSlug, categorySlug } = req.params
    
    // Get store first
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug, isActive: true }
    })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }
    
    const category = await prisma.category.findFirst({
      where: {
        slug: categorySlug,
        storeId: store.id,
        isActive: true
      }
    })
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    res.json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get products for a category
router.get('/:storeSlug/categories/:categorySlug/products', async (req, res) => {
  try {
    const { storeSlug, categorySlug } = req.params
    
    // Get store first
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug, isActive: true }
    })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }
    
    // Get category
    const category = await prisma.category.findFirst({
      where: {
        slug: categorySlug,
        storeId: store.id,
        isActive: true
      }
    })
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' })
    }
    
    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        status: 'ACTIVE'
      },
      include: {
        media: {
          include: {
            media: true
          },
          where: {
            type: 'IMAGE'
          },
          orderBy: {
            sortOrder: 'asc'
          },
          take: 1
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })
    
    // Transform products data
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.shortDescription || product.description,
      price: parseFloat(product.price),
      originalPrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
      imageUrl: product.media[0]?.media?.s3Url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      category: category.name,
      inStock: product.trackInventory ? product.inventoryQuantity > 0 : true,
      rating: 4.5, // Mock rating for now
      reviewCount: 128 // Mock review count for now
    }))
    
    res.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching category products:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all products for store
router.get('/:slug/products', async (req, res) => {
  try {
    const { slug } = req.params
    const { search, category, minPrice, maxPrice, sortBy, status } = req.query
    
    // Get store first
    const store = await prisma.store.findUnique({
      where: { slug: slug, isActive: true }
    })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }
    
    // Build where clause
    const whereClause = {
      storeId: store.id,
      status: 'ACTIVE'
    }
    
    // Add search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Add category filter
    if (category) {
      const categoryRecord = await prisma.category.findFirst({
        where: {
          slug: category,
          storeId: store.id,
          isActive: true
        }
      })
      if (categoryRecord) {
        whereClause.categoryId = categoryRecord.id
      }
    }
    
    // Add price filters
    if (minPrice || maxPrice) {
      whereClause.price = {}
      if (minPrice) whereClause.price.gte = parseFloat(minPrice)
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice)
    }
    
    // Add status filter
    if (status) {
      whereClause.status = status
    }
    
    // Build order clause
    let orderBy = { sortOrder: 'asc' }
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          orderBy = { price: 'asc' }
          break
        case 'price-desc':
          orderBy = { price: 'desc' }
          break
        case 'name-asc':
          orderBy = { name: 'asc' }
          break
        case 'name-desc':
          orderBy = { name: 'desc' }
          break
        case 'newest':
          orderBy = { createdAt: 'desc' }
          break
        case 'oldest':
          orderBy = { createdAt: 'asc' }
          break
      }
    }
    
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        media: {
          include: {
            media: true
          },
          where: {
            type: 'IMAGE'
          },
          orderBy: {
            sortOrder: 'asc'
          },
          take: 1
        }
      },
      orderBy
    })
    
    // Transform products data
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.shortDescription || product.description,
      price: parseFloat(product.price),
      originalPrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
      imageUrl: product.media[0]?.media?.s3Url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      category: product.category?.name || 'כללי',
      categorySlug: product.category?.slug || 'general',
      inStock: product.trackInventory ? product.inventoryQuantity > 0 : true,
      rating: 4.5, // Mock rating for now
      reviewCount: 128, // Mock review count for now
      status: product.status,
      createdAt: product.createdAt
    }))
    
    res.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get featured products for store
router.get('/:slug/products/featured', async (req, res) => {
  try {
    const { slug } = req.params
    
    // Get store first
    const store = await prisma.store.findUnique({
      where: { slug: slug, isActive: true }
    })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }
    
    const products = await prisma.product.findMany({
      where: {
        storeId: store.id,
        status: 'ACTIVE'
      },
      include: {
        category: true,
        media: {
          include: {
            media: true
          },
          where: {
            type: 'IMAGE'
          },
          orderBy: {
            sortOrder: 'asc'
          },
          take: 1
        }
      },
      orderBy: {
        sortOrder: 'asc'
      },
      take: 8 // Limit to 8 featured products
    })
    
    // Transform products data
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.shortDescription || product.description,
      price: parseFloat(product.price),
      originalPrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
      imageUrl: product.media[0]?.media?.s3Url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      category: product.category?.name || 'כללי',
      inStock: product.trackInventory ? product.inventoryQuantity > 0 : true,
      rating: 4.5, // Mock rating for now
      reviewCount: 128 // Mock review count for now
    }))
    
    res.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching featured products:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get product by slug
router.get('/:storeSlug/products/:productSlug', async (req, res) => {
  try {
    const { storeSlug, productSlug } = req.params
    
    // Get store first
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug, isActive: true }
    })
    
    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }
    
    const product = await prisma.product.findFirst({
      where: {
        slug: productSlug,
        storeId: store.id,
        status: 'ACTIVE'
      },
      include: {
        category: true,
        media: {
          include: {
            media: true
          },
          where: {
            type: 'IMAGE'
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        variants: true,
        bundleItems: {
          include: {
            product: {
              include: {
                media: {
                  include: {
                    media: true
                  },
                  where: {
                    type: 'IMAGE'
                  },
                  take: 1
                }
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
    })
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    // Calculate availability for bundle products
    let inStock = true;
    let stockQuantity = product.inventoryQuantity;
    
    if (product.type === 'BUNDLE') {
      // Calculate bundle availability
      let maxAvailableQuantity = Infinity;
      
      for (const item of product.bundleItems) {
        if (item.isOptional) continue;
        
        let itemAvailability = 0;
        if (item.variant) {
          itemAvailability = item.variant.inventoryQuantity;
        } else {
          itemAvailability = item.product.inventoryQuantity;
        }
        
        const bundlesFromThisItem = Math.floor(itemAvailability / item.quantity);
        maxAvailableQuantity = Math.min(maxAvailableQuantity, bundlesFromThisItem);
      }
      
      stockQuantity = maxAvailableQuantity === Infinity ? 0 : maxAvailableQuantity;
      inStock = stockQuantity > 0;
    } else {
      inStock = product.trackInventory ? product.inventoryQuantity > 0 : true;
    }

    // Transform product data
    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      type: product.type,
      price: parseFloat(product.price),
      originalPrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
      sku: product.sku,
      category: product.category?.name || 'כללי',
      inStock,
      stockQuantity,
      rating: 4.5, // Mock rating for now
      reviewCount: 128, // Mock review count for now
      images: product.media.map(media => media.media.s3Url),
      options: [], // Will be populated from variants if needed
      specifications: product.tags || {},
      bundleItems: product.type === 'BUNDLE' ? product.bundleItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        isOptional: item.isOptional,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.media[0]?.media?.s3Url || null
        },
        variant: item.variant ? {
          id: item.variant.id,
          price: item.variant.price,
          options: item.variant.optionValues.map(ov => ({
            name: ov.option.name,
            value: ov.optionValue.value
          }))
        } : null
      })) : []
    }
    
    // Let the frontend handle empty images with placeholder
    
    res.json(transformedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get store product page design
router.get('/:storeSlug/design/product-page', async (req, res) => {
  try {
    const { storeSlug } = req.params;
    
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // For now, return default product page structure
    // In the future, this could be stored in database
    const defaultProductPageStructure = {
      sections: [
        {
          id: 'product-images-1',
          type: 'product_images',
          settings: {
            layout: 'gallery',
            main_image_ratio: 'square',
            show_thumbnails: true,
            thumbnail_position: 'bottom',
            show_zoom: true,
            show_navigation: true,
            border_radius: 'rounded-lg',
            spacing: 'gap-4'
          }
        },
        {
          id: 'product-title-1',
          type: 'product_title',
          settings: {
            show_vendor: true,
            title_size: 'text-3xl',
            title_weight: 'font-bold',
            title_color: '#000000',
            vendor_size: 'text-sm',
            vendor_color: '#666666',
            alignment: 'text-right'
          }
        },
        {
          id: 'product-price-1',
          type: 'product_price',
          settings: {
            show_compare_price: true,
            show_currency: true,
            price_size: 'text-xl',
            price_weight: 'font-bold',
            price_color: '#000000',
            compare_price_size: 'text-lg',
            compare_price_color: '#999999',
            currency_position: 'after',
            alignment: 'text-right',
            show_sale_badge: true,
            sale_badge_text: 'מבצע',
            sale_badge_color: '#ef4444'
          }
        },
        {
          id: 'product-options-1',
          type: 'product_options',
          settings: {
            show_labels: true,
            label_size: 'text-sm',
            label_weight: 'font-medium',
            label_color: '#374151',
            option_style: 'buttons',
            button_style: 'rounded',
            show_selected_value: true,
            spacing: 'space-y-4'
          }
        },
        {
          id: 'add-to-cart-1',
          type: 'add_to_cart',
          settings: {
            button_text: 'הוסף לסל',
            button_size: 'large',
            button_style: 'primary',
            button_width: 'full',
            show_quantity: true,
            show_icon: true,
            icon_position: 'right',
            quantity_style: 'buttons',
            max_quantity: 10,
            button_color: '#3b82f6',
            button_text_color: '#ffffff',
            border_radius: 'rounded-md',
            show_stock_info: true,
            stock_text: 'במלאי - {count} יחידות',
            out_of_stock_text: 'אזל מהמלאי'
          }
        }
      ],
      settings: {}
    };

    res.json(defaultProductPageStructure);
  } catch (error) {
    console.error('Error fetching product page design:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save store product page design
router.post('/:storeSlug/design/product-page', async (req, res) => {
  try {
    const { storeSlug } = req.params;
    const { pageStructure } = req.body;
    
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // For now, we'll just return success
    // In the future, save to database
    console.log(`Saving product page design for store ${storeSlug}:`, pageStructure);
    
    res.json({ 
      success: true, 
      message: 'Product page design saved successfully',
      pageStructure 
    });
  } catch (error) {
    console.error('Error saving product page design:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update store settings (template, design settings, etc.)
router.put('/:storeId/settings', authenticateToken, requireActiveSubscription, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;
    const { templateName, settings } = req.body;

    // Verify user owns the store
    const store = await prisma.store.findFirst({
      where: {
        id: parseInt(storeId),
        userId: userId
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found or access denied' });
    }

    // Validate template name
    const validTemplates = ['jupiter', 'mars', 'venus', 'saturn'];
    if (templateName && !validTemplates.includes(templateName)) {
      return res.status(400).json({ error: 'Invalid template name' });
    }

    // Prepare update data
    const updateData = {};
    if (templateName) {
      updateData.templateName = templateName;
    }
    if (settings) {
      // Merge with existing settings
      updateData.settings = {
        ...store.settings,
        ...settings
      };
    }

    // Update the store
    const updatedStore = await prisma.store.update({
      where: { id: parseInt(storeId) },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        templateName: true,
        settings: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Store settings updated successfully',
      store: updatedStore
    });

  } catch (error) {
    console.error('Error updating store settings:', error);
    res.status(500).json({ 
      error: 'Failed to update store settings',
      message: error.message 
    });
  }
});

export default router
