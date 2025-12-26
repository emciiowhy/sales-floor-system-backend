import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Get all messages with agent details
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const messages = await prisma.message.findMany({
      include: {
        agent: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Reverse to show oldest first
    const sortedMessages = messages.reverse();

    res.json(sortedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get recent messages (for real-time chat)
router.get('/recent', async (req, res) => {
  try {
    const { since } = req.query;
    const sinceDate = since ? new Date(since) : new Date(Date.now() - 60000); // Last minute by default

    const messages = await prisma.message.findMany({
      where: {
        createdAt: { gte: sinceDate }
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    res.status(500).json({ error: 'Failed to fetch recent messages' });
  }
});

// Post a new message
router.post('/', async (req, res) => {
  try {
    const { agentId, content } = req.body;

    if (!agentId || !content || !content.trim()) {
      return res.status(400).json({ error: 'Missing agentId or content' });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({ error: 'Message is too long (max 1000 characters)' });
    }

    // Verify agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const message = await prisma.message.create({
      data: {
        agentId,
        content: content.trim()
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(`[MESSAGE] New message from ${agent.name}: ${content.substring(0, 50)}`);
    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

export default router;
