import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createYogevShirt() {
  console.log('🌱 Creating Yogev Shirt with variants...');

  try {
    // Get the store
    const store = await prisma.store.findFirst({
      where: { slug: 'yogevstore' }
    });

    if (!store) {
      console.error('Store not found');
      return;
    }

    // Get or create clothing category
    let category = await prisma.category.findFirst({
      where: {
        storeId: store.id,
        slug: 'clothing'
      }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          storeId: store.id,
          name: 'ביגוד',
          slug: 'clothing',
          description: 'ביגוד לגברים ונשים',
          isActive: true
        }
      });
    }

    // Create or get size option
    let sizeOption = await prisma.productOption.findFirst({
      where: {
        storeId: store.id,
        name: 'Size'
      }
    });

    if (!sizeOption) {
      sizeOption = await prisma.productOption.create({
        data: {
          storeId: store.id,
          name: 'Size',
          type: 'TEXT',
          displayType: 'DROPDOWN'
        }
      });

      // Create size values
      const sizes = ['S', 'M', 'L'];
      for (let i = 0; i < sizes.length; i++) {
        await prisma.productOptionValue.create({
          data: {
            optionId: sizeOption.id,
            value: sizes[i],
            sortOrder: i
          }
        });
      }
    }

    // Create or get color option
    let colorOption = await prisma.productOption.findFirst({
      where: {
        storeId: store.id,
        name: 'Color'
      }
    });

    if (!colorOption) {
      colorOption = await prisma.productOption.create({
        data: {
          storeId: store.id,
          name: 'Color',
          type: 'COLOR',
          displayType: 'SWATCH'
        }
      });

      // Create color values
      const colors = [
        { value: 'לבן', colorCode: '#FFFFFF' },
        { value: 'שחור', colorCode: '#000000' },
        { value: 'אדום', colorCode: '#FF0000' }
      ];
      
      for (let i = 0; i < colors.length; i++) {
        await prisma.productOptionValue.create({
          data: {
            optionId: colorOption.id,
            value: colors[i].value,
            colorCode: colors[i].colorCode,
            sortOrder: i
          }
        });
      }
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        categoryId: category.id,
        name: 'חולצת יוגב',
        slug: 'yogev-shirt',
        description: 'חולצה איכותית ונוחה לכל יום. עשויה מכותנה 100% ברמת איכות גבוהה.',
        shortDescription: 'חולצה איכותית מכותנה 100%',
        sku: 'YOGEV-SHIRT',
        type: 'VARIABLE',
        status: 'ACTIVE',
        price: 89.90,
        comparePrice: 120.00,
        costPrice: 45.00,
        trackInventory: true,
        inventoryQuantity: 100,
        allowBackorder: false,
        weight: 0.2,
        requiresShipping: true,
        isDigital: false,
        seoTitle: 'חולצת יוגב - חולצה איכותית מכותנה',
        seoDescription: 'חולצת יוגב איכותית מכותנה 100%. זמינה במידות S, M, L ובצבעים לבן, שחור ואדום. משלוח חינם.',
        customFields: {
          size_guide: 'מידה S: חזה 90-95 ס"מ\nמידה M: חזה 96-101 ס"מ\nמידה L: חזה 102-107 ס"מ',
          washing_instructions: 'כביסה במכונה עד 30 מעלות\nאין להלבין\nייבוש טבעי\nגיהוץ בחום נמוך'
        }
      }
    });

    console.log('✅ Created product:', product.name);

    // Get option values for variants
    const sizeValues = await prisma.productOptionValue.findMany({
      where: { optionId: sizeOption.id },
      orderBy: { sortOrder: 'asc' }
    });

    const colorValues = await prisma.productOptionValue.findMany({
      where: { optionId: colorOption.id },
      orderBy: { sortOrder: 'asc' }
    });

    // Create all possible variants (3 sizes × 3 colors = 9 variants)
    let variantCount = 0;
    for (const size of sizeValues) {
      for (const color of colorValues) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: `${product.sku}-${size.value}-${color.value}`,
            price: product.price,
            comparePrice: product.comparePrice,
            costPrice: product.costPrice,
            inventoryQuantity: 10,
            weight: product.weight,
            optionValues: {
              [sizeOption.name]: size.value,
              [colorOption.name]: color.value
            },
            isActive: true
          }
        });
        variantCount++;
        console.log(`✅ Created variant: ${size.value} - ${color.value}`);
      }
    }

    console.log(`🎉 Successfully created product with ${variantCount} variants!`);
    console.log(`
📊 Summary:
- Product: ${product.name}
- SKU: ${product.sku}
- Price: ₪${product.price}
- Variants: ${variantCount}
- Custom Fields: Size Guide, Washing Instructions
    `);

  } catch (error) {
    console.error('❌ Error creating product:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createYogevShirt(); 