import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function connectUserToStore() {
  try {
    console.log('🔗 Connecting user to store...');

    // Get the user
    const user = await prisma.user.findFirst({
      where: { email: 'itadmit@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    // Get the store
    const store = await prisma.store.findFirst();

    if (!store) {
      console.log('❌ Store not found');
      return;
    }

    // Check if connection already exists
    const existingConnection = await prisma.storeUser.findFirst({
      where: {
        userId: user.id,
        storeId: store.id
      }
    });

    if (existingConnection) {
      console.log('✅ User is already connected to store');
      return;
    }

    // Create the connection
    const storeUser = await prisma.storeUser.create({
      data: {
        userId: user.id,
        storeId: store.id,
        role: 'OWNER',
        isActive: true
      }
    });

    console.log(`✅ Connected user ${user.firstName} ${user.lastName} to store ${store.name}`);
    console.log(`   Role: ${storeUser.role}, Active: ${storeUser.isActive}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

connectUserToStore();
