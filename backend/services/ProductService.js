import { PrismaClient } from '@prisma/client';
import systemEvents from './EventEmitter.js';

const prisma = new PrismaClient();

/**
 * שירות מרכזי לניהול מוצרים
 * מטפל בכל הלוגיקה העסקית של יצירת, עדכון ומחיקת מוצרים
 */
export class ProductService {

  /**
   * יצירת מוצר חדש
   */
  static async createProduct(productData, userId) {
    console.log('📦 Creating new product:', productData.name);

    return await prisma.$transaction(async (tx) => {
      // בדיקת הרשאות
      await this.verifyStoreAccess(productData.storeId, userId, tx);

      // יצירת slug ייחודי
      const slug = await this.generateUniqueSlug(productData.name, productData.storeId, tx);

      // יצירת המוצר
      const product = await tx.product.create({
        data: {
          storeId: parseInt(productData.storeId),
          categoryId: productData.categoryId ? parseInt(productData.categoryId) : null,
          name: productData.name,
          slug,
          description: productData.description,
          shortDescription: productData.shortDescription,
          sku: productData.sku,
          type: productData.type || 'SIMPLE',
          status: productData.status || 'DRAFT',
          price: productData.price ? parseFloat(productData.price) : null,
          comparePrice: productData.comparePrice ? parseFloat(productData.comparePrice) : null,
          costPrice: productData.costPrice ? parseFloat(productData.costPrice) : null,
          trackInventory: productData.trackInventory ?? true,
          inventoryQuantity: productData.inventoryQuantity ? parseInt(productData.inventoryQuantity) : 0,
          allowBackorder: productData.allowBackorder ?? false,
          weight: productData.weight ? parseFloat(productData.weight) : null,
          dimensions: productData.dimensions || null,
          requiresShipping: productData.requiresShipping ?? true,
          isDigital: productData.isDigital ?? false,
          seoTitle: productData.seoTitle,
          seoDescription: productData.seoDescription,
          tags: productData.tags || null,
          customFields: productData.customFields || null,
          sortOrder: productData.sortOrder || 0
        }
      });

      // יצירת אפשרויות מוצר
      if (productData.productOptions && productData.productOptions.length > 0) {
        await this.createProductOptions(product.id, productData.productOptions, tx);
      }

      // יצירת variants
      if (productData.variants && productData.variants.length > 0) {
        await this.createProductVariants(product.id, productData.variants, tx);
      }

      // יצירת קשרי מדיה
      if (productData.media && productData.media.length > 0) {
        await this.createProductMedia(product.id, productData.media, tx);
      }

      // יצירת Bundle items
      if (productData.type === 'BUNDLE' && productData.bundleItems && productData.bundleItems.length > 0) {
        await this.createBundleItems(product.id, productData.bundleItems, tx);
      }

      // הפעלת אירוע
      systemEvents.emitEvent('product.created', {
        product,
        createdBy: userId
      });

      console.log('✅ Product created successfully:', product.id);
      return await this.getProductById(product.id);
    });
  }

