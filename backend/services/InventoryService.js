import { PrismaClient } from '@prisma/client';
import systemEvents from './EventEmitter.js';

const prisma = new PrismaClient();

/**
 * שירות ניהול מלאי
 * מטפל בכל הלוגיקה של עדכון מלאי, בדיקת זמינות ואזהרות מלאי נמוך
 */
export class InventoryService {

  /**
   * עדכון מלאי לאחר יצירת הזמנה
   * @param {Array} items - פריטי ההזמנה
   */
  static async updateStockForOrder(items) {
    console.log('📦 Updating inventory for order items:', items.length);

    const updates = [];

    for (const item of items) {
      try {
        if (item.variantId) {
          // עדכון מלאי של variant
          const variant = await prisma.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true }
          });

          if (variant && variant.product.trackInventory) {
            updates.push(
              prisma.productVariant.update({
                where: { id: item.variantId },
                data: {
                  inventoryQuantity: {
                    decrement: item.quantity
                  }
                }
              })
            );

            // בדיקת מלאי נמוך לאחר העדכון
            const newQuantity = variant.inventoryQuantity - item.quantity;
            if (newQuantity <= 5) { // סף מלאי נמוך
              systemEvents.emitEvent('inventory.low_stock', {
                type: 'variant',
                variantId: item.variantId,
                productId: variant.productId,
                productName: variant.product.name,
                currentQuantity: newQuantity,
                storeId: variant.product.storeId
              });
            }
          }
        } else {
          // עדכון מלאי של מוצר רגיל
          const product = await prisma.product.findUnique({
            where: { id: item.productId }
          });

          if (product && product.trackInventory) {
            updates.push(
              prisma.product.update({
                where: { id: item.productId },
                data: {
                  inventoryQuantity: {
                    decrement: item.quantity
                  }
                }
              })
            );

            // בדיקת מלאי נמוך לאחר העדכון
            const newQuantity = product.inventoryQuantity - item.quantity;
            if (newQuantity <= 5) { // סף מלאי נמוך
              systemEvents.emitEvent('inventory.low_stock', {
                type: 'product',
                productId: item.productId,
                productName: product.name,
                currentQuantity: newQuantity,
                storeId: product.storeId
              });
            }

            // בדיקת מלאי אפס
            if (newQuantity <= 0) {
              systemEvents.emitEvent('inventory.out_of_stock', {
                type: 'product',
                productId: item.productId,
                productName: product.name,
                storeId: product.storeId
              });
            }
          }
        }

        // טיפול במוצרי Bundle
        if (item.type === 'BUNDLE') {
          await this.updateBundleInventory(item.productId, item.quantity);
        }

      } catch (error) {
        console.error('❌ Error updating inventory for item:', item, error);
        // ממשיך לפריט הבא במקום לעצור
      }
    }

    // ביצוע כל העדכונים בטרנזקציה
    if (updates.length > 0) {
      await prisma.$transaction(updates);
      console.log('✅ Inventory updated successfully for', updates.length, 'items');
    }
  }

  /**
   * עדכון מלאי למוצרי Bundle
   */
  static async updateBundleInventory(bundleId, quantity = 1) {
    const bundleItems = await prisma.bundleItem.findMany({
      where: { bundleId },
      include: {
        product: true,
        variant: true
      }
    });

    const updates = [];

    for (const bundleItem of bundleItems) {
      const reduceBy = bundleItem.quantity * quantity;

      if (bundleItem.variant) {
        // עדכון variant של Bundle
        updates.push(
          prisma.productVariant.update({
            where: { id: bundleItem.variantId },
            data: {
              inventoryQuantity: {
                decrement: reduceBy
              }
            }
          })
        );
      } else {
        // עדכון מוצר של Bundle
        updates.push(
          prisma.product.update({
            where: { id: bundleItem.productId },
            data: {
              inventoryQuantity: {
                decrement: reduceBy
              }
            }
          })
        );
      }
    }

    await prisma.$transaction(updates);
    console.log('✅ Bundle inventory updated:', bundleId);
  }

  /**
   * בדיקת זמינות מלאי לפני יצירת הזמנה
   */
  static async checkAvailability(items) {
    const unavailableItems = [];

    for (const item of items) {
      let available = false;
      let currentStock = 0;

      if (item.variantId) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true }
        });

        if (variant) {
          currentStock = variant.inventoryQuantity;
          available = !variant.product.trackInventory || 
                    variant.inventoryQuantity >= item.quantity ||
                    variant.product.allowBackorder;
        }
      } else {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (product) {
          currentStock = product.inventoryQuantity;
          available = !product.trackInventory || 
                    product.inventoryQuantity >= item.quantity ||
                    product.allowBackorder;
        }
      }

      if (!available) {
        unavailableItems.push({
          ...item,
          currentStock,
          requested: item.quantity
        });
      }
    }

    return {
      available: unavailableItems.length === 0,
      unavailableItems
    };
  }

  /**
   * החזרת מלאי (לביטול הזמנה)
   */
  static async restoreStockForOrder(items) {
    console.log('🔄 Restoring inventory for cancelled order');

    const updates = [];

    for (const item of items) {
      if (item.variantId) {
        updates.push(
          prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              inventoryQuantity: {
                increment: item.quantity
              }
            }
          })
        );
      } else {
        updates.push(
          prisma.product.update({
            where: { id: item.productId },
            data: {
              inventoryQuantity: {
                increment: item.quantity
              }
            }
          })
        );
      }
    }

    if (updates.length > 0) {
      await prisma.$transaction(updates);
      console.log('✅ Inventory restored successfully');
    }
  }

  /**
   * קבלת דוח מלאי נמוך לחנות
   */
  static async getLowStockReport(storeId, threshold = 5) {
    const [lowStockProducts, lowStockVariants] = await Promise.all([
      // מוצרים עם מלאי נמוך
      prisma.product.findMany({
        where: {
          storeId,
          trackInventory: true,
          inventoryQuantity: {
            lte: threshold
          }
        },
        include: {
          media: {
            where: { isPrimary: true },
            take: 1
          }
        }
      }),

      // variants עם מלאי נמוך
      prisma.productVariant.findMany({
        where: {
          product: {
            storeId,
            trackInventory: true
          },
          inventoryQuantity: {
            lte: threshold
          }
        },
        include: {
          product: {
            include: {
              media: {
                where: { isPrimary: true },
                take: 1
              }
            }
          },
          optionValues: {
            include: {
              option: true,
              optionValue: true
            }
          }
        }
      })
    ]);

    return {
      products: lowStockProducts,
      variants: lowStockVariants,
      totalItems: lowStockProducts.length + lowStockVariants.length
    };
  }
}
