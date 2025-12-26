import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Create pass-up
router.post('/', async (req, res) => {
  try {
    const {
      agentId,
      ticker,
      tickerPrice,
      leadName,
      interestedIn,
      agreedToSMS,
      disposition,
      rebuttals,
      notes
    } = req.body;

    // Validation
    if (!agentId || !ticker || !leadName || !interestedIn || disposition === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const validDispositions = ['WSMSNT', 'TIHU', 'INT', 'WARM', 'HOT'];
    if (!validDispositions.includes(disposition)) {
      return res.status(400).json({ error: 'Invalid disposition' });
    }

    const passUp = await prisma.passUp.create({
      data: {
        agentId,
        ticker: ticker.toUpperCase(),
        tickerPrice,
        leadName,
        interestedIn,
        agreedToSMS: agreedToSMS || false,
        disposition,
        rebuttals: rebuttals || {},
        notes: notes || null
      }
    });

    res.status(201).json(passUp);
  } catch (error) {
    console.error('Error creating pass-up:', error);
    res.status(500).json({ error: 'Failed to create pass-up' });
  }
});

// Get agent stats - MORE SPECIFIC, must come before /agent/:agentId
router.get('/agent/:agentId/stats', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { period = 'daily' } = req.query;

    const now = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const passUps = await prisma.passUp.findMany({
      where: {
        agentId,
        date: { gte: startDate }
      }
    });

    const stats = {
      hot: passUps.filter(p => p.disposition === 'HOT').length,
      warm: passUps.filter(p => p.disposition === 'WARM').length,
      int: passUps.filter(p => p.disposition === 'INT').length,
      tihu: passUps.filter(p => p.disposition === 'TIHU').length,
      wsmsnt: passUps.filter(p => p.disposition === 'WSMSNT').length,
      total: passUps.length
    };

    const productive = stats.hot + stats.warm + stats.int;
    const productiveGoal = period === 'daily' ? 8 : period === 'weekly' ? 40 : 100;
    const totalGoal = period === 'daily' ? 10 : period === 'weekly' ? 50 : 120;

    stats.targetProgress = {
      productive,
      productiveGoal,
      totalGoal,
      productivePercent: Math.round((productive / productiveGoal) * 100),
      totalPercent: Math.round((stats.total / totalGoal) * 100)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get agent's pass-ups with date filtering
router.get('/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { startDate, endDate, limit = 50 } = req.query;

    const where = { agentId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const passUps = await prisma.passUp.findMany({
      where,
      orderBy: { date: 'desc' },
      take: parseInt(limit)
    });

    res.json(passUps);
  } catch (error) {
    console.error('Error fetching pass-ups:', error);
    res.status(500).json({ error: 'Failed to fetch pass-ups' });
  }
});

// Delete pass-up
router.delete('/:passUpId', async (req, res) => {
  try {
    console.log(`[DELETE] passUpId: ${req.params.passUpId}, agentId: ${req.query.agentId}`);
    const { passUpId } = req.params;
    const { agentId } = req.query;

    if (!passUpId || !agentId) {
      console.log(`[DELETE] Missing parameters - passUpId: ${passUpId}, agentId: ${agentId}`);
      return res.status(400).json({ error: 'Missing passUpId or agentId' });
    }

    // Verify the pass-up belongs to the agent
    const passUp = await prisma.passUp.findUnique({
      where: { id: passUpId }
    });

    if (!passUp) {
      console.log(`[DELETE] Pass-up not found: ${passUpId}`);
      return res.status(404).json({ error: 'Pass-up not found' });
    }

    if (passUp.agentId !== agentId) {
      console.log(`[DELETE] Unauthorized - passUp.agentId: ${passUp.agentId}, req.agentId: ${agentId}`);
      return res.status(403).json({ error: 'Unauthorized: Pass-up does not belong to this agent' });
    }

    await prisma.passUp.delete({
      where: { id: passUpId }
    });

    console.log(`[DELETE] Successfully deleted pass-up: ${passUpId}`);
    res.json({ success: true, message: 'Pass-up deleted successfully' });
  } catch (error) {
    console.error('Error deleting pass-up:', error);
    res.status(500).json({ error: 'Failed to delete pass-up', details: error.message });
  }
});

// Update pass-up
router.patch('/:passUpId', async (req, res) => {
  try {
    console.log(`[PATCH] passUpId: ${req.params.passUpId}, agentId: ${req.query.agentId}`);
    const { passUpId } = req.params;
    const { agentId } = req.query;
    const {
      ticker,
      leadName,
      interestedIn,
      agreedToSMS,
      disposition,
      rebuttals,
      notes,
      tickerPrice
    } = req.body;

    if (!passUpId || !agentId) {
      console.log(`[PATCH] Missing parameters - passUpId: ${passUpId}, agentId: ${agentId}`);
      return res.status(400).json({ error: 'Missing passUpId or agentId' });
    }

    // Verify the pass-up belongs to the agent
    const passUp = await prisma.passUp.findUnique({
      where: { id: passUpId }
    });

    if (!passUp) {
      console.log(`[PATCH] Pass-up not found: ${passUpId}`);
      return res.status(404).json({ error: 'Pass-up not found' });
    }

    if (passUp.agentId !== agentId) {
      console.log(`[PATCH] Unauthorized - passUp.agentId: ${passUp.agentId}, req.agentId: ${agentId}`);
      return res.status(403).json({ error: 'Unauthorized: Pass-up does not belong to this agent' });
    }

    // Validate disposition if provided
    if (disposition !== undefined) {
      const validDispositions = ['WSMSNT', 'TIHU', 'INT', 'WARM', 'HOT'];
      if (!validDispositions.includes(disposition)) {
        return res.status(400).json({ error: 'Invalid disposition' });
      }
    }

    const updatedPassUp = await prisma.passUp.update({
      where: { id: passUpId },
      data: {
        ...(ticker !== undefined && { ticker: ticker.toUpperCase() }),
        ...(leadName !== undefined && { leadName }),
        ...(interestedIn !== undefined && { interestedIn }),
        ...(agreedToSMS !== undefined && { agreedToSMS }),
        ...(disposition !== undefined && { disposition }),
        ...(rebuttals !== undefined && { rebuttals }),
        ...(notes !== undefined && { notes }),
        ...(tickerPrice !== undefined && { tickerPrice })
      }
    });

    console.log(`[PATCH] Successfully updated pass-up: ${passUpId}`);
    res.json(updatedPassUp);
  } catch (error) {
    console.error('Error updating pass-up:', error);
    res.status(500).json({ error: 'Failed to update pass-up', details: error.message });
  }
});

export default router;

