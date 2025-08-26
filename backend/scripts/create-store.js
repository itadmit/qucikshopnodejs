import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createStore() {
  try {
    // Find the user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }
    
    console.log('Found user:', user.email);
    
    // Check if store already exists
    const existingStore = await prisma.store.findFirst({
      where: { userId: user.id }
    });
    
    if (existingStore) {
      console.log('✅ Store already exists:', existingStore.name, 'with slug:', existingStore.slug);
      return;
    }
    
    // Create store for this user
    const store = await prisma.store.create({
      data: {
        userId: user.id,
        name: 'החנות שלי',
        slug: 'my-store',
        description: 'החנות הראשונה שלי',
        templateName: 'jupiter',
        isActive: true
      }
    });
    
    console.log('✅ Store created:', store.name, 'with slug:', store.slug);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

createStore().finally(() => prisma.$disconnect());
