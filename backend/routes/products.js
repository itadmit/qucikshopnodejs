import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all products for a store
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

    const products = await prisma.product.findMany({
      where: {
        storeId: parseInt(storeId)
      },
      include: {
        category: true,
        media: true,
        variants: {
          include: {
            optionValues: {
              include: {
                option: true
              }
            }
          }
        },
        bundleItems: {
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Get single product
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(id)
      },
      include: {
        store: {
          include: {
            storeUsers: {
              where: {
                userId: userId,
                isActive: true
              }
            }
          }
        },
        category: true,
        media: true,
        options: {
          include: {
            values: true
          }
        },
        variants: {
          include: {
            optionValues: {
              include: {
                option: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.store.storeUsers.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Process options to parse pattern data
    if (product.options) {
      product.options = product.options.map(option => ({
        ...option,
        values: option.values.map(value => ({
          ...value,
          pattern: value.patternData ? JSON.parse(value.patternData) : null,
          mixedColor: value.mixedColorData ? JSON.parse(value.mixedColorData) : null
        }))
      }));
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// Create new product
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // אימות שדות חובה
    if (!req.body.name || req.body.name.trim() === '') {
      return res.status(400).json({ error: 'שם המוצר הוא שדה חובה' });
    }

    if (!req.body.sku || req.body.sku.trim() === '') {
      return res.status(400).json({ error: 'מקט הוא שדה חובה' });
    }

    // אימות מחיר למוצר פשוט
    if (req.body.type === 'SIMPLE') {
      if (req.body.price === undefined || req.body.price === null || req.body.price === '') {
        return res.status(400).json({ error: 'מחיר המוצר הוא שדה חובה' });
      }
      if (parseFloat(req.body.price) < 0) {
        return res.status(400).json({ error: 'מחיר המוצר לא יכול להיות שלילי' });
      }
    }

    // אימות אפשרויות למוצר עם וריאציות
    if (req.body.type === 'VARIABLE') {
      if (!req.body.options || req.body.options.length === 0) {
        return res.status(400).json({ error: 'מוצר עם וריאציות חייב לכלול אפשרויות' });
      }

      if (!req.body.variants || req.body.variants.length === 0) {
        return res.status(400).json({ error: 'מוצר עם וריאציות חייב לכלול וריאציות' });
      }

      // בדיקת מחירי וריאציות
      const emptyPriceVariants = req.body.variants.filter(variant => 
        variant.price === undefined || variant.price === null || variant.price === ''
      );
      
      const negativePriceVariants = req.body.variants.filter(variant => 
        variant.price && parseFloat(variant.price) < 0
      );
      
      if (emptyPriceVariants.length > 0) {
        return res.status(400).json({ error: 'כל הוריאציות חייבות לכלול מחיר' });
      }
      
      if (negativePriceVariants.length > 0) {
        return res.status(400).json({ error: 'מחיר הוריאציות לא יכול להיות שלילי' });
      }
    }

    const {
      storeId,
      name,
      description,
      shortDescription,
      sku,
      type,
      price,
      comparePrice,
      costPrice,
      categoryId,
      trackInventory,
      inventoryQuantity,
      allowBackorder,
      weight,
      requiresShipping,
      isDigital,
      seoTitle,
      seoDescription,
      tags,
      customFields,
      media,
      variants,
      productOptions,
      bundleItems
    } = req.body;

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

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Create product with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create product
      const product = await tx.product.create({
        data: {
          storeId: parseInt(storeId),
          categoryId: categoryId ? parseInt(categoryId) : null,
          name,
          slug,
          description,
          shortDescription,
          sku,
          type: type || 'SIMPLE',
          price: price ? parseFloat(price) : null,
          comparePrice: comparePrice ? parseFloat(comparePrice) : null,
          costPrice: costPrice ? parseFloat(costPrice) : null,
          trackInventory: trackInventory ?? true,
          inventoryQuantity: inventoryQuantity ? parseInt(inventoryQuantity) : 0,
          allowBackorder: allowBackorder ?? false,
          weight: weight ? parseFloat(weight) : null,
          requiresShipping: requiresShipping ?? true,
          isDigital: isDigital ?? false,
          seoTitle,
          seoDescription,
          tags: tags ? JSON.parse(tags) : null,
          customFields: customFields ? JSON.stringify(customFields) : null
        }
      });

      // Create product options if provided
      if (productOptions && Array.isArray(productOptions)) {
        for (const option of productOptions) {
          const createdOption = await tx.productOption.create({
            data: {
              storeId: parseInt(storeId),
              name: option.name,
              type: option.type,
              displayType: option.displayType,
              sortOrder: option.sortOrder || 0
            }
          });

          // Create option values
          if (option.values && Array.isArray(option.values)) {
            for (const value of option.values) {
              await tx.productOptionValue.create({
                data: {
                  optionId: createdOption.id,
                  value: value.value,
                  colorCode: value.colorCode,
                  imageUrl: value.imageUrl,
                  patternData: value.pattern ? JSON.stringify(value.pattern) : null,
                  mixedColorData: value.mixedColor ? JSON.stringify(value.mixedColor) : null,
                  sortOrder: value.sortOrder || 0
                }
              });
            }
          }
        }
      }

      // Create media if provided
      if (media && Array.isArray(media)) {
        for (const mediaItem of media) {
          await tx.productMedia.create({
            data: {
              productId: product.id,
              url: mediaItem.url,
              type: mediaItem.type,
              altText: mediaItem.altText || '',
              isPrimary: mediaItem.isPrimary || false,
              sortOrder: mediaItem.sortOrder || 0
            }
          });
        }
      }

      // Create variants if provided
      if (variants && Array.isArray(variants)) {
        for (const variant of variants) {
          const createdVariant = await tx.productVariant.create({
            data: {
              productId: product.id,
              sku: variant.sku,
              price: variant.price ? parseFloat(variant.price) : null,
              comparePrice: variant.comparePrice ? parseFloat(variant.comparePrice) : null,
              costPrice: variant.costPrice ? parseFloat(variant.costPrice) : null,
              inventoryQuantity: variant.inventoryQuantity ? parseInt(variant.inventoryQuantity) : 0,
              weight: variant.weight ? parseFloat(variant.weight) : null,
              isActive: variant.isActive ?? true
            }
          });

          // Create variant option values
          if (variant.optionValues && Array.isArray(variant.optionValues)) {
            for (const optionValue of variant.optionValues) {
              await tx.productVariantOptionValue.create({
                data: {
                  variantId: createdVariant.id,
                  optionValueId: optionValue.valueId,
                  value: optionValue.value
                }
              });
            }
          }
        }
      }

      // Create bundle items if this is a bundle product
      if (type === 'BUNDLE' && bundleItems && Array.isArray(bundleItems)) {
        for (const bundleItem of bundleItems) {
          await tx.bundleItem.create({
            data: {
              bundleId: product.id,
              productId: parseInt(bundleItem.productId),
              variantId: bundleItem.variantId ? parseInt(bundleItem.variantId) : null,
              quantity: bundleItem.quantity || 1,
              sortOrder: bundleItem.sortOrder || 0,
              isOptional: bundleItem.isOptional || false,
              discountType: bundleItem.discountType || null,
              discountValue: bundleItem.discountValue ? parseFloat(bundleItem.discountValue) : null
            }
          });
        }
      }

      return product;
    });

    res.json({
      success: true,
      data: result,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Verify user has access to this product's store
    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(id)
      },
      include: {
        store: {
          include: {
            storeUsers: {
              where: {
                userId: userId,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.store.storeUsers.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: {
        id: parseInt(id)
      },
      data: {
        name: updateData.name,
        description: updateData.description,
        shortDescription: updateData.shortDescription,
        sku: updateData.sku,
        price: updateData.price ? parseFloat(updateData.price) : null,
        comparePrice: updateData.comparePrice ? parseFloat(updateData.comparePrice) : null,
        costPrice: updateData.costPrice ? parseFloat(updateData.costPrice) : null,
        categoryId: updateData.categoryId ? parseInt(updateData.categoryId) : null,
        trackInventory: updateData.trackInventory,
        inventoryQuantity: updateData.inventoryQuantity ? parseInt(updateData.inventoryQuantity) : 0,
        allowBackorder: updateData.allowBackorder,
        weight: updateData.weight ? parseFloat(updateData.weight) : null,
        requiresShipping: updateData.requiresShipping,
        isDigital: updateData.isDigital,
        seoTitle: updateData.seoTitle,
        seoDescription: updateData.seoDescription,
        tags: updateData.tags ? JSON.parse(updateData.tags) : null,
        customFields: updateData.customFields ? JSON.stringify(updateData.customFields) : null
      }
    });

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify user has access to this product's store
    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(id)
      },
      include: {
        store: {
          include: {
            storeUsers: {
              where: {
                userId: userId,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.store.storeUsers.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete product (cascade will handle related records)
    await prisma.product.delete({
      where: {
        id: parseInt(id)
      }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Helper function to calculate bundle availability
async function calculateBundleAvailability(bundleId) {
  const bundleItems = await prisma.bundleItem.findMany({
    where: {
      bundleId: parseInt(bundleId)
    },
    include: {
      product: true,
      variant: true
    }
  });

  let maxAvailableQuantity = Infinity;

  for (const item of bundleItems) {
    if (item.isOptional) continue; // Skip optional items

    let itemAvailability = 0;
    
    if (item.variant) {
      // Use variant inventory
      itemAvailability = item.variant.inventoryQuantity;
    } else {
      // Use product inventory
      itemAvailability = item.product.inventoryQuantity;
    }

    // Calculate how many bundles we can make with this item
    const bundlesFromThisItem = Math.floor(itemAvailability / item.quantity);
    maxAvailableQuantity = Math.min(maxAvailableQuantity, bundlesFromThisItem);
  }

  return maxAvailableQuantity === Infinity ? 0 : maxAvailableQuantity;
}

// API endpoint to get bundle availability
router.get('/:id/bundle-availability', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify user has access to this product's store
    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(id),
        type: 'BUNDLE'
      },
      include: {
        store: {
          include: {
            storeUsers: {
              where: {
                userId: userId,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Bundle product not found' });
    }

    if (product.store.storeUsers.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const availability = await calculateBundleAvailability(id);

    res.json({
      success: true,
      data: {
        productId: parseInt(id),
        availableQuantity: availability,
        inStock: availability > 0
      }
    });
  } catch (error) {
    console.error('Bundle availability error:', error);
    res.status(500).json({ error: 'Failed to calculate bundle availability' });
  }
});

// Helper function to reduce inventory for bundle items
async function reduceBundleInventory(bundleId, quantity = 1) {
  const bundleItems = await prisma.bundleItem.findMany({
    where: {
      bundleId: parseInt(bundleId)
    },
    include: {
      product: true,
      variant: true
    }
  });

  const updates = [];

  for (const item of bundleItems) {
    const reduceBy = item.quantity * quantity;

    if (item.variant) {
      // Update variant inventory
      updates.push(
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            inventoryQuantity: {
              decrement: reduceBy
            }
          }
        })
      );
    } else {
      // Update product inventory
      updates.push(
        prisma.product.update({
          where: { id: item.productId },
          data: {
            inventoryQuantity: {
              decrement: reduceBy
            }
          }
        })
      );
    }
  }

  // Execute all updates in transaction
  await prisma.$transaction(updates);
}

// API endpoint to reduce bundle inventory (for order processing)
router.post('/:id/reduce-inventory', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;
    const userId = req.user.id;

    // Verify user has access to this product's store
    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(id),
        type: 'BUNDLE'
      },
      include: {
        store: {
          include: {
            storeUsers: {
              where: {
                userId: userId,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Bundle product not found' });
    }

    if (product.store.storeUsers.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check availability before reducing
    const availability = await calculateBundleAvailability(id);
    if (availability < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient inventory',
        available: availability,
        requested: quantity
      });
    }

    await reduceBundleInventory(id, quantity);

    res.json({
      success: true,
      message: `Inventory reduced for bundle ${id}`,
      data: {
        productId: parseInt(id),
        quantityReduced: quantity
      }
    });
  } catch (error) {
    console.error('Reduce bundle inventory error:', error);
    res.status(500).json({ error: 'Failed to reduce bundle inventory' });
  }
});

// Get all categories for a store
router.get('/categories', authenticateToken, async (req, res) => {
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

    // Get unique categories from products
    const products = await prisma.product.findMany({
      where: {
        storeId: parseInt(storeId),
        category: {
          not: null
        }
      },
      select: {
        category: true
      },
      distinct: ['category']
    });

    // Format categories with IDs (using category name as ID for now)
    const categories = products
      .filter(p => p.category)
      .map((p, index) => ({
        id: p.category, // Using category name as ID
        name: p.category
      }));

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router; 