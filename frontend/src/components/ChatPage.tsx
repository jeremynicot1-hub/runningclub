'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { apiFetch, API_URL } from '@/lib/api';
import { io, Socket } from 'socket.io-client';

interface Message { id: string; content: string; sender: { id: string; firstName: string; lastName: string; role: string }; createdAt: string; }

function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.clubId) return;
    apiFetch<Message[]>(`/api/messages/club/${user.clubId}`).then(setMessages).catch(() => []);
    const socket = io(API_URL);
    socketRef.current = socket;
    socket.on('connect', () => { setConnected(true); socket.emit('join-room', user.clubId); });
    socket.on('disconnect', () => setConnected(false));
    socket.on('new-message', (msg: Message) => setMessages(prev => [...prev, msg]));
    return () => { socket.disconnect(); };
  }, [user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user?.clubId || !socketRef.current) return;
    socketRef.current.emit('send-message', { content: text, senderId: user.id, clubId: user.clubId });
    setText('');
  };

  if (!user?.clubId) return (
    <div>
      <div className="topbar"><span className="topbar-title">Chat</span></div>
      <div className="page"><div className="card"><div className="empty-state"><div className="empty-icon">💬</div><div className="empty-title">Pas de club</div><div className="empty-desc">Rejoignez ou créez un club pour accéder au chat.</div></div></div></div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="topbar">
        <span className="topbar-title">Chat du club</span>
        <span style={{ fontSize: 12, color: connected ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>● {connected ? 'Connecté' : 'Déconnecté'}</span>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '16px 28px 0' }}>
        <div className="card chat-layout">
          <div className="chat-messages">
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0', fontSize: 14 }}>
                Aucun message — soyez le premier à écrire !
              </div>
            )}
            {messages.map(msg => {
              const isOwn = msg.sender.id === user?.id;
              return (
                <div key={msg.id} className={`chat-msg ${isOwn ? 'own' : ''}`}>
                  <div className="avatar avatar-sm">{msg.sender.firstName[0]}{msg.sender.lastName[0]}</div>
                  <div>
                    {!isOwn && <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 3 }}>{msg.sender.firstName} {msg.sender.lastName} <span className={`badge ${msg.sender.role === 'COACH' ? 'badge-orange' : 'badge-green'}`} style={{ fontSize: 10 }}>{msg.sender.role === 'COACH' ? 'Coach' : 'Athlète'}</span></div>}
                    <div className={`chat-bubble ${isOwn ? 'chat-bubble-own' : 'chat-bubble-other'}`}>{msg.content}</div>
                    <div className="chat-meta" style={{ textAlign: isOwn ? 'right' : 'left' }}>{new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} className="chat-input-bar">
            <input className="form-input" value={text} onChange={e => setText(e.target.value)} placeholder="Écrivez un message..." style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary" disabled={!text.trim()}>Envoyer</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
