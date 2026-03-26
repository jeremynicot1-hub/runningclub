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
        clubs: { select: { id: true, name: true, city: true, primaryColor: true, logo: true } },
        teams: { include: { team: true } },
        conversations: { include: { participants: { select: { id: true, firstName: true, lastName: true, profileImage: true } } } }
      } as any
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
    const { firstName, lastName, sport, license, dob, height, weight, bio, address, pb5k, pb10k, pb21k, pb42k } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        firstName, lastName, sport, license,
        dob: dob ? new Date(dob) : undefined,
        height, weight, bio, address, pb5k, pb10k, pb21k, pb42k
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
      where: { clubs: { some: { id: req.params.clubId as string } } } as any,
      select: { id: true, firstName: true, lastName: true, role: true, email: true, license: true }
    });
    res.json(members);
  } catch {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Search users
router.get('/search', authenticate, async (req: AuthRequest, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: q as string, mode: 'insensitive' } },
          { lastName: { contains: q as string, mode: 'insensitive' } },
          { email: { contains: q as string, mode: 'insensitive' } }
        ],
        NOT: { id: req.user!.userId }
      },
      select: { id: true, firstName: true, lastName: true, profileImage: true, email: true },
      take: 10
    });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;
