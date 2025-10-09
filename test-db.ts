import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.skgakvaxddzvoggtdder:Brideymylove72%21@aws-1-us-west-1.pooler.supabase.com:6543/postgres"
    }
  }
});

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Test creating a simple user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@h3network.org' },
      update: {},
      create: {
        email: 'test@h3network.org',
        name: 'Test User',
        role: 'VIEWER',
      },
    });
    
    console.log('✅ Test user created:', testUser.email);
    console.log('🎉 Database is working correctly!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();