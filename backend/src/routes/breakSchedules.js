import express from 'express';
import prisma from '../utils/prisma.js';
import { appendFileSync } from 'fs';

const router = express.Router();

// Validate prisma is initialized
if (!prisma || !prisma.agent) {
  console.error('Prisma client is not properly initialized');
}

// Get or create break schedule for agent
router.get('/agent/:agentId', async (req, res) => {
  // #region agent log
  const logData = {location:'breakSchedules.js:12',message:'Route handler entry',data:{agentId:req.params.agentId,prismaExists:!!prisma,prismaAgentExists:!!(prisma&&prisma.agent),prismaBreakScheduleExists:!!(prisma&&prisma.breakSchedule)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
  appendFileSync('c:\\Users\\Admin\\sales-floor-system\\.cursor\\debug.log', JSON.stringify(logData) + '\n');
  // #endregion
  try {
    if (!prisma || !prisma.agent) {
      // #region agent log
      const logData2 = {location:'breakSchedules.js:15',message:'Prisma check failed',data:{prismaExists:!!prisma,prismaAgentExists:!!(prisma&&prisma.agent)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
      appendFileSync('c:\\Users\\Admin\\sales-floor-system\\.cursor\\debug.log', JSON.stringify(logData2) + '\n');
      // #endregion
      throw new Error('Prisma client is not initialized');
    }

    const { agentId } = req.params;
    // #region agent log
    const logData3 = {location:'breakSchedules.js:19',message:'After agentId extraction',data:{agentId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
    appendFileSync('c:\\Users\\Admin\\sales-floor-system\\.cursor\\debug.log', JSON.stringify(logData3) + '\n');
    // #endregion

    // First verify agent exists
    // #region agent log
    const logData4 = {location:'breakSchedules.js:21',message:'Before agent.findUnique',data:{agentId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
    appendFileSync('c:\\Users\\Admin\\sales-floor-system\\.cursor\\debug.log', JSON.stringify(logData4) + '\n');
    // #endregion
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });
    // #region agent log
    const logData5 = {location:'breakSchedules.js:25',message:'After agent.findUnique',data:{agentId,agentFound:!!agent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
    appendFileSync('c:\\Users\\Admin\\sales-floor-system\\.cursor\\debug.log', JSON.stringify(logData5) + '\n');
    // #endregion

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // #region agent log
    const logData6 = {location:'breakSchedules.js:30',message:'Before breakSchedule.findUnique',data:{agentId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
    appendFileSync('c:\\Users\\Admin\\sales-floor-system\\.cursor\\debug.log', JSON.stringify(logData6) + '\n');
    // #endregion
    let schedule = await prisma.breakSchedule.findUnique({
      where: { agentId }
    });
    // #region agent log
    const logData7 = {location:'breakSchedules.js:33',message:'After breakSchedule.findUnique',data:{agentId,scheduleFound:!!schedule},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
    appendFileSync('c:\\Users\\Admin\\sales-floor-system\\.cursor\\debug.log', JSON.stringify(logData7) + '\n');
    // #endregion

    // Create default schedule if doesn't exist
    if (!schedule) {
      try {
        schedule = await prisma.breakSchedule.create({
          data: {
            agentId,
            firstBreak: '10:00',
            secondBreak: '14:00',
            lunchTime: '12:30',
            endOfShift: '17:00',
            alarmEnabled: true,
            alarmVolume: 70
          }
        });
      } catch (createError) {
        // If creation fails (e.g., unique constraint), try to fetch again
        if (createError.code === 'P2002') {
          schedule = await prisma.breakSchedule.findUnique({
            where: { agentId }
          });
        } else {
          throw createError;
        }
      }
    }

    // #region agent log
    const logData8 = {location:'breakSchedules.js:59',message:'Before sending response',data:{agentId,scheduleId:schedule?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
    appendFileSync('c:\\Users\\Admin\\sales-floor-system\\.cursor\\debug.log', JSON.stringify(logData8) + '\n');
    // #endregion
    res.json(schedule);
  } catch (error) {
    // #region agent log
    const logData9 = {location:'breakSchedules.js:62',message:'Error in route handler',data:{errorMessage:error.message,errorName:error.name,errorCode:error.code,stack:error.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'};
    appendFileSync('c:\\Users\\Admin\\sales-floor-system\\.cursor\\debug.log', JSON.stringify(logData9) + '\n');
    // #endregion
    console.error('Error fetching break schedule:', error);
    res.status(500).json({ 
      error: 'Failed to fetch break schedule',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update break schedule
router.put('/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { firstBreak, secondBreak, lunchTime, endOfShift, alarmEnabled, alarmVolume } = req.body;

    const schedule = await prisma.breakSchedule.upsert({
      where: { agentId },
      update: {
        firstBreak,
        secondBreak,
        lunchTime,
        endOfShift,
        alarmEnabled: alarmEnabled !== undefined ? alarmEnabled : true,
        alarmVolume: alarmVolume !== undefined ? alarmVolume : 70
      },
      create: {
        agentId,
        firstBreak: firstBreak || '10:00',
        secondBreak: secondBreak || '14:00',
        lunchTime: lunchTime || '12:30',
        endOfShift: endOfShift || '17:00',
        alarmEnabled: alarmEnabled !== undefined ? alarmEnabled : true,
        alarmVolume: alarmVolume !== undefined ? alarmVolume : 70
      }
    });

    res.json(schedule);
  } catch (error) {
    console.error('Error updating break schedule:', error);
    res.status(500).json({ error: 'Failed to update break schedule' });
  }
});

export default router;

