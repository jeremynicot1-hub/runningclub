import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Create a club (coach only)
router.post('/', authenticate, requireRole('COACH'), async (req: AuthRequest, res) => {
  try {
    const { name, description, city } = req.body;
    const club = await prisma.club.create({
      data: { name, description, city, ownerId: req.user!.userId }
    });
    // Update user's clubId
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { clubId: club.id }
    });
    res.json(club);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create club' });
  }
});

// Get club by id
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const club = await prisma.club.findUnique({
      where: { id: req.params.id as string },
      include: {
        members: { select: { id: true, firstName: true, lastName: true, role: true, email: true } },
        teams: true,
        events: true
      }
    });
    if (!club) return res.status(404).json({ error: 'Club not found' });
    res.json(club);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch club' });
  }
});

// Join a club
router.post('/:id/join', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { clubId: req.params.id as string }
    });
    res.json({ message: 'Joined club', user });
  } catch {
    res.status(500).json({ error: 'Failed to join club' });
  }
});

// Get all clubs (for searching)
router.get('/', authenticate, async (_req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      select: { id: true, name: true, city: true, description: true, primaryColor: true }
    });
    res.json(clubs);
  } catch {
    res.status(500).json({ error: 'Failed to list clubs' });
  }
});

// Update club settings (owner only)
router.put('/:id/settings', authenticate, requireRole('COACH'), async (req: AuthRequest, res) => {
  try {
    const club = await prisma.club.findUnique({ where: { id: req.params.id as string } });
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (club.ownerId !== req.user!.userId) return res.status(403).json({ error: 'Only the owner can edit club settings' });
    
    const { name, description, city, primaryColor, bannerImage } = req.body;
    const updated = await prisma.club.update({
      where: { id: req.params.id as string },
      data: { name, description, city, primaryColor, bannerImage }
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update club settings' });
  }
});

// Create event for club
router.post('/:id/events', authenticate, requireRole('COACH'), async (req: AuthRequest, res) => {
  try {
    const { name, date, location } = req.body;
    const event = await prisma.event.create({
      data: { name, date: new Date(date), location, clubId: req.params.id as string }
    });
    res.json(event);
  } catch {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

export default router;
