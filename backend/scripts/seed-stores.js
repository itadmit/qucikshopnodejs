import prisma from '../lib/prisma.js'

async function seedStores() {
  try {
    console.log('🌱 Starting to seed stores...')

    // First, let's check if we have any users, if not create one
    let demoUser = await prisma.user.findFirst()
    
    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          email: 'demo@quickshop.com',
          passwordHash: '$2a$10$dummy.hash.for.demo.user.only',
          firstName: 'דמו',
          lastName: 'משתמש',
          planType: 'PRO'
        }
      })
      console.log('✅ Demo user created:', demoUser.email)
    }

    // Create a demo store
    const demoStore = await prisma.store.upsert({
      where: { slug: 'demo-store' },
      update: {},
      create: {
        userId: demoUser.id,
        name: 'החנות הדמו שלנו',
        slug: 'demo-store',
        description: 'חנות דמו מלאה במוצרים איכותיים למטרות הדגמה',
        templateName: 'jupiter',
        logoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop&crop=center',
        isActive: true
      }
    })

    console.log('✅ Demo store created:', demoStore.name)

    // Create categories
    const categories = [
      {
        name: 'אלקטרוניקה',
        slug: 'electronics',
        description: 'מוצרי אלקטרוניקה מתקדמים ואיכותיים',
        imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
        sortOrder: 1
      },
      {
        name: 'אופנה',
        slug: 'fashion',
        description: 'בגדים ואקססוריז אופנתיים',
        imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
        sortOrder: 2
      },
      {
        name: 'בית וגן',
        slug: 'home-garden',
        description: 'מוצרים לבית ולגינה',
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
        sortOrder: 3
      },
      {
        name: 'ספורט',
        slug: 'sports',
        description: 'ציוד ספורט ופעילות גופנית',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        sortOrder: 4
      }
    ]

    const createdCategories = []
    for (const categoryData of categories) {
      const category = await prisma.category.upsert({
        where: { 
          storeId_slug: {
            storeId: demoStore.id,
            slug: categoryData.slug
          }
        },
        update: {},
        create: {
          ...categoryData,
          storeId: demoStore.id
        }
      })
      createdCategories.push(category)
      console.log('✅ Category created:', category.name)
    }

    // Create products
    const products = [
      {
        name: 'אוזניות אלחוטיות מקצועיות',
        slug: 'wireless-headphones-pro',
        description: 'אוזניות אלחוטיות איכותיות עם ביטול רעשים פעיל, סוללה לעד 30 שעות ואיכות שמע מעולה. מושלמות לעבודה, ספורט ובילוי.',
        shortDescription: 'אוזניות אלחוטיות עם ביטול רעשים פעיל',
        price: 299.00,
        comparePrice: 399.00,
        sku: 'WH-PRO-001',
        categoryId: createdCategories[0].id, // Electronics
        status: 'ACTIVE',
        trackInventory: true,
        inventoryQuantity: 15,
        sortOrder: 1
      },
      {
        name: 'חולצת פולו קלאסית',
        slug: 'classic-polo-shirt',
        description: 'חולצת פולו איכותיות מבד כותנה נושם. זמינה במגוון צבעים ומידות. מושלמת לכל אירוע.',
        shortDescription: 'חולצת פולו איכותית מכותנה',
        price: 89.00,
        sku: 'POLO-001',
        categoryId: createdCategories[1].id, // Fashion
        status: 'ACTIVE',
        trackInventory: true,
        inventoryQuantity: 25,
        sortOrder: 2
      },
      {
        name: 'צמח נוי מונסטרה',
        slug: 'monstera-plant',
        description: 'צמח נוי יפהפה למשרד או לבית. קל לטיפוח ומוסיף חיות לכל חלל.',
        shortDescription: 'צמח נוי מונסטרה לבית',
        price: 45.00,
        sku: 'PLANT-001',
        categoryId: createdCategories[2].id, // Home & Garden
        status: 'ACTIVE',
        trackInventory: true,
        inventoryQuantity: 0, // Out of stock
        sortOrder: 3
      },
      {
        name: 'נעלי ריצה ספורטיביות',
        slug: 'sport-running-shoes',
        description: 'נעלי ריצה מתקדמות עם ריפוד מעולה ותמיכה אופטימלית. מושלמות לריצה ופעילות ספורטיבית.',
        shortDescription: 'נעלי ריצה מתקדמות',
        price: 259.00,
        comparePrice: 329.00,
        sku: 'SHOES-001',
        categoryId: createdCategories[3].id, // Sports
        status: 'ACTIVE',
        trackInventory: true,
        inventoryQuantity: 12,
        sortOrder: 4
      },
      {
        name: 'טלפון חכם מתקדם',
        slug: 'advanced-smartphone',
        description: 'טלפון חכם מתקדם עם מצלמה איכותית, מעבד מהיר וסוללה לכל היום.',
        shortDescription: 'טלפון חכם מתקדם',
        price: 1299.00,
        sku: 'PHONE-001',
        categoryId: createdCategories[0].id, // Electronics
        status: 'ACTIVE',
        trackInventory: true,
        inventoryQuantity: 8,
        sortOrder: 5
      },
      {
        name: 'מחשב נייד לגיימרים',
        slug: 'gaming-laptop',
        description: 'מחשב נייד מתקדם לגיימרים עם כרטיס מסך חזק ומעבד מהיר.',
        shortDescription: 'מחשב נייד לגיימרים',
        price: 2499.00,
        comparePrice: 2799.00,
        sku: 'LAPTOP-001',
        categoryId: createdCategories[0].id, // Electronics
        status: 'ACTIVE',
        trackInventory: true,
        inventoryQuantity: 3,
        sortOrder: 6
      }
    ]

    for (const productData of products) {
      const product = await prisma.product.upsert({
        where: {
          storeId_slug: {
            storeId: demoStore.id,
            slug: productData.slug
          }
        },
        update: {},
        create: {
          ...productData,
          storeId: demoStore.id
        }
      })
      console.log('✅ Product created:', product.name)

      // Add a sample image for each product
      const imageUrls = [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', // Headphones
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', // Polo shirt
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600', // Plant
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', // Shoes
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', // Phone
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600'  // Laptop
      ]

      const productIndex = products.indexOf(productData)
      if (imageUrls[productIndex]) {
        // First create the media record
        const media = await prisma.media.create({
          data: {
            storeId: demoStore.id,
            filename: `product-${product.id}-image.jpg`,
            originalFilename: `${product.name}.jpg`,
            mimeType: 'image/jpeg',
            fileSize: 1024000, // Mock file size
            width: 600,
            height: 600,
            s3Key: `products/${product.id}/image.jpg`,
            s3Url: imageUrls[productIndex],
            altText: product.name
          }
        })

        // Then create the product media relation
        await prisma.productMedia.create({
          data: {
            productId: product.id,
            mediaId: media.id,
            type: 'IMAGE',
            sortOrder: 1,
            isPrimary: true
          }
        })
      }
    }

    console.log('🎉 Store seeding completed successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding stores:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
seedStores()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
