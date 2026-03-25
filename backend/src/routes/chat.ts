import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get messages for a club
router.get('/club/:clubId', authenticate, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { clubId: req.params.clubId, teamId: null },
      include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100
    });
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post a message to a club chat
router.post('/club/:clubId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;
    const message = await prisma.message.create({
      data: { content, senderId: req.user!.userId, clubId: req.params.clubId },
      include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } }
    });
    res.json(message);
  } catch {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
