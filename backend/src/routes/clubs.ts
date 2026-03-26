import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Multer config for logos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/logos';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Create a club (coach only)
router.post('/', authenticate, requireRole('COACH'), async (req: AuthRequest, res) => {
  try {
    const { name, description, city, address, lat, lng } = req.body;
    const club = await prisma.club.create({
      data: { name, description, city, address, lat, lng, ownerId: req.user!.userId } as any
    });
    // Multi-club: connect user to this new club they created
    await prisma.user.update({ 
      where: { id: req.user!.userId }, 
      data: { clubs: { connect: { id: club.id } } } as any 
    });
    res.json(club);
  } catch {
    res.status(500).json({ error: 'Failed to create club' });
  }
});

// Get club by id
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const club = await prisma.club.findUnique({
      where: { id: req.params.id as string },
      include: {
        members: { select: { id: true, firstName: true, lastName: true, role: true, email: true, city: true } },
        teams: true,
        channels: true,
        events: true,
        sessions: true,
        joinRequests: {
          where: { status: 'PENDING' },
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } }
        }
      }
    });
    if (!club) return res.status(404).json({ error: 'Club not found' });
    res.json(club);
  } catch {
    res.status(500).json({ error: 'Failed to fetch club' });
  }
});

// Get all clubs (with optional city filter)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { city } = req.query;
    const clubs = await prisma.club.findMany({
      where: city ? { city: { contains: city as string, mode: 'insensitive' } } : {},
      select: { 
        id: true, name: true, city: true, address: true, region: true, department: true, 
        logo: true, description: true, primaryColor: true, website: true, sports: true,
        lat: true, lng: true, schedule: true,
        _count: { select: { members: true } },
        joinRequests: {
          where: { userId: req.user!.userId, status: 'PENDING' }
        }
      } as any
    });
    res.json(clubs);
  } catch {
    res.status(500).json({ error: 'Failed to list clubs' });
  }
});

// Request to join a club (creates a pending request — coach must approve)
router.post('/:id/join', authenticate, async (req: AuthRequest, res) => {
  try {
    const clubId = req.params.id as string;
    const userId = req.user!.userId;
    
    // Check if already a member
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { clubs: { select: { id: true } } } as any
    });
    const isMember = (user as any)?.clubs.some((c: any) => c.id === clubId);
    if (isMember) return res.status(400).json({ error: 'Already a member' });
    
    // Create or return existing request
    const existing = await prisma.clubJoinRequest.findUnique({ where: { userId_clubId: { userId, clubId } } });
    if (existing) return res.json({ request: existing, message: 'Request already sent' });
    
    const request = await prisma.clubJoinRequest.create({ data: { userId, clubId } });
    res.json({ request, message: 'Join request sent to coach for approval' });
  } catch {
    res.status(500).json({ error: 'Failed to send join request' });
  }
});

// Approve or reject a join request (coach/owner only)
router.put('/:id/requests/:requestId', authenticate, requireRole('COACH'), async (req: AuthRequest, res) => {
  try {
    const { status } = req.body; // 'APPROVED' | 'REJECTED'
    if (!['APPROVED', 'REJECTED'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    
    const request = await prisma.clubJoinRequest.update({
      where: { id: req.params.requestId as string },
      data: { status }
    });
    
    if (status === 'APPROVED') {
      await prisma.user.update({ 
        where: { id: request.userId }, 
        data: { clubs: { connect: { id: request.clubId } } } as any 
      });
    }
    
    res.json(request);
  } catch {
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Leave a club
router.post('/:id/leave', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const clubId = req.params.id as string;

    // Check that user is actually in this club
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { clubs: { select: { id: true } } } as any
    });
    const isMember = (user as any)?.clubs.some((c: any) => c.id === clubId);
    if (!isMember) return res.status(400).json({ error: 'You are not a member of this club' });
    
    // Prevent owner from leaving (they must delete the club)
    const club = await prisma.club.findUnique({ where: { id: clubId } });
    if (club?.ownerId === userId) return res.status(400).json({ error: 'As the club owner, you cannot leave — you must transfer ownership or delete the club.' });
    
    // Remove user from club and clean up any pending requests
    await prisma.user.update({ 
      where: { id: userId }, 
      data: { clubs: { disconnect: { id: clubId } } } as any 
    });
    await prisma.clubJoinRequest.deleteMany({ where: { userId, clubId } });
    
    res.json({ message: 'Left club successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to leave club' });
  }
});

// Upload club logo
router.post('/:id/logo', authenticate, requireRole('COACH'), upload.single('logo'), async (req: AuthRequest, res) => {
  try {
    const club = await prisma.club.findUnique({ where: { id: req.params.id as string } });
    if (!club || club.ownerId !== req.user!.userId) return res.status(403).json({ error: 'Access denied' });
    
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    await prisma.club.update({ where: { id: req.params.id as string }, data: { logo: logoUrl } });
    
    res.json({ logo: logoUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// Update club settings (owner only)
router.put('/:id/settings', authenticate, requireRole('COACH'), async (req: AuthRequest, res) => {
  try {
    const club = await prisma.club.findUnique({ where: { id: req.params.id as string } });
    if (!club) return res.status(404).json({ error: 'Club not found' });
    if (club.ownerId !== req.user!.userId) return res.status(403).json({ error: 'Only the owner can edit club settings' });
    
    const { name, description, city, address, website, sports, region, department, logo, primaryColor, bannerImage, lat, lng } = req.body;
    const updated = await prisma.club.update({
      where: { id: req.params.id as string },
      data: { name, description, city, address, website, sports, region, department, logo, primaryColor, bannerImage, lat, lng } as any
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
