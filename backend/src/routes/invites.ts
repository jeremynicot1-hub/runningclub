import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Send an invite
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId, receiverEmail } = req.body;
    
    const receiver = await prisma.user.findUnique({ where: { email: receiverEmail } });
    if (!receiver) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const invite = await prisma.sessionInvite.create({
      data: {
        sessionId,
        senderId: req.user!.userId,
        receiverId: receiver.id,
        status: 'PENDING'
      }
    });

    res.json(invite);
  } catch (error) {
    res.status(500).json({ error: 'Échec de l\'envoi de l\'invitation' });
  }
});

// Get received invites
router.get('/received', authenticate, async (req: AuthRequest, res) => {
  try {
    const invites = await prisma.sessionInvite.findMany({
      where: { receiverId: req.user!.userId, status: 'PENDING' },
      include: {
        sender: { select: { firstName: true, lastName: true } },
        session: true
      } as any
    });
    res.json(invites);
  } catch (error) {
    res.status(500).json({ error: 'Échec de la récupération des invitations' });
  }
});

// Respond to invite
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body; // APPROVED or REJECTED
    const invite = await prisma.sessionInvite.update({
      where: { id: req.params.id as string, receiverId: req.user!.userId },
      data: { status }
    });
    res.json(invite);
  } catch (error) {
    res.status(500).json({ error: 'Échec de la réponse à l\'invitation' });
  }
});

export default router;
