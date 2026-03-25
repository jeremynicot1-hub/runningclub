'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { io, Socket } from 'socket.io-client';

export default function ClubChatPage() {
  const { user } = useAuth();
  const params = useParams();
  const clubId = params.id as string;
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch initial messages
    apiFetch<any[]>(`/api/messages/club/${clubId}?type=CHAT`).then(setMessages).catch(console.error);

    // 2. Setup socket
    const s = io('http://localhost:5000');
    setSocket(s);

    s.on('connect', () => {
      s.emit('join-room', clubId);
    });

    s.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => { s.disconnect(); };
  }, [clubId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !socket || !user) return;

    socket.emit('send-message', {
      content: content.trim(),
      senderId: user.id,
      clubId: clubId,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: user.role,
      type: 'CHAT'
    });

    setContent('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: 0 }}>
      {/* Header */}
      <div style={{ padding: '0 0 20px 0' }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Messagerie du club</h1>
        <p style={{ color: 'var(--ks-text-muted)', fontSize: 14 }}>Discutez avec les membres du club en temps réel.</p>
      </div>

      {/* Messages Area */}
      <div className="k-widget" style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, background: 'white', marginBottom: 20 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--ks-text-muted)', marginTop: 40, fontSize: 14 }}>
            Aucun message pour le moment. Soyez le premier à écrire !
          </div>
        )}
        {messages.map((m, i) => {
          const isMe = m.senderId === user?.id;
          return (
            <div key={m.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexDirection: isMe ? 'row-reverse' : 'row' }}>
                <span style={{ fontWeight: 800, fontSize: 12 }}>{m.sender?.firstName || m.senderName} {m.sender?.lastName || ''}</span>
                <span style={{ fontSize: 10, color: 'var(--ks-text-muted)', background: 'var(--ks-bg)', padding: '2px 6px', borderRadius: 4 }}>{m.sender?.role || m.senderRole}</span>
              </div>
              <div style={{ 
                maxWidth: '70%', padding: '10px 16px', borderRadius: 16, fontSize: 14,
                background: isMe ? 'var(--ks-primary)' : 'var(--ks-bg)',
                color: isMe ? 'white' : 'var(--ks-text-main)',
                borderBottomRightRadius: isMe ? 4 : 16,
                borderBottomLeftRadius: isMe ? 16 : 4
              }}>
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 12 }}>
        <input 
          type="text" 
          value={content} 
          onChange={e => setContent(e.target.value)}
          placeholder="Écrivez votre message..."
          style={{ 
            flex: 1, padding: '14px 20px', borderRadius: 12, border: '1px solid var(--ks-border)', 
            background: 'white', fontSize: 15, outline: 'none', boxShadow: 'var(--ks-shadow)'
          }}
        />
        <button type="submit" className="k-btn k-btn-primary" style={{ padding: '0 24px', borderRadius: 12 }}>Envoyer</button>
      </form>
    </div>
  );
}
