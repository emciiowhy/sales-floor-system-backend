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

// Get agent stats
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

export default router;

