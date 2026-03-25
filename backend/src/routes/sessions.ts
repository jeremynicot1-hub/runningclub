import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Create session (coach only)
router.post('/', authenticate, requireRole('COACH'), async (req: AuthRequest, res) => {
  try {
    const { date, type, description, duration, targetDistance, teamId, userId } = req.body;
    const session = await prisma.session.create({
      data: {
        date: new Date(date),
        type,
        description,
        duration,
        targetDistance,
        teamId: teamId || null,
        userId: userId || null,
        coachId: req.user!.userId
      }
    });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Get sessions for current user (athlete sees their own, coach sees all they created)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    let sessions;
    if (req.user!.role === 'COACH') {
      sessions = await prisma.session.findMany({
        where: { coachId: req.user!.userId },
        include: { result: true, team: true, user: { select: { firstName: true, lastName: true } } },
        orderBy: { date: 'asc' }
      });
    } else {
      // Athlete: sessions assigned to them OR to their teams
      const teamMemberships = await prisma.teamMember.findMany({ where: { userId: req.user!.userId } });
      const teamIds = teamMemberships.map(m => m.teamId);
      sessions = await prisma.session.findMany({
        where: {
          OR: [
            { userId: req.user!.userId },
            { teamId: { in: teamIds } }
          ]
        },
        include: { result: true, team: true },
        orderBy: { date: 'asc' }
      });
    }
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
      where: { sessionId: req.params.id },
      update: { actualDistance, time, rpe, comment },
      create: { sessionId: req.params.id, actualDistance, time, rpe, comment }
    });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to save result' });
  }
});

export default router;
