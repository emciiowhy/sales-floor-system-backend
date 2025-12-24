import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

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

// End a break
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
    res.status(500).json({ error: 'Failed to end break' });
  }
});

// Get today's breaks for an agent
router.get('/agent/:agentId/today', async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const breaks = await prisma.break.findMany({
      where: {
        agentId,
        startTime: {
          gte: today
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    // Calculate bio break usage
    const bioBreaks = breaks.filter(b => b.type === 'BIO');
    const bioMinutesUsed = bioBreaks.reduce((total, breakRecord) => {
      if (breakRecord.endTime) {
        const duration = (breakRecord.endTime - breakRecord.startTime) / 1000 / 60;
        return total + duration;
      }
      return total;
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

export default router;