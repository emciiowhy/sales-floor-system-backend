import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Get or create break schedule for agent
router.get('/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;

    let schedule = await prisma.breakSchedule.findUnique({
      where: { agentId }
    });

    // Create default schedule if doesn't exist
    if (!schedule) {
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
    }

    res.json(schedule);
  } catch (error) {
    console.error('Error fetching break schedule:', error);
    res.status(500).json({ error: 'Failed to fetch break schedule' });
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

