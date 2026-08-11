import { prisma } from './utils/prisma';

async function testPrisma() {
  try {
    console.log('Testing Prisma Client with Driver Adapter...');
    const userCount = await prisma.user.count();
    console.log('✅ Prisma connected! Current user count:', userCount);
  } catch (err) {
    console.error('❌ Prisma Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
