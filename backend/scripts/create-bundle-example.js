import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createBundleExample() {
  try {
    console.log('🚀 יוצר דוגמה למוצר בנדל...');

    // Find existing store
    const store = await prisma.store.findFirst({
      where: { isActive: true }
    });

    if (!store) {
      console.error('❌ לא נמצאה חנות פעילה');
      return;
    }

    console.log(`📍 נמצאה חנות: ${store.name}`);

    // Create individual products first
    console.log('📦 יוצר מוצרים בודדים...');

    const shampoo = await prisma.product.create({
      data: {
        storeId: store.id,
        name: 'שמפו טיפוח יומי',
        slug: 'daily-care-shampoo',
        description: 'שמפו איכותי לטיפוח יומי בשיער',
        shortDescription: 'שמפו טיפוח יומי',
        sku: 'SHAMPOO-001',
        type: 'SIMPLE',
        status: 'ACTIVE',
        price: 45.90,
        comparePrice: 59.90,
        costPrice: 25.00,
        trackInventory: true,
        inventoryQuantity: 50,
        allowBackorder: false,
        weight: 0.3,
        requiresShipping: true,
        isDigital: false,
        tags: ['טיפוח', 'שיער', 'יומי']
      }
    });

    const mask = await prisma.product.create({
      data: {
        storeId: store.id,
        name: 'מסכת שיער מזינה',
        slug: 'nourishing-hair-mask',
        description: 'מסכה מזינה לשיער יבש ופגום',
        shortDescription: 'מסכת שיער מזינה',
        sku: 'MASK-001',
        type: 'SIMPLE',
        status: 'ACTIVE',
        price: 65.90,
        comparePrice: 79.90,
        costPrice: 35.00,
        trackInventory: true,
        inventoryQuantity: 30,
        allowBackorder: false,
        weight: 0.25,
        requiresShipping: true,
        isDigital: false,
        tags: ['טיפוח', 'שיער', 'מסכה']
      }
    });

    console.log(`✅ נוצר שמפו: ${shampoo.name} (ID: ${shampoo.id})`);
    console.log(`✅ נוצרה מסכה: ${mask.name} (ID: ${mask.id})`);

    // Create bundle product
    console.log('🎁 יוצר מוצר בנדל...');

    const bundle = await prisma.product.create({
      data: {
        storeId: store.id,
        name: 'סט טיפוח שיער מושלם',
        slug: 'perfect-hair-care-set',
        description: 'סט מושלם לטיפוח השיער הכולל שמפו איכותי ומסכה מזינה. חסכו 20% ברכישת הסט!',
        shortDescription: 'סט טיפוח שיער - שמפו + מסכה',
        sku: 'BUNDLE-HAIR-001',
        type: 'BUNDLE',
        status: 'ACTIVE',
        price: 89.90, // Instead of 111.80 (45.90 + 65.90)
        comparePrice: 111.80,
        costPrice: 60.00,
        trackInventory: false, // Bundle inventory is calculated from components
        inventoryQuantity: 0,
        allowBackorder: false,
        weight: 0.55, // Combined weight
        requiresShipping: true,
        isDigital: false,
        tags: ['בנדל', 'טיפוח', 'שיער', 'חיסכון']
      }
    });

    console.log(`✅ נוצר בנדל: ${bundle.name} (ID: ${bundle.id})`);

    // Create bundle items
    console.log('🔗 מקשר רכיבי בנדל...');

    const bundleItem1 = await prisma.bundleItem.create({
      data: {
        bundleId: bundle.id,
        productId: shampoo.id,
        quantity: 1,
        sortOrder: 1,
        isOptional: false
      }
    });

    const bundleItem2 = await prisma.bundleItem.create({
      data: {
        bundleId: bundle.id,
        productId: mask.id,
        quantity: 1,
        sortOrder: 2,
        isOptional: false
      }
    });

    console.log(`✅ נוסף רכיב בנדל: ${shampoo.name} x${bundleItem1.quantity}`);
    console.log(`✅ נוסף רכיב בנדל: ${mask.name} x${bundleItem2.quantity}`);

    // Test bundle availability calculation
    console.log('🧮 בודק זמינות בנדל...');

    const bundleWithItems = await prisma.product.findUnique({
      where: { id: bundle.id },
      include: {
        bundleItems: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });

    // Calculate availability
    let maxAvailableQuantity = Infinity;
    
    for (const item of bundleWithItems.bundleItems) {
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
    
    const availableQuantity = maxAvailableQuantity === Infinity ? 0 : maxAvailableQuantity;

    console.log(`📊 זמינות בנדל: ${availableQuantity} יחידות`);
    console.log(`   - שמפו: ${shampoo.inventoryQuantity} יחידות`);
    console.log(`   - מסכה: ${mask.inventoryQuantity} יחידות`);
    console.log(`   - מקסימום בנדלים: ${Math.min(shampoo.inventoryQuantity, mask.inventoryQuantity)}`);

    console.log('\n🎉 דוגמת בנדל נוצרה בהצלחה!');
    console.log(`🔗 כתובת הבנדל: /${store.slug}/products/${bundle.slug}`);
    console.log('\n📋 סיכום:');
    console.log(`   • מוצר בנדל: ${bundle.name}`);
    console.log(`   • מחיר בנדל: ₪${bundle.price} (במקום ₪${bundle.comparePrice})`);
    console.log(`   • חיסכון: ₪${(bundle.comparePrice - bundle.price).toFixed(2)} (${Math.round(((bundle.comparePrice - bundle.price) / bundle.comparePrice) * 100)}%)`);
    console.log(`   • רכיבים: ${bundleWithItems.bundleItems.length}`);
    console.log(`   • זמינות: ${availableQuantity} יחידות`);

  } catch (error) {
    console.error('❌ שגיאה ביצירת דוגמת בנדל:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createBundleExample();
