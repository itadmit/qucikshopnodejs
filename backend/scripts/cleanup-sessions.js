import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ניקוי sessions ישנים ופגי תוקף
 */
async function cleanupSessions() {
  try {
    console.log('🧹 מתחיל ניקוי sessions ישנים...');
    
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    
    // מחיקת sessions שלא היו פעילים ב-10 דקות האחרונות או שפגו
    const result = await prisma.activeSession.deleteMany({
      where: {
        OR: [
          {
            lastActivity: {
              lt: tenMinutesAgo
            }
          },
          {
            expiresAt: {
              lt: now
            }
          }
        ]
      }
    });
    
    console.log(`✅ נמחקו ${result.count} sessions ישנים`);
    
    // סטטיסטיקות
    const remainingSessions = await prisma.activeSession.count();
    console.log(`📊 נשארו ${remainingSessions} sessions פעילים`);
    
    // ניקוי אירועי אנליטיקס ישנים (יותר מ-30 יום)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oldEventsResult = await prisma.analyticsEvent.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    console.log(`🗑️ נמחקו ${oldEventsResult.count} אירועי אנליטיקס ישנים (יותר מ-30 יום)`);
    
  } catch (error) {
    console.error('❌ שגיאה בניקוי sessions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// הרצה מיידית אם הקובץ נקרא ישירות
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupSessions();
}

export default cleanupSessions;