  /**
   * עדכון מוצר קיים
   */
  static async updateProduct(productId, productData, userId) {
    console.log('📝 Updating product:', productId);

    return await prisma.$transaction(async (tx) => {
      // קבלת המוצר הקיים
      const existingProduct = await tx.product.findUnique({
        where: { id: productId },
        include: {
          options: true,
          variants: true,
          media: true,
          bundleItems: true
        }
      });

      if (!existingProduct) {
        throw new Error('Product not found');
      }

      // בדיקת הרשאות
      await this.verifyStoreAccess(existingProduct.storeId, userId, tx);

      // עדכון slug אם השם השתנה
      let slug = existingProduct.slug;
      if (productData.name && productData.name !== existingProduct.name) {
        slug = await this.generateUniqueSlug(productData.name, existingProduct.storeId, tx, productId);
      }

      // עדכון המוצר
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          name: productData.name || existingProduct.name,
          slug,
          description: productData.description ?? existingProduct.description,
          shortDescription: productData.shortDescription ?? existingProduct.shortDescription,
          sku: productData.sku ?? existingProduct.sku,
          type: productData.type || existingProduct.type,
          status: productData.status || existingProduct.status,
          price: productData.price !== undefined ? (productData.price ? parseFloat(productData.price) : null) : existingProduct.price,
          comparePrice: productData.comparePrice !== undefined ? (productData.comparePrice ? parseFloat(productData.comparePrice) : null) : existingProduct.comparePrice,
          costPrice: productData.costPrice !== undefined ? (productData.costPrice ? parseFloat(productData.costPrice) : null) : existingProduct.costPrice,
          trackInventory: productData.trackInventory ?? existingProduct.trackInventory,
          inventoryQuantity: productData.inventoryQuantity !== undefined ? parseInt(productData.inventoryQuantity) : existingProduct.inventoryQuantity,
          allowBackorder: productData.allowBackorder ?? existingProduct.allowBackorder,
          weight: productData.weight !== undefined ? (productData.weight ? parseFloat(productData.weight) : null) : existingProduct.weight,
          dimensions: productData.dimensions ?? existingProduct.dimensions,
          requiresShipping: productData.requiresShipping ?? existingProduct.requiresShipping,
          isDigital: productData.isDigital ?? existingProduct.isDigital,
          seoTitle: productData.seoTitle ?? existingProduct.seoTitle,
          seoDescription: productData.seoDescription ?? existingProduct.seoDescription,
          tags: productData.tags ?? existingProduct.tags,
          customFields: productData.customFields ?? existingProduct.customFields,
          sortOrder: productData.sortOrder ?? existingProduct.sortOrder
        }
      });

      // עדכון אפשרויות אם סופקו
      if (productData.productOptions !== undefined) {
        await this.updateProductOptions(productId, productData.productOptions, tx);
      }

      // עדכון variants אם סופקו
      if (productData.variants !== undefined) {
        await this.updateProductVariants(productId, productData.variants, tx);
      }

      // עדכון מדיה אם סופקה
      if (productData.media !== undefined) {
        await this.updateProductMedia(productId, productData.media, tx);
      }

      // עדכון Bundle items אם סופקו
      if (productData.bundleItems !== undefined) {
        await this.updateBundleItems(productId, productData.bundleItems, tx);
      }

      // הפעלת אירוע
      systemEvents.emitEvent('product.updated', {
        product: updatedProduct,
        previousData: existingProduct,
        updatedBy: userId
      });

