#!/usr/bin/env node

// Test database connection script
// Usage: node test-db-connection.js

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function testDatabaseConnection() {
    console.log('🔍 Testing database connection...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    try {
        // Test basic connection
        await prisma.$connect();
        console.log('✅ Database connection successful!');
        
        // Test a simple query
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        console.log('✅ Database query test successful:', result);
        
        // Test if tables exist
        try {
            const userCount = await prisma.user.count();
            console.log(`✅ Users table exists with ${userCount} records`);
        } catch (error) {
            console.log('⚠️  Users table might not exist yet. Run migrations first.');
        }
        
        try {
            const storeCount = await prisma.store.count();
            console.log(`✅ Stores table exists with ${storeCount} records`);
        } catch (error) {
            console.log('⚠️  Stores table might not exist yet. Run migrations first.');
        }
        
        console.log('\n🎉 Database connection test completed successfully!');
        
    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error('Error:', error.message);
        
        if (error.message.includes('ENOTFOUND')) {
            console.error('\n💡 Possible solutions:');
            console.error('1. Check if the database host is correct');
            console.error('2. Verify network connectivity');
            console.error('3. Check if RDS instance is running');
        }
        
        if (error.message.includes('Access denied')) {
            console.error('\n💡 Possible solutions:');
            console.error('1. Check username and password');
            console.error('2. Verify database user permissions');
            console.error('3. Check if database exists');
        }
        
        if (error.message.includes('timeout')) {
            console.error('\n💡 Possible solutions:');
            console.error('1. Check RDS security group settings');
            console.error('2. Verify VPC and subnet configuration');
            console.error('3. Check if port 3306 is open');
        }
        
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the test
testDatabaseConnection().catch(console.error); 