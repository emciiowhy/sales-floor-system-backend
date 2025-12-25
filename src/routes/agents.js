import express from 'express';
import prisma from '../utils/prisma.js';

const router = express.Router();

// Create or get agent by name
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Agent name is required' });
    }

    const agent = await prisma.agent.upsert({
      where: { name: name.trim() },
      update: {},
      create: { name: name.trim() }
    });

    res.json(agent);
  } catch (error) {
    console.error('Error creating/getting agent:', error);
    res.status(500).json({ error: 'Failed to create/get agent' });
  }
});

// Get agent by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        passUps: {
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// Update agent
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, customScript } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (customScript !== undefined) updateData.customScript = customScript;

    const agent = await prisma.agent.update({
      where: { id },
      data: updateData
    });

    res.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

export default router;

