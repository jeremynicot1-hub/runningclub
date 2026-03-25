'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function DashboardHub() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [clubs, setClubs] = useState<any[]>([]);
  const [userClubs, setUserClubs] = useState<any[]>([]);
  const [cityFilter, setCityFilter] = useState('');
  const [pendingRequests, setPendingRequests] = useState<Record<string, boolean>>({});
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const [feed, setFeed] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({ date: new Date().toISOString().split('T')[0], type: 'Course à pied', description: '' });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      // Get all clubs for discovery
      apiFetch<any[]>('/api/clubs').then(data => {
        setClubs(data);
        const p: Record<string, boolean> = {};
        data.forEach(c => { if (c.joinRequests?.length > 0) p[c.id] = true; });
        setPendingRequests(p);
      }).catch(() => []);
      
      apiFetch<any[]>('/api/messages/feed').then(setFeed).catch(console.error);
      apiFetch<any[]>('/api/sessions').then(setSessions).catch(console.error);
      apiFetch<any[]>('/api/events').then(setEvents).catch(console.error);
      
      // Get user's own clubs
      apiFetch<any>(`/api/users/me`).then(u => setUserClubs(u.clubs || [])).catch(console.error);
    }
  }, [user, loading, router]);

  const joinedIds = userClubs.map(c => c.id);
  const pendingClubsList = clubs.filter(c => pendingRequests[c.id] && !joinedIds.includes(c.id));
  const availableClubsList = clubs.filter(c => {
    const matchesCity = !cityFilter.trim() || c.city?.toLowerCase().includes(cityFilter.toLowerCase());
    return matchesCity && !pendingRequests[c.id] && !joinedIds.includes(c.id);
  });

  const requestJoin = async (clubId: string) => {
    setJoiningId(clubId);
    try {
      const res = await apiFetch<any>(`/api/clubs/${clubId}/join`, { method: 'POST' });
      if (res.request?.status === 'PENDING') {
        setPendingRequests(prev => ({ ...prev, [clubId]: true }));
      } else {
        window.location.reload();
      }
    } catch {
      alert('Erreur lors de l\'envoi de la demande.');
    } finally {
      setJoiningId(null);
    }
  };

  const createPersonalSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await apiFetch('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ ...sessionForm, userId: user.id })
      });
      setShowSessionModal(false);
      apiFetch<any[]>('/api/sessions').then(setSessions);
    } catch {
      alert('Erreur lors de la création de la séance.');
    }
  };

  if (loading || !user) return null;

  return (
    <div className="kinetic-app">
      <aside className="kinetic-sidebar" style={{ background: '#0f172a', borderRight: 'none' }}>
        <div className="kinetic-logo" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
          <div className="kinetic-logo-main" style={{ fontSize: 22, color: 'white' }}>KINETIC</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ks-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personnel</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          <div className="kinetic-nav-item active" style={{ color: 'white', background: 'rgba(255,255,255,0.05)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
            Mon Accueil
          </div>
          <div className="kinetic-nav-item" onClick={() => router.push('/dashboard/my-club')} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Mon Club
          </div>
          <div className="kinetic-nav-item" onClick={() => router.push('/dashboard/map')} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0-10 10c0 5.5 4.5 10 10 10s10-4.5 10-10a10 10 0 0 0-10-10zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/><circle cx="12" cy="12" r="3"/></svg>
            Carte des Clubs
          </div>
        </nav>
        <div style={{ padding: '24px' }}>
          <button onClick={() => { logout(); router.push('/login'); }} className="k-btn" style={{ width: '100%', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="kinetic-main">
        <header style={{ height: 64, display: 'flex', alignItems: 'center', padding: '0 32px', background: 'white', borderBottom: '1px solid var(--ks-border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Espace Personnel · Bonjour, {user.firstName} 👋</h2>
        </header>
        <div className="kinetic-content">
          <main className="kinetic-grid" style={{ gridTemplateColumns: '1fr 340px' }}>

            {/* Colonne Feed Personnel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {feed.length > 0 ? (
                feed.map(msg => (
                  <div key={msg.id} className="k-post">
                    <div className="k-post-header" style={{ alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div className="k-avatar k-avatar-md" style={{ background: msg.sender.role === 'COACH' ? msg.club?.primaryColor || 'var(--ks-primary)' : '#1e293b', color: 'white' }}>
                          {msg.sender.firstName[0]}{msg.sender.lastName[0]}
                        </div>
                        <div>
                          <div className="k-post-author">{msg.sender.firstName} {msg.sender.lastName}</div>
                          <div className="k-post-meta">{new Date(msg.createdAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</div>
                        </div>
                      </div>
                      <Link href={`/clubs/${msg.club.id}/feed`} style={{ textDecoration: 'none' }}>
                        <span className="k-pill hover-lift" style={{ cursor: 'pointer', background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: 'var(--ks-text-main)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: msg.club?.primaryColor || 'var(--ks-primary)' }}></span>
                          {msg.club.name}
                        </span>
                      </Link>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                  </div>
                ))
              ) : (
                <div className="k-widget" style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>🌍</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Fil d&apos;actualité global</h3>
                  <p style={{ color: 'var(--ks-text-muted)', fontSize: 13 }}>Le flux de vos clubs apparaîtra ici dès qu&apos;une activité sera publiée.</p>
                </div>
              )}

            </div>

            {/* Colonne de droite */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Mon Agenda Personnel (Global) */}
              <div className="k-widget">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 className="k-widget-title" style={{ margin: 0 }}>AGENDA PERSONNEL</h3>
                  <button onClick={() => setShowSessionModal(true)} style={{ fontSize: 11, fontWeight: 800, color: 'var(--ks-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>+ Ajouter</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sessions.length > 0 ? sessions.slice(0, 3).map(s => (
                    <div key={s.id} style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--ks-bg)', borderRadius: 12, border: '1px solid var(--ks-border)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--ks-primary)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 800 }}>{new Date(s.date).toLocaleString('fr-FR', { month: 'short' }).toUpperCase()}</div>
                        <div style={{ fontSize: 16, fontWeight: 900, marginTop: -2 }}>{new Date(s.date).getDate()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{s.type}</div>
                        <div style={{ fontSize: 11, color: 'var(--ks-text-muted)', marginTop: 2 }}>
                          {s.team?.name ? `👥 ${s.team.name}` : '🏃 Séance Perso'}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ fontSize: 12, color: 'var(--ks-text-muted)', textAlign: 'center', padding: '12px 0' }}>Aucune séance prévue.</div>
                  )}
                  <Link href="/dashboard" style={{ fontSize: 11, fontWeight: 800, color: 'var(--ks-primary)', textDecoration: 'none', textAlign: 'center', display: 'block', marginTop: 8 }}>Voir tout l&apos;agenda →</Link>
                </div>
              </div>

              {/* Prochains Événements (Global) */}
              <div className="k-widget">
                <h3 className="k-widget-title">ÉVÉNEMENTS CLUBS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {events.length > 0 ? events.slice(0, 3).map(e => (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--ks-bg)', borderRadius: 12, border: '1px solid var(--ks-border)' }}>
                       <div style={{ width: 4, height: 24, borderRadius: 2, background: 'var(--ks-primary)' }}></div>
                       <div style={{ flex: 1 }}>
                         <div style={{ fontSize: 13, fontWeight: 800 }}>{e.name}</div>
                         <div style={{ fontSize: 11, color: 'var(--ks-text-muted)', marginTop: 2 }}>📅 {new Date(e.date).toLocaleDateString()} · {e.location}</div>
                       </div>
                    </div>
                  )) : (
                    <div style={{ fontSize: 12, color: 'var(--ks-text-muted)', textAlign: 'center', padding: '12px 0' }}>Aucun événement à venir.</div>
                  )}
                </div>
              </div>

              {/* Mes Clubs Quick Access */}
              <div className="k-widget">
                <h3 className="k-widget-title">MES CLUBS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {userClubs.map(club => (
                    <Link key={club.id} href={`/clubs/${club.id}/feed`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: club.primaryColor || 'var(--ks-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, overflow: 'hidden' }}>
                        {club.logo ? <img src={`http://localhost:5000${club.logo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : club.name[0]}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{club.name}</div>
                    </Link>
                  ))}
                  <button onClick={() => router.push('/dashboard/my-club')} className="k-btn" style={{ width: '100%', padding: '8px', fontSize: 11, marginTop: 8 }}>Gérer mes clubs</button>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      {/* Modal Création Séance Perso */}
      {showSessionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <form className="k-widget" onSubmit={createPersonalSession} style={{ width: '100%', maxWidth: 400, gap: 20, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: -8 }}>Nouvelle séance perso</h3>
            <div className="k-field">
              <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Date</label>
              <input type="date" className="k-input" value={sessionForm.date} onChange={e => setSessionForm({...sessionForm, date: e.target.value})} required />
            </div>
            <div className="k-field">
              <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Type d&apos;activité</label>
              <input type="text" className="k-input" value={sessionForm.type} onChange={e => setSessionForm({...sessionForm, type: e.target.value})} placeholder="Ex: Musculation, Natation..." required />
            </div>
            <div className="k-field">
              <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Description / Notes</label>
              <textarea className="k-input" value={sessionForm.description} onChange={e => setSessionForm({...sessionForm, description: e.target.value})} rows={3} placeholder="Détails de votre entraînement..." />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="button" className="k-btn" onClick={() => setShowSessionModal(false)} style={{ flex: 1 }}>Annuler</button>
              <button type="submit" className="k-btn k-btn-primary" style={{ flex: 1 }}>Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


