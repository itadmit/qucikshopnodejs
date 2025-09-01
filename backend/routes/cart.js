import express from 'express';
import { requireStoreAccess } from '../middleware/unified-auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Add item to cart
router.post('/add', requireStoreAccess, async (req, res) => {
  try {
    const store = req.currentStore;
    const { productId, variantId, quantity = 1, options = {} } = req.body;

    // Validate input
    if (!productId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'מזהה מוצר נדרש'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'כמות חייבת להיות גדולה מאפס'
      });
    }

    // Get product with all necessary data
    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(productId),
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
        },
        variants: {
          include: {
            optionValues: {
              include: {
                option: true,
                optionValue: true
              }
            }
          }
        },
        options: {
          include: {
            values: true
          }
        },
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
    });

    if (!product) {
      return res.status(404).json({
        error: 'Not found',
        message: 'המוצר לא נמצא'
      });
    }

    // Check inventory for simple products
    if (product.type === 'SIMPLE') {
      if (product.trackInventory && product.inventoryQuantity < quantity) {
        return res.status(400).json({
          error: 'Out of stock',
          message: 'אין מספיק מלאי למוצר זה'
        });
      }
    }

    // Handle variant products
    let selectedVariant = null;
    if (product.type === 'VARIABLE') {
      if (!variantId) {
        return res.status(400).json({
          error: 'Bad request',
          message: 'נדרש לבחור וריאציה למוצר זה'
        });
      }

      selectedVariant = product.variants.find(v => v.id === parseInt(variantId));
      if (!selectedVariant) {
        return res.status(404).json({
          error: 'Not found',
          message: 'הוריאציה לא נמצאה'
        });
      }

      // Check variant inventory
      if (product.trackInventory && selectedVariant.inventoryQuantity < quantity) {
        return res.status(400).json({
          error: 'Out of stock',
          message: 'אין מספיק מלאי לוריאציה זו'
        });
      }
    }

    // Handle bundle products
    if (product.type === 'BUNDLE') {
      // Check availability of all bundle items
      for (const bundleItem of product.bundleItems) {
        if (bundleItem.isOptional) continue;
        
        const requiredQuantity = bundleItem.quantity * quantity;
        
        if (bundleItem.variant) {
          if (bundleItem.product.trackInventory && bundleItem.variant.inventoryQuantity < requiredQuantity) {
            return res.status(400).json({
              error: 'Out of stock',
              message: `אין מספיק מלאי עבור ${bundleItem.product.name}`
            });
          }
        } else {
          if (bundleItem.product.trackInventory && bundleItem.product.inventoryQuantity < requiredQuantity) {
            return res.status(400).json({
              error: 'Out of stock',
              message: `אין מספיק מלאי עבור ${bundleItem.product.name}`
            });
          }
        }
      }
    }

    // Calculate price
    let itemPrice = parseFloat(product.price);
    if (selectedVariant && selectedVariant.price) {
      itemPrice = parseFloat(selectedVariant.price);
    }

    // Prepare cart item data
    const cartItem = {
      productId: product.id,
      variantId: selectedVariant?.id || null,
      name: product.name,
      price: itemPrice,
      quantity: quantity,
      imageUrl: product.media[0]?.media?.s3Url || null,
      options: selectedVariant ? 
        selectedVariant.optionValues.reduce((acc, ov) => {
          acc[ov.option.name] = ov.optionValue.value;
          return acc;
        }, {}) : options,
      type: product.type,
      sku: selectedVariant?.sku || product.sku,
      storeSlug: store.slug
    };

    // For bundle products, include bundle items
    if (product.type === 'BUNDLE') {
      cartItem.bundleItems = product.bundleItems.map(bundleItem => ({
        productId: bundleItem.product.id,
        variantId: bundleItem.variant?.id || null,
        name: bundleItem.product.name,
        price: bundleItem.variant?.price || bundleItem.product.price,
        quantity: bundleItem.quantity,
        imageUrl: bundleItem.product.media[0]?.media?.s3Url || null,
        isOptional: bundleItem.isOptional,
        options: bundleItem.variant ? 
          bundleItem.variant.optionValues.reduce((acc, ov) => {
            acc[ov.option.name] = ov.optionValue.value;
            return acc;
          }, {}) : {}
      }));
    }

    res.json({
      success: true,
      message: `${product.name} נוסף לעגלה בהצלחה`,
      item: cartItem
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'שגיאה בהוספה לעגלה'
    });
  }
});

// Get cart items with updated prices and availability
router.post('/validate', requireStoreAccess, async (req, res) => {
  try {
    const store = req.currentStore;
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'רשימת פריטים נדרשת'
      });
    }

    const validatedItems = [];
    const errors = [];

    for (const item of items) {
      try {
        // Get current product data
        const product = await prisma.product.findFirst({
          where: {
            id: parseInt(item.productId),
            storeId: store.id,
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
            },
            variants: {
              where: item.variantId ? { id: parseInt(item.variantId) } : undefined,
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
        });

        if (!product) {
          errors.push({
            productId: item.productId,
            message: `המוצר ${item.name} לא נמצא או לא זמין`
          });
          continue;
        }

        let currentPrice = parseFloat(product.price);
        let availableQuantity = product.inventoryQuantity;
        let isAvailable = true;

        // Handle variants
        if (item.variantId && product.variants.length > 0) {
          const variant = product.variants[0];
          if (variant.price) {
            currentPrice = parseFloat(variant.price);
          }
          availableQuantity = variant.inventoryQuantity;
        }

        // Check availability
        if (product.trackInventory && availableQuantity < item.quantity) {
          isAvailable = false;
          errors.push({
            productId: item.productId,
            variantId: item.variantId,
            message: `אין מספיק מלאי עבור ${product.name}. זמין: ${availableQuantity}`
          });
        }

        validatedItems.push({
          ...item,
          currentPrice,
          availableQuantity,
          isAvailable,
          priceChanged: Math.abs(currentPrice - item.price) > 0.01,
          imageUrl: product.media[0]?.media?.s3Url || item.imageUrl
        });

      } catch (itemError) {
        console.error('Error validating item:', itemError);
        errors.push({
          productId: item.productId,
          message: `שגיאה בבדיקת ${item.name}`
        });
      }
    }

    res.json({
      success: true,
      items: validatedItems,
      errors: errors.length > 0 ? errors : null
    });

  } catch (error) {
    console.error('Cart validation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'שגיאה בבדיקת העגלה'
    });
  }
});

// Calculate cart totals with discounts
router.post('/calculate', requireStoreAccess, async (req, res) => {
  try {
    const store = req.currentStore;
    const { items, couponCode } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'רשימת פריטים נדרשת'
      });
    }

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // TODO: Implement discount calculation
    // This should integrate with the existing discountService
    const discounts = [];
    let discountAmount = 0;

    // Calculate shipping
    const shippingSettings = store.settings?.shipping || {
      freeShippingThreshold: 200,
      defaultRate: 25
    };

    const shipping = subtotal >= shippingSettings.freeShippingThreshold ? 0 : shippingSettings.defaultRate;
    
    const total = subtotal - discountAmount + shipping;

    res.json({
      success: true,
      subtotal,
      discounts,
      discountAmount,
      shipping,
      total,
      freeShippingThreshold: shippingSettings.freeShippingThreshold,
      amountForFreeShipping: Math.max(0, shippingSettings.freeShippingThreshold - subtotal)
    });

  } catch (error) {
    console.error('Cart calculation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'שגיאה בחישוב העגלה'
    });
  }
});

export default router;
