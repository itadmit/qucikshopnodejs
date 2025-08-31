import { PrismaClient } from '@prisma/client';
import { setupNewStore } from '../services/storeSetup.js';

const prisma = new PrismaClient();

async function setupExistingStores() {
  try {
    console.log('🔍 Finding stores without default setup...');
    
    // מצא חנויות שאין להן תפריטים
    const storesWithoutMenus = await prisma.store.findMany({
      where: {
        menus: {
          none: {}
        }
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    console.log(`📊 Found ${storesWithoutMenus.length} stores without menus`);

    if (storesWithoutMenus.length === 0) {
      console.log('✅ All stores already have menus setup');
      return;
    }

    // הגדר כל חנות
    for (const store of storesWithoutMenus) {
      console.log(`\n🏪 Setting up store: ${store.name} (${store.slug})`);
      
      try {
        await setupNewStore(store.id);
        console.log(`✅ Successfully setup store: ${store.name}`);
      } catch (error) {
        console.error(`❌ Failed to setup store ${store.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Completed setup for ${storesWithoutMenus.length} stores`);

  } catch (error) {
    console.error('❌ Error setting up existing stores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// הרץ את הסקריפט
setupExistingStores(); 