import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get global feed messages
router.get('/feed', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { clubs: { select: { id: true } }, ownedClub: true } as any
    });
    
    const clubIds: string[] = (user as any)?.clubs.map((c: any) => c.id) || [];
    if ((user as any)?.ownedClub && !clubIds.includes((user as any).ownedClub.id)) {
      clubIds.push((user as any).ownedClub.id);
    }

    if (clubIds.length === 0) {
      return res.json([]);
    }

    const messages = await prisma.message.findMany({
      where: { clubId: { in: clubIds }, teamId: null, type: 'POST' } as any,
      include: { 
        sender: { select: { id: true, firstName: true, lastName: true, role: true } },
        club: { select: { id: true, name: true, primaryColor: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Failed to fetch global feed' });
  }
});

// Get messages for a club (optionally filtered by type and channel)
router.get('/club/:clubId', authenticate, async (req, res) => {
  try {
    const { type, channelId } = req.query;
    const where: any = { clubId: req.params.clubId as string, teamId: null };
    if (type) where.type = type as string;
    if (channelId) where.channelId = channelId as string;

    const messages = await prisma.message.findMany({
      where,
      include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100
    });
    res.json(messages);
  } catch {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post a message to a club (chat or post)
router.post('/club/:clubId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content, type, channelId } = req.body;
    const message = await prisma.message.create({
      data: { 
        content, 
        senderId: req.user!.userId, 
        clubId: req.params.clubId as string,
        channelId: channelId,
        type: type || 'CHAT'
      },
      include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } }
    } as any);
    res.json(message);
  } catch {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
