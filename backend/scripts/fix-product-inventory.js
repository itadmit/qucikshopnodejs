import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProductInventory() {
  try {
    console.log('🔧 Fixing product inventory...');
    
    // Update all products to have inventory
    const result = await prisma.product.updateMany({
      where: {
        status: 'ACTIVE'
      },
      data: {
        inventoryQuantity: 100,
        trackInventory: true
      }
    });
    
    console.log(`✅ Updated ${result.count} products with inventory`);
    
    // Also update product variants if they exist
    const variantResult = await prisma.productVariant.updateMany({
      data: {
        inventoryQuantity: 50,
        isActive: true
      }
    });
    
    console.log(`✅ Updated ${variantResult.count} product variants with inventory`);
    
    // Show some sample products
    const sampleProducts = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        inventoryQuantity: true,
        trackInventory: true,
        status: true
      },
      take: 5
    });
    
    console.log('\n📦 Sample products after update:');
    sampleProducts.forEach(product => {
      console.log(`- ${product.name}: ${product.inventoryQuantity} units (tracking: ${product.trackInventory})`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing inventory:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductInventory();
