import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDemoOrders() {
  try {
    console.log('🛒 Creating demo orders...');

    // Get the first store
    const store = await prisma.store.findFirst();
    if (!store) {
      console.log('❌ No store found. Please create a store first.');
      return;
    }

    // Get some products
    const products = await prisma.product.findMany({
      where: { storeId: store.id },
      take: 3
    });

    if (products.length === 0) {
      console.log('❌ No products found. Please create products first.');
      return;
    }

    // Create demo customers
    const customers = await Promise.all([
      prisma.customer.upsert({
        where: { 
          storeId_email: {
            storeId: store.id,
            email: 'customer1@example.com'
          }
        },
        update: {},
        create: {
          storeId: store.id,
          email: 'customer1@example.com',
          firstName: 'דני',
          lastName: 'כהן',
          phone: '0501234567'
        }
      }),
      prisma.customer.upsert({
        where: { 
          storeId_email: {
            storeId: store.id,
            email: 'customer2@example.com'
          }
        },
        update: {},
        create: {
          storeId: store.id,
          email: 'customer2@example.com',
          firstName: 'שרה',
          lastName: 'לוי',
          phone: '0509876543'
        }
      })
    ]);

    // Create demo orders
    const orders = [];
    
    for (let i = 1; i <= 5; i++) {
      const customer = customers[i % 2];
      const product = products[i % products.length];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const price = product.price || 100;
      const total = price * quantity;
      
      const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
      const paymentStatuses = ['PENDING', 'PAID', 'FAILED'];
      
      const order = await prisma.order.create({
        data: {
          storeId: store.id,
          customerId: customer.id,
          orderNumber: `ORD-${Date.now()}-${i}`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
          subtotal: total,
          totalAmount: total,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          billingAddress: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            address: 'רחוב הרצל 123',
            city: 'תל אביב',
            postalCode: '12345',
            country: 'IL'
          },
          shippingAddress: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            address: 'רחוב הרצל 123',
            city: 'תל אביב',
            postalCode: '12345',
            country: 'IL'
          },
          items: {
            create: {
              productId: product.id,
              quantity: quantity,
              price: price,
              total: total,
              productName: product.name,
              productSku: product.sku
            }
          }
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      orders.push(order);
      console.log(`✅ Created order: ${order.orderNumber} for ${customer.firstName} ${customer.lastName}`);
    }

    console.log(`🎉 Successfully created ${orders.length} demo orders!`);
    
  } catch (error) {
    console.error('❌ Error creating demo orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoOrders();
