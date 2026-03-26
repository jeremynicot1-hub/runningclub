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
    
    // Default to first club for global feed post
    const targetClubId = (user as any).clubs?.[0]?.id;
    if (!targetClubId) {
      alert("You must be a member of a club to post.");
      return;
    }

    try {
      await apiFetch(`/api/messages/club/${targetClubId}`, {
        method: 'POST',
        body: JSON.stringify({
          content: postContent.trim(),
          type: 'POST'
        })
      });
      setPostContent('');
      const newFeed = await apiFetch<any[]>('/api/messages/feed');
      setFeed(newFeed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePersonalSession = async () => {
    try {
      await apiFetch('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({
          ...newSession,
          userId: user.id
        })
      });
      setShowSessionModal(false);
      apiFetch<any[]>('/api/sessions').then(setSessions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvite = async () => {
    if (!selectedSessionId || !inviteEmail) return;
    try {
      await apiFetch('/api/invites', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: selectedSessionId,
          receiverEmail: inviteEmail
        })
      });
      setShowInviteModal(false);
      setInviteEmail('');
      alert("Invitation envoyée !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi de l'invitation.");
    }
  };

  const handleInviteResponse = async (inviteId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiFetch(`/api/invites/${inviteId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      apiFetch<any[]>('/api/invites/received').then(setInvites);
      apiFetch<any[]>('/api/sessions').then(setSessions);
    } catch (err) {
      console.error(err);
    }
  };

  const getSessionColor = (session: any) => {
    if (session.clubId) return 'var(--ks-primary)'; // Club = Orange
    if (session.userId === user.id && !session.invites?.length) return '#3b82f6'; // Perso = Bleu
    return '#10b981'; // Shared = Vert
  };

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  if (loading || !user) return null;

  return (
    <div className="kinetic-app">
      <DashboardSidebar />

      <div className="kinetic-main">
        <Topbar />
        
        <div className="kinetic-content" style={{ padding: '32px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, maxWidth: 1200, margin: '0 auto' }}>
            
            {/* Left Column: Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ marginBottom: 8 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ks-text-main)', marginBottom: 8 }}>Bonjour, {user?.firstName}</h1>
                <p style={{ color: 'var(--ks-text-muted)', fontSize: 15 }}>Voici ce qui se passe dans vos cercles athlétiques aujourd&apos;hui.</p>
              </div>

              {/* Post Creator */}
              <div className="k-widget" style={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                  <div className="k-avatar k-avatar-md" style={{ background: 'var(--ks-primary)', color: 'white', fontWeight: 800 }}>
                    {user.firstName[0]}
                  </div>
                  <textarea 
                    placeholder="Partagez votre dernier entraînement ou une actualité club..." 
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    style={{ flex: 1, border: 'none', background: 'var(--ks-bg)', borderRadius: 12, padding: 12, fontSize: 14, resize: 'none', height: 100, outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--ks-text-muted)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      Photo
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--ks-text-muted)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      Parcours
                    </button>
                    <button style={{ background: 'none', border: 'none', color: 'var(--ks-text-muted)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                      Stats
                    </button>
                  </div>
                  <button onClick={handlePost} className="k-btn k-btn-primary" style={{ padding: '8px 24px', borderRadius: 20 }}>Publier</button>
                </div>
              </div>

              {/* Feed Items */}
              {feed.map(msg => (
                <div key={msg.id} className="k-widget" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                    <div className="k-avatar" style={{ width: 40, height: 40, background: msg.club?.primaryColor || 'var(--ks-primary)', color: 'white' }}>
                      {msg.sender?.firstName ? msg.sender.firstName[0] : '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{msg.sender?.firstName} {msg.sender?.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--ks-text-muted)' }}>{msg.club?.name} • il y a 2h</div>
                    </div>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: 'var(--ks-text-light)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                    </button>
                  </div>
                  <div style={{ padding: '0 20px 20px' }}>
                    <p style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 16 }}>{msg.content}</p>
                    <div style={{ width: '100%', height: 300, background: 'var(--ks-bg)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ks-text-light)', border: '1px solid var(--ks-border)' }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    </div>
                  </div>
                  <div style={{ padding: '12px 20px', borderTop: '1px solid var(--ks-border-light)', display: 'flex', gap: 24 }}>
                    <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ks-text-muted)', fontSize: 13, fontWeight: 700 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> 24
                    </button>
                    <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ks-text-muted)', fontSize: 13, fontWeight: 700 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> 8
                    </button>
                    <button style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ks-text-muted)', fontSize: 13, fontWeight: 700 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Widgets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Dynamic Calendar */}
              <div className="k-widget" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{monthNames[currentMonth]} {currentYear}</div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => setShowSessionModal(true)} className="k-btn" style={{ padding: '4px 8px', fontSize: 10, background: 'var(--ks-bg-alt)' }}>+ Séance</button>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ cursor: 'pointer' }}><path d="m15 18-6-6 6-6"/></svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ cursor: 'pointer' }}><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, textAlign: 'center' }}>
                  {['L','M','M','J','V','S','D'].map((d, i) => <div key={i} style={{ fontSize: 10, fontWeight: 800, color: 'var(--ks-text-light)' }}>{d}</div>)}
                  
                  {Array.from({ length: firstDayOfMonth(currentMonth, currentYear) - 1 }).map((_, i) => <div key={`empty-${i}`} />)}
                  
                  {Array.from({ length: daysInMonth(currentMonth, currentYear) }).map((_, i) => {
                    const day = i + 1;
                    const daySessions = sessions.filter(s => new Date(s.date).getDate() === day && new Date(s.date).getMonth() === currentMonth);
                    const isToday = day === now.getDate();

                    return (
                      <div key={day} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ 
                          fontSize: 12, fontWeight: 700, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8,
                          background: isToday ? 'var(--ks-bg-alt)' : 'transparent',
                          color: isToday ? 'inherit' : 'inherit',
                          marginBottom: 4
                        }}>
                          {day}
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {daySessions.map(s => (
                            <div 
                              key={s.id} 
                              onClick={() => { setSelectedSessionId(s.id); setShowInviteModal(true); }}
                              style={{ width: 6, height: 6, borderRadius: '50%', background: getSessionColor(s), cursor: 'pointer' }} 
                              title={`${s.type}: ${s.description || ''}`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div style={{ marginTop: 16, display: 'flex', gap: 12, fontSize: 10, fontWeight: 700 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ks-primary)' }} /> Club</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} /> Perso</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Partagé</div>
                </div>
              </div>

              {/* Pending Invitations */}
              {invites.length > 0 && (
                <div className="k-widget" style={{ padding: 20, border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 900, marginBottom: 16, color: '#059669' }}>Invitations à courir</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {invites.map(inv => (
                      <div key={inv.id} style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 800 }}>{inv.sender.firstName} vous invite</div>
                        <div style={{ fontSize: 11, color: 'var(--ks-text-muted)', marginBottom: 8 }}>
                          Séance : {inv.session.type} ({new Date(inv.session.date).toLocaleDateString('fr-FR')})
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleInviteResponse(inv.id, 'APPROVED')} className="k-btn k-btn-primary" style={{ padding: '4px 12px', fontSize: 11, borderRadius: 6, background: '#10b981' }}>Accepter</button>
                          <button onClick={() => handleInviteResponse(inv.id, 'REJECTED')} className="k-btn" style={{ padding: '4px 12px', fontSize: 11, borderRadius: 6 }}>Refuser</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Events */}
              <div className="k-widget" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 900, margin: 0 }}>Événements à venir</h3>
                  <Link href="/dashboard/events" style={{ fontSize: 11, fontWeight: 800, color: 'var(--ks-primary)', textDecoration: 'none' }}>VOIR TOUT</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { date: '28 MAR', title: 'Fractionné Piste', time: '06:30', loc: 'Stade Municipal' },
                    { date: '30 MAR', title: 'Sortie Longue (Zone 2)', time: '07:00', loc: 'Bords de Seine' },
                    { date: '01 AVR', title: 'Renforcement Musculaire', time: '17:30', loc: 'Salle de Fitness' },
                  ].map((ev, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16 }}>
                      <div style={{ width: 44, height: 44, background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 8, fontWeight: 800, color: 'var(--ks-text-light)' }}>{ev.date.split(' ')[1]}</div>
                        <div style={{ fontSize: 14, fontWeight: 900 }}>{ev.date.split(' ')[0]}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{ev.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--ks-text-light)', marginTop: 2 }}>{ev.time} • {ev.loc}</div>
                      </div>
                    </div>
                  ))}
                  <button className="k-btn" style={{ width: '100%', marginTop: 8, padding: '10px', fontSize: 12, borderRadius: 10 }}>Gérer mon agenda</button>
                </div>
              </div>

              {/* Performance Pulse Dark Widget */}
              <div className="k-widget" style={{ padding: 20, background: 'var(--ks-black-card)', color: 'white', border: 'none' }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16, opacity: 0.9 }}>Performance Pulse</h3>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                    <span>Objectif Hebdo</span>
                    <span style={{ color: 'var(--ks-primary)' }}>85%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '85%', background: 'var(--ks-primary)' }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.6, marginBottom: 4 }}>Temps de Training Total</div>
                  <div style={{ fontSize: 24, fontWeight: 900, fontStyle: 'italic' }}>12h 45m</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal: Nouvelle Séance */}
        {showSessionModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div className="k-widget" style={{ width: '100%', maxWidth: 400, padding: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 20 }}>Nouvelle Séance Perso</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--ks-text-muted)', marginBottom: 4 }}>Date</label>
                  <input type="date" value={newSession.date} onChange={(e) => setNewSession({...newSession, date: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 8, background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--ks-text-muted)', marginBottom: 4 }}>Type</label>
                  <input type="text" placeholder="Ex: Course, Musculation..." value={newSession.type} onChange={(e) => setNewSession({...newSession, type: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 8, background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--ks-text-muted)', marginBottom: 4 }}>Description</label>
                  <textarea placeholder="Détails de la séance..." value={newSession.description} onChange={(e) => setNewSession({...newSession, description: e.target.value})} style={{ width: '100%', padding: 10, borderRadius: 8, background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: 'inherit', height: 80, resize: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button onClick={handleCreatePersonalSession} className="k-btn k-btn-primary" style={{ flex: 1 }}>Enregistrer</button>
                  <button onClick={() => setShowSessionModal(false)} className="k-btn" style={{ flex: 1 }}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Inviter à courir */}
        {showInviteModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
            <div className="k-widget" style={{ width: '100%', maxWidth: 400, padding: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Inviter un membre</h2>
              <p style={{ fontSize: 13, color: 'var(--ks-text-muted)', marginBottom: 20 }}>Partagez cette séance avec un autre athlète pour courir ensemble.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'var(--ks-text-muted)', marginBottom: 4 }}>Email de l&apos;athlète</label>
                  <input type="email" placeholder="email@exemple.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button onClick={handleInvite} className="k-btn k-btn-primary" style={{ flex: 1 }}>Envoyer l&apos;invitation</button>
                  <button onClick={() => setShowInviteModal(false)} className="k-btn" style={{ flex: 1 }}>Annuler</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


