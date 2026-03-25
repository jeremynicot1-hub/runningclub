import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Create session (Coach or Athlete personal)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { date, type, description, duration, targetDistance, teamId, userId, clubId } = req.body;
    
    // If athlete, they can ONLY create sessions for themselves
    if (req.user!.role === 'ATHLETE') {
      if (userId !== req.user!.userId) {
        return res.status(403).json({ error: 'Athletes can only create personal sessions for themselves.' });
      }
      if (clubId || teamId) {
        return res.status(403).json({ error: 'Athletes cannot assign sessions to clubs or teams.' });
      }
    } else if (req.user!.role !== 'COACH') {
      return res.status(403).json({ error: 'Unauthorized role.' });
    }

    const session = await prisma.session.create({
      data: {
        date: new Date(date),
        type,
        description,
        duration,
        targetDistance,
        teamId: teamId || null,
        userId: userId || null,
        coachId: req.user!.role === 'COACH' ? req.user!.userId : null,
        clubId: clubId || null
      } as any
    });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get sessions (optionally filtered by clubId)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { clubId } = req.query;
    let where: any = {};
    
    if (clubId) {
      where.clubId = clubId as string;
    } else {
      if (req.user!.role === 'COACH') {
        where.coachId = req.user!.userId;
      } else {
        const user = await prisma.user.findUnique({
          where: { id: req.user!.userId },
          include: { 
            clubs: { select: { id: true } },
            teams: { select: { teamId: true } }
          } as any
        });
        const clubIds = (user as any)?.clubs.map((c: any) => c.id) || [];
        const teamIds = (user as any)?.teams.map((t: any) => t.teamId) || [];
        
        where.OR = [
          { userId: req.user!.userId },
          { teamId: { in: teamIds } },
          { clubId: { in: clubIds } }
        ];
      }
    }

    const sessions = await prisma.session.findMany({
      where,
      include: { result: true, team: true, user: { select: { firstName: true, lastName: true } } } as any,
      orderBy: { date: 'asc' } as any
    });
    res.json(sessions);
  } catch {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Complete a session (athlete logs result)
router.post('/:id/result', authenticate, async (req: AuthRequest, res) => {
  try {
    const { actualDistance, time, rpe, comment } = req.body;
    const result = await prisma.sessionResult.upsert({
      where: { sessionId: req.params.id as string },
      update: { actualDistance, time, rpe, comment },
      create: { sessionId: req.params.id as string, actualDistance, time, rpe, comment }
    });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to save result' });
  }
});

export default router;
