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
    const {
      storeId,
      name,
      description,
      shortDescription,
      sku,
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
      productOptions
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
          customFields: customFields || null
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
                  optionValueId: optionValue.valueId
                }
              });
            }
          }
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
        tags: updateData.tags ? JSON.parse(updateData.tags) : null
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

export default router; 