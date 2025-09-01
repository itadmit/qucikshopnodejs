import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkProductVariants() {
  try {
    const product = await prisma.product.findFirst({
      where: { 
        slug: 'חולצת-יוגב',
        store: { slug: 'my-store' }
      },
      include: {
        options: {
          include: {
            values: true
          }
        },
        variants: true
      }
    });
    
    console.log('Product found:', !!product);
    if (product) {
      console.log('Product ID:', product.id);
      console.log('Product options count:', product.options.length);
      console.log('Product variants count:', product.variants.length);
      
      console.log('\n=== OPTIONS ===');
      product.options.forEach((option, i) => {
        console.log(`Option ${i + 1}: ${option.name} (${option.values.length} values)`);
        option.values.forEach(value => {
          console.log(`  - ${value.value}`);
        });
      });
      
      console.log('\n=== VARIANTS ===');
      product.variants.forEach((variant, i) => {
        console.log(`Variant ${i + 1}:`, {
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          options: variant.options
        });
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductVariants();
