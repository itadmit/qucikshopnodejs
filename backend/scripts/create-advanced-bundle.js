import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdvancedBundle() {
  try {
    console.log('🚀 יוצר בנדל מתקדם עם וריאציות...');

    // Find existing store
    const store = await prisma.store.findFirst({
      where: { isActive: true }
    });

    if (!store) {
      console.error('❌ לא נמצאה חנות פעילה');
      return;
    }

    console.log(`📍 נמצאה חנות: ${store.name}`);

    // Create a t-shirt with variants
    console.log('👕 יוצר חולצה עם וריאציות...');

    const tshirt = await prisma.product.create({
      data: {
        storeId: store.id,
        name: 'חולצת טי קיצית',
        slug: 'summer-tshirt',
        description: 'חולצת טי נוחה ואיכותית לקיץ',
        shortDescription: 'חולצת טי קיצית',
        sku: 'TSHIRT-001',
        type: 'VARIABLE',
        status: 'ACTIVE',
        price: 79.90,
        comparePrice: 99.90,
        costPrice: 35.00,
        trackInventory: true,
        inventoryQuantity: 0, // Will be managed by variants
        allowBackorder: false,
        weight: 0.2,
        requiresShipping: true,
        isDigital: false,
        tags: ['בגדים', 'קיץ', 'חולצה']
      }
    });

    // Create color option
    const colorOption = await prisma.productOption.create({
      data: {
        productId: tshirt.id,
        name: 'צבע',
        type: 'COLOR',
        displayType: 'SWATCH',
        position: 1
      }
    });

    // Create size option
    const sizeOption = await prisma.productOption.create({
      data: {
        productId: tshirt.id,
        name: 'מידה',
        type: 'TEXT',
        displayType: 'DROPDOWN',
        position: 2
      }
    });

    // Create color values
    const redColor = await prisma.productOptionValue.create({
      data: {
        optionId: colorOption.id,
        value: 'אדום',
        colorCode: '#FF0000',
        sortOrder: 1
      }
    });

    const blueColor = await prisma.productOptionValue.create({
      data: {
        optionId: colorOption.id,
        value: 'כחול',
        colorCode: '#0000FF',
        sortOrder: 2
      }
    });

    // Create size values
    const sizeM = await prisma.productOptionValue.create({
      data: {
        optionId: sizeOption.id,
        value: 'M',
        sortOrder: 1
      }
    });

    const sizeL = await prisma.productOptionValue.create({
      data: {
        optionId: sizeOption.id,
        value: 'L',
        sortOrder: 2
      }
    });

    // Create variants
    const variants = [
      { color: redColor, size: sizeM, sku: 'TSHIRT-RED-M', inventory: 15 },
      { color: redColor, size: sizeL, sku: 'TSHIRT-RED-L', inventory: 12 },
      { color: blueColor, size: sizeM, sku: 'TSHIRT-BLUE-M', inventory: 20 },
      { color: blueColor, size: sizeL, sku: 'TSHIRT-BLUE-L', inventory: 8 }
    ];

    const createdVariants = [];
    for (const variantData of variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: tshirt.id,
          sku: variantData.sku,
          price: tshirt.price,
          comparePrice: tshirt.comparePrice,
          costPrice: tshirt.costPrice,
          inventoryQuantity: variantData.inventory,
          weight: tshirt.weight,
          isActive: true
        }
      });

      // Create variant option values
      await prisma.productVariantOptionValue.create({
        data: {
          variantId: variant.id,
          optionId: colorOption.id,
          optionValueId: variantData.color.id,
          value: variantData.color.value
        }
      });

      await prisma.productVariantOptionValue.create({
        data: {
          variantId: variant.id,
          optionId: sizeOption.id,
          optionValueId: variantData.size.id,
          value: variantData.size.value
        }
      });

      createdVariants.push(variant);
      console.log(`✅ נוצרה וריאציה: ${variantData.color.value} ${variantData.size.value} - ${variantData.inventory} יחידות`);
    }

    // Create pants (simple product)
    console.log('👖 יוצר מכנסיים...');

    const pants = await prisma.product.create({
      data: {
        storeId: store.id,
        name: 'מכנסי ג\'ינס קלאסיים',
        slug: 'classic-jeans',
        description: 'מכנסי ג\'ינס איכותיים בגזרה קלאסית',
        shortDescription: 'מכנסי ג\'ינס קלאסיים',
        sku: 'JEANS-001',
        type: 'SIMPLE',
        status: 'ACTIVE',
        price: 149.90,
        comparePrice: 199.90,
        costPrice: 75.00,
        trackInventory: true,
        inventoryQuantity: 25,
        allowBackorder: false,
        weight: 0.8,
        requiresShipping: true,
        isDigital: false,
        tags: ['בגדים', 'מכנסיים', 'ג\'ינס']
      }
    });

    console.log(`✅ נוצרו מכנסיים: ${pants.name} - ${pants.inventoryQuantity} יחידות`);

    // Create summer bundle with variants
    console.log('🌞 יוצר בנדל קיץ...');

    const summerBundle = await prisma.product.create({
      data: {
        storeId: store.id,
        name: 'סט קיץ מושלם',
        slug: 'perfect-summer-set',
        description: 'סט קיץ מושלם הכולל חולצת טי איכותי ומכנסי ג\'ינס קלאסיים. חסכו 15% ברכישת הסט!',
        shortDescription: 'סט קיץ - חולצה + מכנסיים',
        sku: 'BUNDLE-SUMMER-001',
        type: 'BUNDLE',
        status: 'ACTIVE',
        price: 195.90, // Instead of 229.80 (79.90 + 149.90)
        comparePrice: 229.80,
        costPrice: 110.00,
        trackInventory: false,
        inventoryQuantity: 0,
        allowBackorder: false,
        weight: 1.0,
        requiresShipping: true,
        isDigital: false,
        tags: ['בנדל', 'קיץ', 'בגדים', 'חיסכון']
      }
    });

    console.log(`✅ נוצר בנדל קיץ: ${summerBundle.name}`);

    // Add bundle items - use specific variant for t-shirt
    const redMVariant = createdVariants.find(v => v.sku === 'TSHIRT-RED-M');

    await prisma.bundleItem.create({
      data: {
        bundleId: summerBundle.id,
        productId: tshirt.id,
        variantId: redMVariant.id, // Specific variant: Red, M
        quantity: 1,
        sortOrder: 1,
        isOptional: false
      }
    });

    await prisma.bundleItem.create({
      data: {
        bundleId: summerBundle.id,
        productId: pants.id,
        quantity: 1,
        sortOrder: 2,
        isOptional: false
      }
    });

    console.log(`✅ נוסף לבנדל: חולצה אדומה מידה M`);
    console.log(`✅ נוסף לבנדל: מכנסי ג'ינס`);

    // Calculate bundle availability
    console.log('🧮 בודק זמינות בנדל מתקדם...');

    const bundleWithItems = await prisma.product.findUnique({
      where: { id: summerBundle.id },
      include: {
        bundleItems: {
          include: {
            product: true,
            variant: true
          }
        }
      }
    });

    let maxAvailableQuantity = Infinity;
    
    for (const item of bundleWithItems.bundleItems) {
      if (item.isOptional) continue;
      
      let itemAvailability = 0;
      if (item.variant) {
        itemAvailability = item.variant.inventoryQuantity;
        console.log(`   - ${item.product.name} (${item.variant.sku}): ${itemAvailability} יחידות`);
      } else {
        itemAvailability = item.product.inventoryQuantity;
        console.log(`   - ${item.product.name}: ${itemAvailability} יחידות`);
      }
      
      const bundlesFromThisItem = Math.floor(itemAvailability / item.quantity);
      maxAvailableQuantity = Math.min(maxAvailableQuantity, bundlesFromThisItem);
    }
    
    const availableQuantity = maxAvailableQuantity === Infinity ? 0 : maxAvailableQuantity;

    console.log(`📊 זמינות בנדל מתקדם: ${availableQuantity} יחידות`);

    console.log('\n🎉 בנדל מתקדם נוצר בהצלחה!');
    console.log(`🔗 כתובת הבנדל: /${store.slug}/products/${summerBundle.slug}`);
    console.log('\n📋 סיכום:');
    console.log(`   • מוצר בנדל: ${summerBundle.name}`);
    console.log(`   • מחיר בנדל: ₪${summerBundle.price} (במקום ₪${summerBundle.comparePrice})`);
    console.log(`   • חיסכון: ₪${(summerBundle.comparePrice - summerBundle.price).toFixed(2)} (${Math.round(((summerBundle.comparePrice - summerBundle.price) / summerBundle.comparePrice) * 100)}%)`);
    console.log(`   • רכיבים: ${bundleWithItems.bundleItems.length}`);
    console.log(`   • זמינות: ${availableQuantity} יחידות`);
    console.log(`   • כולל וריאציה: חולצה אדומה מידה M`);

  } catch (error) {
    console.error('❌ שגיאה ביצירת בנדל מתקדם:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdvancedBundle();