      console.log('✅ Product updated successfully:', productId);
      return await this.getProductById(productId);
    });
  }

  /**
   * מחיקת מוצר
   */
  static async deleteProduct(productId, userId) {
    console.log('🗑️ Deleting product:', productId);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orderItems: true,
        bundleItems: true,
        bundleParents: true
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // בדיקת הרשאות
    await this.verifyStoreAccess(product.storeId, userId);

    // בדיקה אם המוצר בשימוש בהזמנות
    if (product.orderItems.length > 0) {
      throw new Error('Cannot delete product that has been ordered');
    }

    // בדיקה אם המוצר חלק מ-Bundle
    if (product.bundleParents.length > 0) {
      throw new Error('Cannot delete product that is part of a bundle');
    }

    await prisma.product.delete({
      where: { id: productId }
    });

    // הפעלת אירוע
    systemEvents.emitEvent('product.deleted', {
      product,
      deletedBy: userId
    });

    console.log('✅ Product deleted successfully:', productId);
  }

  /**
   * קבלת מוצר לפי ID
   */
  static async getProductById(productId) {
    return await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        media: {
          include: {
            media: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        options: {
          include: {
            values: {
              orderBy: {
                sortOrder: 'asc'
              }
            }
          },
          orderBy: {
            position: 'asc'
          }
        },
        variants: {
          include: {
            optionValues: {
              include: {
                option: true,
                optionValue: true
              }
            },
            media: {
              include: {
                media: true
              }
            }
          }
        },
        bundleItems: {
          include: {
            product: {
              include: {
                media: {
                  where: {
                    isPrimary: true
                  },
                  include: {
                    media: true
                  },
                  take: 1
                }
              }
            },
            variant: true
          }
        }
      }
    });
  }

  /**
   * קבלת מוצרים לפי חנות
   */
  static async getProductsByStore(storeId, options = {}) {
    const {
      limit = 50,
      offset = 0,
      status = null,
      categoryId = null,
      search = null,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const where = { storeId };

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    return await prisma.product.findMany({
      where,
      include: {
        category: true,
        media: {
          where: {
            isPrimary: true
          },
          include: {
            media: true
          },
          take: 1
        },
        variants: {
          select: {
            id: true,
            price: true,
            inventoryQuantity: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      take: limit,
      skip: offset
    });
  }

  /**
   * בדיקת הרשאות גישה לחנות
   */
  static async verifyStoreAccess(storeId, userId, tx = prisma) {
    const storeUser = await tx.storeUser.findFirst({
      where: {
        storeId: parseInt(storeId),
        userId: userId,
        isActive: true
      }
    });

    if (!storeUser) {
      throw new Error('Access denied to store');
    }

    return storeUser;
  }

  /**
   * יצירת slug ייחודי
   */
  static async generateUniqueSlug(name, storeId, tx = prisma, excludeId = null) {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const where = {
        storeId: parseInt(storeId),
        slug
      };

      if (excludeId) {
        where.id = { not: excludeId };
      }

      const existing = await tx.product.findFirst({ where });

      if (!existing) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * יצירת אפשרויות מוצר
   */
  static async createProductOptions(productId, options, tx = prisma) {
    for (const option of options) {
      const createdOption = await tx.productOption.create({
        data: {
          productId,
          name: option.name,
          type: option.type || 'TEXT',
          displayType: option.displayType || 'DROPDOWN',
          position: option.position || 0
        }
      });

      if (option.values && option.values.length > 0) {
        await tx.productOptionValue.createMany({
          data: option.values.map((value, index) => ({
            optionId: createdOption.id,
            value: value.value,
            colorCode: value.colorCode,
            imageUrl: value.imageUrl,
            sortOrder: index
          }))
        });
      }
    }
  }

  /**
   * יצירת variants למוצר
   */
  static async createProductVariants(productId, variants, tx = prisma) {
    for (const variant of variants) {
      await tx.productVariant.create({
        data: {
          productId,
          sku: variant.sku,
          price: variant.price ? parseFloat(variant.price) : null,
          comparePrice: variant.comparePrice ? parseFloat(variant.comparePrice) : null,
          costPrice: variant.costPrice ? parseFloat(variant.costPrice) : null,
          inventoryQuantity: variant.inventoryQuantity || 0,
          weight: variant.weight ? parseFloat(variant.weight) : null,
          isActive: variant.isActive ?? true
        }
      });
    }
  }

  /**
   * יצירת קשרי מדיה למוצר
   */
  static async createProductMedia(productId, mediaItems, tx = prisma) {
    for (const [index, mediaItem] of mediaItems.entries()) {
      await tx.productMedia.create({
        data: {
          productId,
          mediaId: mediaItem.mediaId,
          variantId: mediaItem.variantId || null,
          type: mediaItem.type || 'IMAGE',
          altText: mediaItem.altText,
          sortOrder: index,
          isPrimary: index === 0,
          colorOptionValueId: mediaItem.colorOptionValueId || null
        }
      });
    }
  }

  /**
   * יצירת Bundle items
   */
  static async createBundleItems(bundleId, bundleItems, tx = prisma) {
    for (const item of bundleItems) {
      await tx.bundleItem.create({
        data: {
          bundleId,
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity || 1,
          sortOrder: item.sortOrder || 0,
          isOptional: item.isOptional || false,
          discountType: item.discountType || null,
          discountValue: item.discountValue || null
        }
      });
    }
  }

  // TODO: יישום פונקציות עדכון (updateProductOptions, updateProductVariants, etc.)
}
