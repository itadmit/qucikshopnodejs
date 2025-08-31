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

    // Verify user has access to this store (either as owner or store user)
    const store = await prisma.store.findFirst({
      where: {
        id: parseInt(storeId),
        userId: userId // Check if user is owner
      }
    });

    if (!store) {
      // If not owner, check if user is a store user
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
    }

    const products = await prisma.product.findMany({
      where: {
        storeId: parseInt(storeId)
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        status: true,
        price: true,
        inventoryQuantity: true,
        type: true,
        createdAt: true,
        category: {
          select: {
            name: true
          }
        },
        media: {
          select: {
            media: {
              select: {
                s3Url: true
              }
            }
          },
          where: {
            isPrimary: true
          },
          take: 1
        },
        _count: {
          select: {
            variants: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Limit to 100 products for now
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
  console.log('🔍 GET /products/:id route hit!', { id: req.params.id });
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(id)
      },
      include: {
        store: true,
        category: true,
        media: {
          include: {
            media: true
          }
        },
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

    // Check if user is owner of the store
    if (product.store.userId !== userId) {
      // If not owner, check if user is a store user
      const storeUser = await prisma.storeUser.findFirst({
        where: {
          storeId: product.storeId,
          userId: userId,
          isActive: true
        }
      });
      
      if (!storeUser) {
        return res.status(403).json({ error: 'Access denied' });
      }
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

    // Validate description size to prevent performance issues
    if (req.body.description && req.body.description.length > 50000) {
      return res.status(400).json({ 
        error: 'תיאור המוצר ארוך מדי. מקסימום 50,000 תווים מותר.' 
      });
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

    // Verify user has access to this store (either as owner or store user)
    const store = await prisma.store.findFirst({
      where: {
        id: parseInt(storeId),
        userId: userId // Check if user is owner
      }
    });

    if (!store) {
      // If not owner, check if user is a store user
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
    }

    // Generate slug from name
    let slug = name.toLowerCase()
      .replace(/[^a-z0-9\u0590-\u05FF\s-]/g, '') // Include Hebrew characters
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // If slug is empty or invalid, use product ID
    if (!slug || slug.length < 2) {
      slug = `product-${Date.now()}`;
    }

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
          tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : null,
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
        for (let i = 0; i < media.length; i++) {
          const mediaItem = media[i];
          
          // First find or create the media record
          let mediaRecord = await tx.media.findFirst({
            where: {
              s3Url: mediaItem.url,
              storeId: product.storeId
            }
          });

          if (!mediaRecord) {
            mediaRecord = await tx.media.create({
              data: {
                storeId: product.storeId,
                filename: mediaItem.filename || `image-${i}.webp`,
                originalFilename: mediaItem.originalName || `image-${i}`,
                mimeType: mediaItem.mimeType || 'image/webp',
                fileSize: mediaItem.size || 0,
                s3Key: mediaItem.key || mediaItem.s3Key || '',
                s3Url: mediaItem.url,
                altText: mediaItem.altText || ''
              }
            });
          }

          // Then create the product-media relationship
          await tx.productMedia.create({
            data: {
              productId: product.id,
              mediaId: mediaRecord.id,
              type: mediaItem.type || 'IMAGE',
              altText: mediaItem.altText || '',
              isPrimary: mediaItem.isPrimary || i === 0,
              sortOrder: mediaItem.sortOrder || i
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
    console.error('❌ Create product error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({ error: 'Failed to create product', details: error.message });
  }
});

// Update product
router.put('/:id', authenticateToken, async (req, res) => {
  console.log('🚀 PUT /products/:id route hit!', { id: req.params.id });
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;
    
    console.log('📝 Update data received:', JSON.stringify(updateData, null, 2));

    // Validate description size to prevent performance issues
    if (updateData.description && updateData.description.length > 50000) {
      return res.status(400).json({ 
        error: 'תיאור המוצר ארוך מדי. מקסימום 50,000 תווים מותר.' 
      });
    }

    console.log('🔄 Update product request:', { productId: id, userId });

    // Verify user has access to this product's store
    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(id)
      },
      include: {
        store: true
      }
    });

    console.log('📦 Product found:', product ? {
      id: product.id,
      name: product.name,
      storeId: product.storeId,
      store: {
        id: product.store.id,
        userId: product.store.userId,
        name: product.store.name
      }
    } : null);

    if (!product) {
      console.log('❌ Product not found');
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user is store owner OR has store user access
    const isStoreOwner = product.store.userId === userId;
    let hasStoreUserAccess = false;
    
    console.log('🔍 Checking access:', { 
      userId, 
      storeUserId: product.store.userId, 
      isStoreOwner 
    });
    
    if (!isStoreOwner) {
      const storeUser = await prisma.storeUser.findFirst({
        where: {
          storeId: product.storeId,
          userId: userId,
          isActive: true
        }
      });
      hasStoreUserAccess = !!storeUser;
      console.log('👥 Store user check:', { storeUser, hasStoreUserAccess });
    }

    if (!isStoreOwner && !hasStoreUserAccess) {
      console.log('❌ Access denied - user has no access to store');
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log('✅ Access granted - proceeding with update');

    // Generate new slug if name is being updated
    let newSlug = undefined;
    if (updateData.name) {
      newSlug = updateData.name.toLowerCase()
        .replace(/[^a-z0-9\u0590-\u05FF\s-]/g, '') // Include Hebrew characters
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      // If slug is empty or invalid, use product ID
      if (!newSlug || newSlug.length < 2) {
        newSlug = `product-${id}`;
      }
    }

    // Update product using transaction to handle media
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update basic product data
      const product = await tx.product.update({
        where: {
          id: parseInt(id)
        },
        data: {
          name: updateData.name,
          ...(newSlug && { slug: newSlug }),
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
          tags: updateData.tags ? (typeof updateData.tags === 'string' ? JSON.parse(updateData.tags) : updateData.tags) : null,
          status: updateData.status || 'DRAFT',
          customFields: updateData.customFields ? JSON.stringify(updateData.customFields) : null
        }
      });

      // Handle media updates if provided
      if (updateData.images && Array.isArray(updateData.images)) {
        console.log('🖼️ Processing media updates for product:', id);
        console.log('📸 Images data:', JSON.stringify(updateData.images, null, 2));
        
        // Delete existing product media relationships
        await tx.productMedia.deleteMany({
          where: { productId: parseInt(id) }
        });
        console.log('🗑️ Deleted existing product media');

        // Create new media and link to product
        for (let i = 0; i < updateData.images.length; i++) {
          const mediaItem = updateData.images[i];
          console.log(`📷 Processing image ${i + 1}:`, mediaItem);
          
          try {
            // First find or create the media record
            let media = await tx.media.findFirst({
              where: {
                s3Url: mediaItem.url,
                storeId: product.storeId
              }
            });

            if (!media) {
              media = await tx.media.create({
                data: {
                  storeId: product.storeId,
                  filename: mediaItem.filename || `image-${i}.webp`,
                  originalFilename: mediaItem.originalName || `image-${i}`,
                  mimeType: mediaItem.mimeType || 'image/webp',
                  fileSize: mediaItem.size || 0,
                  s3Key: mediaItem.key || mediaItem.s3Key || '',
                  s3Url: mediaItem.url,
                  altText: mediaItem.altText || ''
                }
              });
              console.log('✅ Created new media record:', media.id);
            } else {
              console.log('✅ Found existing media record:', media.id);
            }

            // Then create the product-media relationship
            await tx.productMedia.create({
              data: {
                productId: parseInt(id),
                mediaId: media.id,
                type: mediaItem.type || 'IMAGE',
                altText: mediaItem.altText || '',
                isPrimary: i === 0, // First image is primary
                sortOrder: i
              }
            });
            console.log('✅ Created product-media relationship');
          } catch (mediaError) {
            console.error(`❌ Error processing image ${i + 1}:`, mediaError);
            throw mediaError;
          }
        }
      }

      return product;
    });

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('❌ Update product error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    res.status(500).json({ error: 'Failed to update product', details: error.message });
  }
});

// Delete product
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // First get the product
    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(id)
      },
      include: {
        store: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Verify user has access to this product's store (either as owner or store user)
    const isStoreOwner = product.store.userId === userId;
    let hasStoreUserAccess = false;
    
    if (!isStoreOwner) {
      const storeUser = await prisma.storeUser.findFirst({
        where: {
          storeId: product.storeId,
          userId: userId,
          isActive: true
        }
      });
      hasStoreUserAccess = !!storeUser;
    }

    if (!isStoreOwner && !hasStoreUserAccess) {
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
        store: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Bundle product not found' });
    }

    // Check if user is store owner OR has store user access
    const isStoreOwner = product.store.userId === userId;
    let hasStoreUserAccess = false;
    
    if (!isStoreOwner) {
      const storeUser = await prisma.storeUser.findFirst({
        where: {
          storeId: product.storeId,
          userId: userId,
          isActive: true
        }
      });
      hasStoreUserAccess = !!storeUser;
    }

    if (!isStoreOwner && !hasStoreUserAccess) {
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
        store: true
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Bundle product not found' });
    }

    // Check if user is store owner OR has store user access
    const isStoreOwner = product.store.userId === userId;
    let hasStoreUserAccess = false;
    
    if (!isStoreOwner) {
      const storeUser = await prisma.storeUser.findFirst({
        where: {
          storeId: product.storeId,
          userId: userId,
          isActive: true
        }
      });
      hasStoreUserAccess = !!storeUser;
    }

    if (!isStoreOwner && !hasStoreUserAccess) {
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

    // Verify user has access to this store (either as owner or store user)
    const store = await prisma.store.findFirst({
      where: {
        id: parseInt(storeId),
        userId: userId // Check if user is owner
      }
    });

    if (!store) {
      // If not owner, check if user is a store user
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