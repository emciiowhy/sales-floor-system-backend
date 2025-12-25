import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
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

        return {
          agentId: agent.id,
          agentName: agent.name,
          hot,
          warm,
          int,
          total,
          productive: hot + warm + int
        };
      })
      .filter(agent => agent.total > 0) // Only show agents with activity
      .sort((a, b) => {
        // Sort by productive first, then by total
        if (b.productive !== a.productive) {
          return b.productive - a.productive;
        }
        return b.total - a.total;
      })
      .map((agent, index) => ({
        ...agent,
        rank: index + 1
      }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;

