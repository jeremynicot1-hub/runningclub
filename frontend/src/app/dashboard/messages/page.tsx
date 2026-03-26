'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import DashboardSidebar from '@/components/DashboardSidebar';
import Topbar from '@/components/Topbar';

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      fetchConversations();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
      const interval = setInterval(() => fetchMessages(activeConv.id), 5000); // Polling for messages
      return () => clearInterval(interval);
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await apiFetch<any[]>('/api/conversations');
      setConversations(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const data = await apiFetch<any[]>(`/api/conversations/${convId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    
    const content = newMessage;
    setNewMessage('');
    
    try {
      const msg = await apiFetch(`/api/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });
      setMessages(prev => [...prev, msg]);
      fetchConversations(); // Refresh list to update last message
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await apiFetch<any[]>(`/api/users/search?q=${q}`);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    }
  };

  const startConversation = async (otherUser: any) => {
    try {
      const conv = await apiFetch('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ userId: otherUser.id })
      });
      setConversations(prev => {
        if (prev.find(c => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
      setActiveConv(conv);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) return null;

  const getOtherParticipant = (conv: any) => {
    return conv.participants.find((p: any) => p.id !== user.id);
  };

  return (
    <div className="kinetic-app">
      <DashboardSidebar />
      <div className="kinetic-main">
        <Topbar />
        
        <div className="kinetic-content" style={{ padding: 0, height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', height: '100%' }}>
            
            {/* Conversations Sidebar */}
            <div style={{ width: 380, borderRight: '1px solid var(--ks-border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--ks-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Messages</h2>
                  <button 
                    onClick={() => setShowSearch(true)}
                    className="k-btn k-btn-primary" 
                    style={{ width: 32, height: 32, borderRadius: 10, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ks-text-muted)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Rechercher une discussion..." 
                    style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 10, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 13, outline: 'none' }} 
                  />
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {conversations.map(conv => {
                  const other = getOtherParticipant(conv);
                  const isActive = activeConv?.id === conv.id;
                  const lastMsg = conv.messages?.[0];

                  return (
                    <div 
                      key={conv.id} 
                      onClick={() => setActiveConv(conv)}
                      style={{ 
                        padding: '16px 24px', cursor: 'pointer', 
                        background: isActive ? 'var(--ks-bg)' : 'transparent',
                        borderLeft: isActive ? '4px solid var(--ks-primary)' : '4px solid transparent',
                        transition: 'all 0.2s'
                      }}
                      className="hover-bg"
                    >
                      <div style={{ display: 'flex', gap: 14 }}>
                        <div className="k-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
                          {other?.firstName?.[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{other?.firstName} {other?.lastName}</div>
                            <div style={{ fontSize: 10, color: 'var(--ks-text-muted)' }}>
                              {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--ks-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                            {lastMsg ? `${lastMsg.sender.firstName}: ${lastMsg.content}` : 'Commencer la discussion...'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
              {activeConv ? (
                <>
                  {/* Chat Header */}
                  <div style={{ padding: '16px 32px', background: 'white', borderBottom: '1px solid var(--ks-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div className="k-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                        {getOtherParticipant(activeConv)?.firstName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900 }}>{getOtherParticipant(activeConv)?.firstName} {getOtherParticipant(activeConv)?.lastName}</div>
                        <div style={{ fontSize: 11, color: '#10b981', fontWeight: 800 }}>En ligne</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                       <button className="k-btn" style={{ padding: 8, borderRadius: 50, background: 'var(--ks-bg)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></button>
                       <button className="k-btn" style={{ padding: 8, borderRadius: 50, background: 'var(--ks-bg)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 10l5 5-5 5M4 4v7a4 4 0 0 0 4 4h12"/></svg></button>
                    </div>
                  </div>

                  {/* Messages List */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="custom-scrollbar">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {messages.map((m, idx) => {
                        const isMe = m.senderId === user.id;
                        return (
                          <div 
                            key={m.id} 
                            style={{ 
                              display: 'flex', 
                              justifyContent: isMe ? 'flex-end' : 'flex-start',
                              marginBottom: idx < messages.length - 1 && messages[idx+1].senderId === m.senderId ? -12 : 0
                            }}
                          >
                            <div style={{ 
                              maxWidth: '65%', 
                              padding: '12px 18px', 
                              borderRadius: isMe ? '22px 22px 4px 22px' : '22px 22px 22px 4px',
                              background: isMe ? 'var(--ks-primary)' : 'white',
                              color: isMe ? 'white' : 'var(--ks-text-main)',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                              fontSize: 14,
                              lineHeight: 1.5,
                              position: 'relative'
                            }}>
                              {m.content}
                              <div style={{ 
                                fontSize: 9, 
                                opacity: 0.7, 
                                marginTop: 4, 
                                textAlign: isMe ? 'right' : 'left' 
                              }}>
                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div style={{ padding: '24px 32px 32px', background: 'white' }}>
                    <form 
                      onSubmit={handleSendMessage}
                      style={{ 
                        display: 'flex', gap: 12, background: 'var(--ks-bg)', 
                        padding: '6px', borderRadius: 16, border: '1px solid var(--ks-border)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      <button type="button" style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--ks-text-muted)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      </button>
                      <input 
                        type="text" 
                        placeholder="Écrivez votre message..." 
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 10px', fontSize: 14, outline: 'none' }} 
                      />
                      <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="k-btn k-btn-primary" 
                        style={{ width: 44, height: 44, borderRadius: 12, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ks-text-muted)', textAlign: 'center', padding: 40 }}>
                  <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ks-primary)" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: 'var(--ks-text-main)', marginBottom: 8 }}>Vos discussions</h3>
                  <p style={{ maxWidth: 300, lineHeight: 1.6, fontSize: 14 }}>Sélectionnez une conversation ou commencez-en une nouvelle pour échanger avec la communauté.</p>
                  <button onClick={() => setShowSearch(true)} className="k-btn k-btn-primary" style={{ marginTop: 24, padding: '12px 24px', borderRadius: 12 }}>Nouvelle conversation</button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      {showSearch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="k-widget" style={{ width: '100%', maxWidth: 440, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Nouvelle discussion</h2>
              <button 
                onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ks-text-muted)' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ks-primary)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </div>
              <input 
                autoFocus
                type="text" 
                placeholder="Nom ou email de l'athlète..." 
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: 14, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14, outline: 'none' }} 
              />
            </div>

            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {searchResults.length > 0 ? (
                searchResults.map(res => (
                  <div 
                    key={res.id} 
                    onClick={() => startConversation(res)}
                    style={{ padding: '12px', cursor: 'pointer', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center' }}
                    className="hover-bg"
                  >
                    <div className="k-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>{res.firstName[0]}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{res.firstName} {res.lastName}</div>
                      <div style={{ fontSize: 11, color: 'var(--ks-text-muted)' }}>{res.email}</div>
                    </div>
                  </div>
                ))
              ) : searchQuery.length >= 2 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ks-text-muted)', fontSize: 13 }}>Aucun athlète trouvé.</div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
