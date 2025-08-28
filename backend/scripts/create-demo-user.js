import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    console.log('🔧 Creating demo user...');

    // Hash the password
    const passwordHash = await bcrypt.hash('demo123', 10);

    // Create demo user
    const user = await prisma.user.create({
      data: {
        email: 'demo@quickshop.co.il',
        passwordHash: passwordHash,
        firstName: 'דמו',
        lastName: 'משתמש',
        phone: '050-1234567',
        planType: 'PRO',
        subscriptionStatus: 'ACTIVE'
      }
    });

    console.log('✅ Demo user created successfully!');
    console.log(`📧 Email: demo@quickshop.co.il`);
    console.log(`🔑 Password: demo123`);
    console.log(`👤 User ID: ${user.id}`);

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️ Demo user already exists');
      console.log(`📧 Email: demo@quickshop.co.il`);
      console.log(`🔑 Password: demo123`);
    } else {
      console.error('❌ Error creating demo user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
