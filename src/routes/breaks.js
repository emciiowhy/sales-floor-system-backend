import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Get today's breaks for an agent (must be before /:id route)
// Shift starts at 9:30 PM (21:30) and resets each day at 9:30 PM
router.get('/agent/:agentId/today', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    // Calculate current shift start time (9:30 PM)
    // If current time is before 9:30 PM today, shift started yesterday at 9:30 PM
    // If current time is after 9:30 PM today, shift started today at 9:30 PM
    const now = new Date();
    const shiftStart = new Date(now);
    shiftStart.setHours(21, 30, 0, 0); // 9:30 PM
    
    // If it's before 9:30 PM today, the shift started yesterday at 9:30 PM
    if (now < shiftStart) {
      shiftStart.setDate(shiftStart.getDate() - 1);
    }

    const breaks = await prisma.break.findMany({
      where: {
        agentId,
        startTime: {
          gte: shiftStart
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    // Calculate bio break usage for current shift
    const bioBreaks = breaks.filter(b => b.type === 'BIO');
    const bioMinutesUsed = bioBreaks.reduce((total, breakRecord) => {
      if (breakRecord.endTime) {
        const duration = (breakRecord.endTime - breakRecord.startTime) / 1000 / 60;
        return total + duration;
      }
      // If break is still active, count elapsed time
      const elapsed = (now - breakRecord.startTime) / 1000 / 60;
      return total + elapsed;
    }, 0);

    res.json({
      breaks,
      bioBreakPool: {
        total: 15,
        used: Math.round(bioMinutesUsed),
        remaining: Math.max(0, 15 - Math.round(bioMinutesUsed))
      }
    });
  } catch (error) {
    console.error('Error fetching breaks:', error);
    res.status(500).json({ error: 'Failed to fetch breaks' });
  }
});

// Start a break
router.post('/', async (req, res) => {
  try {
    const { agentId, type } = req.body;

    if (!agentId || !type) {
      return res.status(400).json({ error: 'Missing agentId or type' });
    }

    const validTypes = ['FIRST', 'SECOND', 'LUNCH', 'BIO'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid break type' });
    }

    const breakRecord = await prisma.break.create({
      data: {
        agentId,
        type,
        startTime: new Date()
      }
    });

    res.status(201).json(breakRecord);
  } catch (error) {
    console.error('Error starting break:', error);
    res.status(500).json({ error: 'Failed to start break' });
  }
});

// End a break (must be last to avoid conflicts with /agent/:agentId routes)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const breakRecord = await prisma.break.update({
      where: { id },
      data: {
        endTime: new Date()
      }
    });

    res.json(breakRecord);
  } catch (error) {
    console.error('Error ending break:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Break not found' });
    }
    res.status(500).json({ error: 'Failed to end break' });
  }
});

export default router;

