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
  
  const [club, setClub] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch club and channels
    apiFetch<any>(`/api/clubs/${clubId}`).then(data => {
      setClub(data);
      setChannels(data.channels || []);
      if (data.channels?.length > 0) {
        setActiveChannel(data.channels[0]);
      }
    }).catch(console.error);
 
    const s = io('http://localhost:5000');
    setSocket(s);
    return () => { s.disconnect(); };
  }, [clubId]);

  useEffect(() => {
    if (!activeChannel || !socket) return;
    
    // Join channel room
    socket.emit('join-room', `channel:${activeChannel.id}`);
    
    // Fetch messages for this channel
    apiFetch<any[]>(`/api/messages/club/${clubId}?channelId=${activeChannel.id}`).then(setMessages).catch(console.error);

    const onMessage = (msg: any) => {
      if (msg.channelId === activeChannel.id) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on('new-message', onMessage);
    
    return () => { socket.off('new-message', onMessage); };
  }, [activeChannel, socket, clubId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !socket || !user || !activeChannel) return;

    socket.emit('send-message', {
      content: content.trim(),
      senderId: user.id,
      clubId: clubId,
      channelId: activeChannel.id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: user.role,
      type: 'CHAT'
    });

    setContent('');
  };

  if (!club) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: 'calc(100vh - 180px)', gap: 0, background: 'white' }}>
      
      {/* Left Sidebar: Channels */}
      <div style={{ background: '#f8f9fa', padding: '32px 24px', borderRight: '1px solid var(--ks-border)', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 11, fontWeight: 800, color: 'var(--ks-text-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Salons du Club</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {channels.map(ch => (
            <button 
              key={ch.id} 
              onClick={() => setActiveChannel(ch)}
              style={{ 
                padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 700, textAlign: 'left',
                background: activeChannel?.id === ch.id ? 'white' : 'transparent',
                color: activeChannel?.id === ch.id ? 'var(--ks-primary)' : 'var(--ks-text-muted)',
                boxShadow: activeChannel?.id === ch.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 10
              }}
            >
              <span style={{ opacity: 0.5 }}>#</span>
              {ch.name}
            </button>
          ))}
        </div>

        <div style={{ padding: '20px 0', borderTop: '1px solid var(--ks-border-light)' }}>
          <h3 style={{ fontSize: 11, fontWeight: 800, color: 'var(--ks-text-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Athlètes en ligne</h3>
          <div style={{ display: 'flex', gap: -8 }}>
            {club.members?.slice(0, 5).map((m: any, i: number) => (
              <div key={m.id} style={{ 
                width: 32, height: 32, borderRadius: '50%', background: 'var(--ks-primary)', color: 'white',
                border: '2px solid #f8f9fa', marginLeft: i > 0 ? -10 : 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900
              }}>
                {m.firstName[0]}
              </div>
            ))}
            {club.members?.length > 5 && (
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', background: '#eee', 
                border: '2px solid #f8f9fa', marginLeft: -10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800
              }}>
                +{club.members.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center: Chat Area */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'white' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }} className="custom-scrollbar">
          {messages.map((m, i) => {
            const isMe = m.senderId === user?.id;
            return (
              <div key={m.id || i} style={{ display: 'flex', gap: 16, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: 12, 
                  background: isMe ? 'var(--ks-primary)' : '#f0f2f5', 
                  flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: 14, fontWeight: 900, color: isMe ? 'white' : 'var(--ks-text-main)'
                }}>
                  {m.sender?.firstName?.[0] || 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>{m.sender?.firstName} {m.sender?.lastName}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ks-text-light)', textTransform: 'uppercase' }}>10:42</span>
                  </div>
                  <div style={{ 
                    padding: '14px 20px', borderRadius: 18, fontSize: 15, lineHeight: 1.5,
                    background: isMe ? 'var(--ks-primary)' : '#f0f2f5',
                    color: isMe ? 'white' : 'var(--ks-text-main)',
                    borderTopRightRadius: isMe ? 4 : 18,
                    borderTopLeftRadius: isMe ? 18 : 4,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}>
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>

        {/* Message Input */}
        <div style={{ padding: '24px 40px', borderTop: '1px solid var(--ks-border-light)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--ks-bg)', borderRadius: 12, padding: '8px 16px' }}>
            <button type="button" style={{ background: 'none', border: 'none', color: 'var(--ks-text-light)', cursor: 'pointer' }}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </button>
            <input 
              type="text" 
              placeholder={`Écrire dans #${activeChannel?.name || 'salon'}...`}
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{ flex: 1, border: 'none', background: 'transparent', padding: '10px 0', fontSize: 14, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" style={{ background: 'var(--ks-primary)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 800 }}>Envoyer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
