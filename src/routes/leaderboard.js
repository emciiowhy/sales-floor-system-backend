import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

let cache = { data: null, timestamp: 0 };

router.get('/', async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    const now = Date.now();

    // Return cached data if less than 30 seconds old
    if (cache.data && cache.data.period === period && (now - cache.timestamp) < 30000) {
      return res.json(cache.data.leaderboard);
    }

    const dateNow = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate());
        break;
      case 'weekly':
        const dayOfWeek = dateNow.getDay();
        startDate = new Date(dateNow);
        startDate.setDate(dateNow.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1);
        break;
      default:
        startDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate());
    }

    // Get all agents with their pass-ups
    const agents = await prisma.agent.findMany({
      include: {
        passUps: {
          where: {
            date: { gte: startDate }
          }
        }
      }
    });

    // Calculate stats for each agent
    const leaderboard = agents
      .map(agent => {
        const hot = agent.passUps.filter(p => p.disposition === 'HOT').length;
        const warm = agent.passUps.filter(p => p.disposition === 'WARM').length;
        const int = agent.passUps.filter(p => p.disposition === 'INT').length;
        const total = agent.passUps.length;
        const productive = hot + warm + int;

        return {
          agentId: agent.id,
          agentName: agent.name,
          hot,
          warm,
          int,
          total,
          productive
        };
      })
      .filter(agent => agent.total > 0) // Only show agents with activity
      .sort((a, b) => {
        // Sort by productive first, then by hot, then by warm
        if (b.productive !== a.productive) return b.productive - a.productive;
        if (b.hot !== a.hot) return b.hot - a.hot;
        if (b.warm !== a.warm) return b.warm - a.warm;
        return b.int - a.int;
      })
      .map((agent, index) => ({
        ...agent,
        rank: index + 1
      }));

    // Cache the result
    cache = {
      data: { leaderboard, period },
      timestamp: now
    };

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;