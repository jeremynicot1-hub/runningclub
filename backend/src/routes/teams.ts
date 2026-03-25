import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Create team
router.post('/', authenticate, requireRole('COACH'), async (req: AuthRequest, res) => {
  try {
    const { name, clubId } = req.body;
    if (!clubId) return res.status(400).json({ error: 'clubId is required' });
    
    // Verify coach belongs to this club
    const coach = await prisma.user.findUnique({ 
      where: { id: req.user!.userId },
      include: { clubs: { select: { id: true } } } as any
    });
    const belongsToClub = (coach as any)?.clubs.some((c: any) => c.id === clubId);
    if (!belongsToClub) return res.status(403).json({ error: 'You do not have permission to create a team for this club' });
    
    const team = await prisma.team.create({
      data: { name, clubId, coachId: req.user!.userId }
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
      where: { clubId: req.params.clubId as string },
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
      data: { teamId: req.params.id as string, userId: userId as string }
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
      where: { teamId_userId: { teamId: req.params.id as string, userId: req.params.userId as string } }
    });
    res.json({ message: 'Member removed' });
  } catch {
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

export default router;
