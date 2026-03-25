import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        club: { select: { id: true, name: true, city: true } },
        teams: { include: { team: true } }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update current user profile
router.put('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, sport, license, dob, height, weight } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        firstName, lastName, sport, license,
        dob: dob ? new Date(dob) : undefined,
        height, weight
      }
    });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get club members (for coach)
router.get('/club/:clubId', authenticate, async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      where: { clubId: req.params.clubId },
      select: { id: true, firstName: true, lastName: true, role: true, email: true, license: true }
    });
    res.json(members);
  } catch {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

export default router;
