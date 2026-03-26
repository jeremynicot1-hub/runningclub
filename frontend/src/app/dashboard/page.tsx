'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import DashboardSidebar from '@/components/DashboardSidebar';
import Topbar from '@/components/Topbar';

export default function DashboardHub() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [feed, setFeed] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [postContent, setPostContent] = useState('');
  
  // Modal states
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [newSession, setNewSession] = useState({ date: new Date().toISOString().split('T')[0], type: 'Course', description: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [viewingSession, setViewingSession] = useState<any>(null);
  const [viewingDaySessions, setViewingDaySessions] = useState<any[]>([]);

  // Agenda State
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getUTCMonth());
  const [currentYear, setCurrentYear] = useState(now.getUTCFullYear());

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 0) {
        setCurrentYear(y => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev === 11) {
        setCurrentYear(y => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      apiFetch<any[]>('/api/messages/feed').then(setFeed).catch(console.error);
      apiFetch<any[]>('/api/sessions').then(setSessions).catch(console.error);
      apiFetch<any[]>('/api/events').then(setEvents).catch(console.error);
      apiFetch<any[]>('/api/invites/received').then(setInvites).catch(console.error);
    }
  }, [user, loading, router]);

  const handlePost = async () => {
    if (!postContent.trim() || !user) return;
    const targetClubId = (user as any).clubs?.[0]?.id;
    if (!targetClubId) return;
    try {
      await apiFetch(`/api/messages/club/${targetClubId}`, {
        method: 'POST',
        body: JSON.stringify({ content: postContent.trim(), type: 'POST' })
      });
      setPostContent('');
      apiFetch<any[]>('/api/messages/feed').then(setFeed);
    } catch (err) { console.error(err); }
  };

  const handleCreatePersonalSession = async () => {
    try {
      await apiFetch('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ ...newSession, userId: user.id })
      });
      setShowSessionModal(false);
      apiFetch<any[]>('/api/sessions').then(setSessions);
    } catch (err) { console.error(err); }
  };

  const handleDayClick = (daySessions: any[]) => {
    if (daySessions.length === 1) {
      setViewingSession(daySessions[0]);
    } else if (daySessions.length > 1) {
      setViewingDaySessions(daySessions);
    }
  };

  const getSessionColor = (session: any) => {
    if (session.clubId) return '#c02631'; // Velocity Red
    if (session.userId === user.id && !session.invites?.length) return '#1a1a1b'; // Dark Solo
    return '#64748b'; // Gray Shared
  };

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday start
  };
  
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  if (loading || !user) return null;

  return (
    <div className="kinetic-app">
      <DashboardSidebar />

      <div className="kinetic-main">
        <Topbar />
        
        <div className="kinetic-content" style={{ padding: '64px 80px 80px 80px', paddingRight: '340px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 64, maxWidth: 1500, width: '100%', margin: '0 auto' }}>
            
            {/* Left Column: Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ marginBottom: 16 }}>
                <h1 style={{ fontSize: 40, fontWeight: 950, color: '#1a1a1b', marginBottom: 12, letterSpacing: '-0.04em' }}>Bonjour, {user?.firstName}</h1>
                <p style={{ color: '#64748b', fontSize: 18, fontStyle: 'italic' }}>Capturez l&apos;élan athlétique d&apos;aujourd&apos;hui.</p>
              </div>

              {/* Post Creator */}
              <div className="k-widget" style={{ padding: 32, borderRadius: 24 }}>
                <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', flexShrink: 0 }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <textarea 
                    placeholder="Quoi de neuf dans votre entraînement ?" 
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    style={{ flex: 1, border: 'none', background: '#f8fafc', borderRadius: 16, padding: 20, fontSize: 16, resize: 'none', height: 110, outline: 'none', fontWeight: 500 }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 14, fontWeight: 800 }}>Photo</button>
                    <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 14, fontWeight: 800 }}>Stats</button>
                  </div>
                  <button onClick={handlePost} className="k-btn k-btn-primary" style={{ padding: '12px 32px', borderRadius: 14, background: '#c02631' }}>Publier</button>
                </div>
              </div>

              {/* Feed Items */}
              {feed.map(msg => (
                <div key={msg.id} className="k-widget" style={{ padding: 0, overflow: 'hidden', borderRadius: 24 }}>
                  <div style={{ padding: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: msg.club?.primaryColor || '#c02631', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>{msg.sender?.firstName ? msg.sender.firstName[0] : '?'}</div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#1a1a1b' }}>{msg.sender?.firstName} {msg.sender?.lastName}</div>
                        <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>{msg.club?.name} • Il y a 2h</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '0 32px 32px' }}>
                    <p style={{ fontSize: 17, lineHeight: 1.6, color: '#1f2937' }}>{msg.content}</p>
                    {msg.imageUrl && (
                      <div style={{ width: '100%', height: 350, background: '#f8fafc', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', border: '1px solid #eee', marginTop: 24 }}>
                        <img src={msg.imageUrl} alt="Post Content" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              {/* Agenda Overhaul V2: Clickable numbers, Multi-indicator */}
              <div className="k-widget" style={{ padding: 28, borderRadius: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 900, color: '#c02631', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>AGENDA</div>
                    <div style={{ fontSize: 20, fontWeight: 950, color: '#1a1a1b' }}>{monthNames[currentMonth]} {currentYear}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1b' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg></button>
                    <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1b' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg></button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, textAlign: 'center' }}>
                  {['L','M','M','J','V','S','D'].map((d, i) => <div key={i} style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', paddingBottom: 12 }}>{d}</div>)}
                  
                  {Array.from({ length: firstDayOfMonth(currentMonth, currentYear) }).map((_, i) => <div key={`empty-${i}`} />)}
                  
                  {Array.from({ length: daysInMonth(currentMonth, currentYear) }).map((_, i) => {
                    const day = i + 1;
                    const daySessions = sessions.filter(s => {
                      const d = new Date(s.date);
                      return d.getUTCDate() === day && d.getUTCMonth() === currentMonth && d.getUTCFullYear() === currentYear;
                    });
                    const isToday = day === now.getDate() && currentMonth === now.getMonth();
                    
                    // Logic for multi-session indicator
                    const hasClub = daySessions.some(s => s.clubId);
                    const hasSolo = daySessions.some(s => s.userId && !s.clubId);
                    
                    let bgStyle = 'transparent';
                    let borderStyle = '1px solid transparent';
                    let color = '#1a1a1b';

                    if (isToday) {
                      bgStyle = '#c02631';
                      color = 'white';
                    } else if (daySessions.length > 0) {
                      if (hasClub && hasSolo) {
                        // Split background for dual sessions
                        bgStyle = 'linear-gradient(135deg, #c02631 50%, #1a1a1b 50%)';
                        color = 'white';
                      } else {
                        bgStyle = hasClub ? '#c02631' : '#1a1a1b';
                        color = 'white';
                      }
                      borderStyle = 'none';
                    }

                    return (
                      <div 
                        key={day} 
                        onClick={() => handleDayClick(daySessions)}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        style={{ 
                          position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', height: 36, justifyContent: 'center',
                          cursor: daySessions.length > 0 ? 'pointer' : 'default',
                          fontSize: 14, fontWeight: 900, width: 36, borderRadius: 10,
                          background: bgStyle,
                          border: borderStyle,
                          color: color,
                          transition: 'all 0.2s',
                          transform: hoveredDay === day && daySessions.length > 0 ? 'scale(1.15)' : 'scale(1)',
                          boxShadow: daySessions.length > 0 ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                          opacity: (daySessions.length === 0 && !isToday) ? 0.3 : 1
                        }}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 16, fontSize: 10, fontWeight: 900 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c02631' }} /> Club</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a1a1b' }} /> Solo</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: 12, background: 'linear-gradient(135deg, #c02631 50%, #1a1a1b 50%)' }} /> Duo</div>
                </div>
              </div>

              {/* Performance Pulse */}
              <div className="k-widget" style={{ padding: 32, background: '#1a1a1b', color: 'white', border: 'none', borderRadius: 28 }}>
                <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: 20 }}>Performance Pulse</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
                  <span>Hebdomadaire</span>
                  <span style={{ color: '#c02631' }}>85%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '85%', background: '#c02631' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal: Multi-Séances Selection */}
        {viewingDaySessions.length > 0 && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 20 }}>
            <div className="k-widget" style={{ width: '100%', maxWidth: 440, padding: 32, borderRadius: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ fontSize: 24, fontWeight: 950 }}>Séances du jour</h2>
                <button onClick={() => setViewingDaySessions([])} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {viewingDaySessions.map(s => (
                  <div 
                    key={s.id} 
                    onClick={() => { setViewingSession(s); setViewingDaySessions([]); }}
                    style={{ 
                      padding: 20, borderRadius: 16, background: '#f8fafc', border: '1px solid #eee', cursor: 'pointer',
                      display: 'flex', gap: 16, alignItems: 'center', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = getSessionColor(s)}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#eee'}
                  >
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: getSessionColor(s) }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 900 }}>{s.type}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.duration} min • {s.targetDistance} km</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Détails Séance */}
        {viewingSession && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: 20 }}>
            <div className="k-widget" style={{ width: '100%', maxWidth: 500, padding: 40, borderRadius: 32, position: 'relative' }}>
              <button 
                onClick={() => setViewingSession(null)}
                style={{ position: 'absolute', top: 24, right: 24, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 32 }}>
                <div style={{ 
                  width: 60, height: 60, borderRadius: 16, background: getSessionColor(viewingSession), color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  boxShadow: `0 8px 20px -5px ${getSessionColor(viewingSession)}`
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div>
                  <h2 style={{ fontSize: 28, fontWeight: 950, color: '#1a1a1b' }}>{viewingSession.type}</h2>
                  <div style={{ fontSize: 14, color: '#c02631', fontWeight: 900, textTransform: 'uppercase' }}>
                    {new Date(viewingSession.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: 24, borderRadius: 20, border: '1px solid #eee', marginBottom: 24 }}>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: '#1a1a1b' }}>{viewingSession.description || "Aucune description fournie."}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="k-widget" style={{ padding: 20, background: '#fff', border: '1px solid #eee' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', marginBottom: 6 }}>DURÉE</div>
                  <div style={{ fontSize: 22, fontWeight: 950 }}>{viewingSession.duration || '60'} min</div>
                </div>
                <div className="k-widget" style={{ padding: 20, background: '#fff', border: '1px solid #eee' }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: '#94a3b8', marginBottom: 6 }}>OBJECTIF</div>
                  <div style={{ fontSize: 22, fontWeight: 950 }}>{viewingSession.targetDistance || '12'} km</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
