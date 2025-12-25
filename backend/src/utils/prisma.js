import { PrismaClient } from "@prisma/client";
import { appendFileSync } from 'fs';

let prisma;

try {
  // #region agent log
  const logData = {location:'prisma.js:6',message:'Before PrismaClient init',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
  appendFileSync('c:\\Users\\Admin\\sales-floor-system\\.cursor\\debug.log', JSON.stringify(logData) + '\n');
  // #endregion
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
  // #region agent log
  const logData2 = {location:'prisma.js:10',message:'After PrismaClient init',data:{prismaExists:!!prisma,hasAgent:!!(prisma&&prisma.agent),hasBreakSchedule:!!(prisma&&prisma.breakSchedule)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
  appendFileSync('c:\\Users\\Admin\\sales-floor-system\\.cursor\\debug.log', JSON.stringify(logData2) + '\n');
  // #endregion
} catch (error) {
  // #region agent log
  const logData3 = {location:'prisma.js:13',message:'PrismaClient init error',data:{errorMessage:error.message,errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
  appendFileSync('c:\\Users\\Admin\\sales-floor-system\\.cursor\\debug.log', JSON.stringify(logData3) + '\n');
  // #endregion
  console.error('Failed to initialize Prisma Client:', error);
  throw error;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

