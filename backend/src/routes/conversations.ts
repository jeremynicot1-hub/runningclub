import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get all conversations for current user
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        conversations: {
          include: {
            participants: {
              select: { id: true, firstName: true, lastName: true, profileImage: true }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { sender: { select: { firstName: true } } }
            }
          },
          orderBy: { lastMessageAt: 'desc' }
        }
      } as any
    });
    res.json(user?.conversations || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Start or get a conversation with another user
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.body;
    if (userId === req.user!.userId) return res.status(400).json({ error: 'Cannot chat with yourself' });

    // Check if conversation already exists
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: req.user!.userId } } },
          { participants: { some: { id: userId } } }
        ]
      },
      include: {
        participants: { select: { id: true, firstName: true, lastName: true, profileImage: true } }
      }
    });

    if (existing) return res.json(existing);

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: req.user!.userId }, { id: userId }]
        }
      },
      include: {
        participants: { select: { id: true, firstName: true, lastName: true, profileImage: true } }
      }
    });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// Get messages for a conversation
router.get('/:id/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      include: { sender: { select: { id: true, firstName: true, lastName: true, profileImage: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post a message in a conversation
router.post('/:id/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;
    const message = await prisma.message.create({
      data: {
        content,
        senderId: req.user!.userId,
        conversationId: req.params.id
      },
      include: { sender: { select: { id: true, firstName: true, lastName: true, profileImage: true } } }
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: req.params.id },
      data: { lastMessageAt: new Date() }
    });

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
