import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserStore() {
  try {
    console.log('🔍 Checking user and store relationships...');

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        storeUsers: {
          include: {
            store: true
          }
        }
      }
    });

    console.log('\n👥 Users:');
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Stores: ${user.storeUsers.length}`);
      user.storeUsers.forEach(storeUser => {
        console.log(`    - Store: ${storeUser.store.name} (ID: ${storeUser.storeId})`);
        console.log(`      Role: ${storeUser.role}, Active: ${storeUser.isActive}`);
      });
    });

    // Get all stores
    const stores = await prisma.store.findMany({
      include: {
        storeUsers: {
          include: {
            user: true
          }
        }
      }
    });

    console.log('\n🏪 Stores:');
    stores.forEach(store => {
      console.log(`- ${store.name} (ID: ${store.id})`);
      console.log(`  Users: ${store.storeUsers.length}`);
      store.storeUsers.forEach(storeUser => {
        console.log(`    - User: ${storeUser.user.firstName} ${storeUser.user.lastName}`);
        console.log(`      Role: ${storeUser.role}, Active: ${storeUser.isActive}`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStore();
