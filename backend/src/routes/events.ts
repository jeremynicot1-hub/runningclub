import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get all events for a club
router.get('/club/:clubId', authenticate, async (req: AuthRequest, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { clubId: req.params.clubId as string },
      orderBy: { date: 'asc' }
    });
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get global events (all clubs for the user)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { clubs: { select: { id: true } } } as any
    });
    const clubIds = (user as any)?.clubs.map((c: any) => c.id) || [];
    
    const events = await prisma.event.findMany({
      where: { clubId: { in: clubIds } },
      orderBy: { date: 'asc' }
    });
    res.json(events);
  } catch {
    res.status(500).json({ error: 'Failed to fetch global events' });
  }
});

// Create event (coach only)
router.post('/', authenticate, requireRole('COACH'), async (req: AuthRequest, res) => {
  try {
    const { name, date, location, clubId } = req.body;
    const event = await prisma.event.create({
      data: { name, date: new Date(date), location, clubId }
    });
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;
