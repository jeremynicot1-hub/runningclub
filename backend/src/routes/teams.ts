import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Create team
router.post('/', authenticate, requireRole('COACH'), async (req: AuthRequest, res) => {
  try {
    const coach = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!coach?.clubId) return res.status(400).json({ error: 'Coach must belong to a club' });
    const { name } = req.body;
    const team = await prisma.team.create({
      data: { name, clubId: coach.clubId, coachId: req.user!.userId }
    });
    res.json(team);
  } catch {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Get all teams for a club
router.get('/club/:clubId', authenticate, async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: { clubId: req.params.clubId },
      include: {
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } } }
      }
    });
    res.json(teams);
  } catch {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Add member to team
router.post('/:id/members', authenticate, requireRole('COACH'), async (req: AuthRequest, res) => {
  try {
    const { userId } = req.body;
    await prisma.teamMember.create({
      data: { teamId: req.params.id, userId }
    });
    res.json({ message: 'Member added' });
  } catch {
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from team
router.delete('/:id/members/:userId', authenticate, requireRole('COACH'), async (req, res) => {
  try {
    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId: req.params.id, userId: req.params.userId } }
    });
    res.json({ message: 'Member removed' });
  } catch {
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

export default router;
