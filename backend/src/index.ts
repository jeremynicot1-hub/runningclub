import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.js';
import clubRoutes from './routes/clubs.js';
import teamRoutes from './routes/teams.js';
import sessionRoutes from './routes/sessions.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js';
import eventRoutes from './routes/events.js';
import inviteRoutes from './routes/invites.js';
import conversationRoutes from './routes/conversations.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date() });
});
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', chatRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/conversations', conversationRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// WebSocket for realtime chat
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', async (data: { content: string; senderId: string; clubId: string; channelId?: string; senderName: string; senderRole: string; type?: string }) => {
    try {
      const message = await prisma.message.create({
        data: { 
          content: data.content, 
          senderId: data.senderId, 
          clubId: data.clubId,
          channelId: data.channelId,
          type: data.type || 'CHAT'
        },
        include: { sender: { select: { id: true, firstName: true, lastName: true, role: true } } }
      } as any);
      
      const targetRoom = data.channelId ? `channel:${data.channelId}` : data.clubId;
      io.to(targetRoom).emit('new-message', message);
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
