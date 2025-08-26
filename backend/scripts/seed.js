import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@quickshop.co.il' },
    update: {},
    create: {
      email: 'demo@quickshop.co.il',
      passwordHash: hashedPassword,
      firstName: 'יוגב',
      lastName: 'אביטן',
      phone: '050-1234567',
      planType: 'PRO',
      subscriptionStatus: 'TRIAL',
      trialEndsAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
    },
  });

  console.log('✅ Created demo user:', user.email);

  // Create a demo store
  const store = await prisma.store.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      name: 'החנות של יוגב',
      slug: 'yogev-store',
      description: 'חנות אופנה מודרנית עם מגוון רחב של מוצרים איכותיים',
      templateName: 'jupiter',
    },
  });

  console.log('✅ Created demo store:', store.name);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: 'clothing' } },
      update: {},
      create: {
        storeId: store.id,
        name: 'בגדים',
        slug: 'clothing',
        description: 'בגדים לגברים ונשים',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: 'shoes' } },
      update: {},
      create: {
        storeId: store.id,
        name: 'נעליים',
        slug: 'shoes',
        description: 'נעליים לכל המשפחה',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { storeId_slug: { storeId: store.id, slug: 'accessories' } },
      update: {},
      create: {
        storeId: store.id,
        name: 'אביזרים',
        slug: 'accessories',
        description: 'תיקים, חגורות ועוד',
        sortOrder: 3,
      },
    }),
  ]);

  console.log('✅ Created categories');

  // Create products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: 'blue-polo-shirt' } },
      update: {},
      create: {
        storeId: store.id,
        categoryId: categories[0].id,
        name: 'חולצת פולו כחולה',
        slug: 'blue-polo-shirt',
        description: 'חולצת פולו איכותית בצבע כחול',
        shortDescription: 'חולצת פולו נוחה ואלגנטית',
        sku: 'POLO-BLUE-001',
        status: 'ACTIVE',
        price: 89.90,
        comparePrice: 120.00,
        costPrice: 45.00,
        inventoryQuantity: 50,
        weight: 0.3,
      },
    }),
    prisma.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: 'classic-jeans' } },
      update: {},
      create: {
        storeId: store.id,
        categoryId: categories[0].id,
        name: 'ג\'ינס קלאסי',
        slug: 'classic-jeans',
        description: 'ג\'ינס קלאסי בגזרה נוחה',
        shortDescription: 'ג\'ינס איכותי לשימוש יומיומי',
        sku: 'JEANS-CLASSIC-001',
        status: 'ACTIVE',
        price: 149.90,
        comparePrice: 199.00,
        costPrice: 75.00,
        inventoryQuantity: 30,
        weight: 0.8,
      },
    }),
    prisma.product.upsert({
      where: { storeId_slug: { storeId: store.id, slug: 'sport-shoes' } },
      update: {},
      create: {
        storeId: store.id,
        categoryId: categories[1].id,
        name: 'נעלי ספורט',
        slug: 'sport-shoes',
        description: 'נעלי ספורט נוחות לפעילות גופנית',
        shortDescription: 'נעלי ספורט איכותיות',
        sku: 'SHOES-SPORT-001',
        status: 'ACTIVE',
        price: 299.90,
        comparePrice: 399.00,
        costPrice: 150.00,
        inventoryQuantity: 25,
        weight: 1.2,
      },
    }),
  ]);

  console.log('✅ Created products');

  // Create customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { storeId_email: { storeId: store.id, email: 'yossi@example.com' } },
      update: {},
      create: {
        storeId: store.id,
        email: 'yossi@example.com',
        firstName: 'יוסי',
        lastName: 'כהן',
        phone: '052-1111111',
        acceptsMarketing: true,
      },
    }),
    prisma.customer.upsert({
      where: { storeId_email: { storeId: store.id, email: 'sara@example.com' } },
      update: {},
      create: {
        storeId: store.id,
        email: 'sara@example.com',
        firstName: 'שרה',
        lastName: 'לוי',
        phone: '053-2222222',
        acceptsMarketing: false,
      },
    }),
    prisma.customer.upsert({
      where: { storeId_email: { storeId: store.id, email: 'david@example.com' } },
      update: {},
      create: {
        storeId: store.id,
        email: 'david@example.com',
        firstName: 'דוד',
        lastName: 'מזרחי',
        phone: '054-3333333',
        acceptsMarketing: true,
      },
    }),
  ]);

  console.log('✅ Created customers');

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        storeId: store.id,
        customerId: customers[0].id,
        orderNumber: 'ORD-001',
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        fulfillmentStatus: 'UNFULFILLED',
        subtotal: 350.00,
        taxAmount: 59.50,
        shippingAmount: 20.00,
        totalAmount: 429.50,
        currency: 'ILS',
        customerEmail: customers[0].email,
        customerPhone: customers[0].phone,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 2,
              price: 89.90,
              total: 179.80,
              productName: products[0].name,
              productSku: products[0].sku,
            },
            {
              productId: products[1].id,
              quantity: 1,
              price: 149.90,
              total: 149.90,
              productName: products[1].name,
              productSku: products[1].sku,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        storeId: store.id,
        customerId: customers[1].id,
        orderNumber: 'ORD-002',
        status: 'SHIPPED',
        paymentStatus: 'PAID',
        fulfillmentStatus: 'FULFILLED',
        subtotal: 280.00,
        taxAmount: 47.60,
        shippingAmount: 15.00,
        totalAmount: 342.60,
        currency: 'ILS',
        customerEmail: customers[1].email,
        customerPhone: customers[1].phone,
        items: {
          create: [
            {
              productId: products[2].id,
              quantity: 1,
              price: 299.90,
              total: 299.90,
              productName: products[2].name,
              productSku: products[2].sku,
            },
          ],
        },
      },
    }),
    prisma.order.create({
      data: {
        storeId: store.id,
        customerId: customers[2].id,
        orderNumber: 'ORD-003',
        status: 'DELIVERED',
        paymentStatus: 'PAID',
        fulfillmentStatus: 'FULFILLED',
        subtotal: 520.00,
        taxAmount: 88.40,
        shippingAmount: 25.00,
        totalAmount: 633.40,
        currency: 'ILS',
        customerEmail: customers[2].email,
        customerPhone: customers[2].phone,
        items: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
              price: 89.90,
              total: 89.90,
              productName: products[0].name,
              productSku: products[0].sku,
            },
            {
              productId: products[1].id,
              quantity: 2,
              price: 149.90,
              total: 299.80,
              productName: products[1].name,
              productSku: products[1].sku,
            },
          ],
        },
      },
    }),
  ]);

  console.log('✅ Created orders');

  console.log('🎉 Database seeding completed successfully!');
  console.log(`
📊 Summary:
- User: ${user.email}
- Store: ${store.name}
- Categories: ${categories.length}
- Products: ${products.length}
- Customers: ${customers.length}
- Orders: ${orders.length}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
