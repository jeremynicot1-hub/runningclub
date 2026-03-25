'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function MyClubPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [userClubs, setUserClubs] = useState<any[]>([]);
  const [pendingClubs, setPendingClubs] = useState<any[]>([]);
  const [selectedClubId, setSelectedClubId] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      Promise.all([
        apiFetch<any>('/api/users/me'),
        apiFetch<any[]>('/api/clubs')
      ]).then(([me, all]) => {
        const joined = me.clubs || [];
        setUserClubs(joined);
        if (joined.length > 0 && !selectedClubId) setSelectedClubId(joined[0].id);
        
        const joinedIds = joined.map((c: any) => c.id);
        const pending = all.filter(c => 
          c.joinRequests?.some((r: any) => r.userId === user.id && r.status === 'PENDING') && 
          !joinedIds.includes(c.id)
        );
        setPendingClubs(pending);
      }).catch(console.error);
    }
  }, [user, loading, router]);

  const selectedClub = userClubs.find(c => c.id === selectedClubId);

  if (loading || !user) return null;

  return (
    <div className="kinetic-app">
      <aside className="kinetic-sidebar" style={{ background: '#0f172a', borderRight: 'none' }}>
        <div className="kinetic-logo" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
          <div className="kinetic-logo-main" style={{ fontSize: 22, color: 'white' }}>KINETIC</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ks-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Management</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          <div className="kinetic-nav-item" onClick={() => router.push('/dashboard')} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
            Mon Accueil
          </div>
          <div className="kinetic-nav-item active" style={{ color: 'white', background: 'rgba(255,255,255,0.05)' }}>
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
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Gestion de mes clubs</h2>
        </header>
        <div className="kinetic-content">
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            
            <div className="k-widget" style={{ marginBottom: 32, padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Espaces de vos clubs</h3>
                  <p style={{ color: 'var(--ks-text-muted)', fontSize: 14 }}>Sélectionnez un club pour accéder à ses actualités, entraînements et événements.</p>
                </div>
                <button className="k-btn k-btn-primary" onClick={() => router.push('/dashboard/map')}>
                  Rejoindre un nouveau club
                </button>
              </div>

              {userClubs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="k-field">
                    <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Choisir un club</label>
                    <select 
                      className="k-input" 
                      value={selectedClubId} 
                      onChange={(e) => setSelectedClubId(e.target.value)}
                      style={{ padding: '12px 16px', fontSize: 16, fontWeight: 700 }}
                    >
                      {userClubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {selectedClub && (
                    <div className="k-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 24, background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}>
                      <div style={{ width: 80, height: 80, borderRadius: 16, background: selectedClub.primaryColor || 'var(--ks-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 32, overflow: 'hidden', flexShrink: 0 }}>
                        {selectedClub.logo ? <img src={`http://localhost:5000${selectedClub.logo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedClub.name[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{selectedClub.name}</div>
                        <div style={{ fontSize: 14, color: 'var(--ks-text-muted)' }}>📍 {selectedClub.city}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                           <Link href={`/clubs/${selectedClub.id}/feed`} className="k-btn k-btn-primary" style={{ padding: '8px 20px' }}>Entrer dans le club</Link>
                           <Link href={`/clubs/${selectedClub.id}/settings`} className="k-btn" style={{ padding: '8px 20px', background: 'white', border: '1px solid var(--ks-border)' }}>Paramètres</Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', background: 'var(--ks-bg)', borderRadius: 16, border: '1px dashed var(--ks-border)' }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>🏃‍♂️</div>
                  <h4 style={{ fontWeight: 800, marginBottom: 8 }}>Vous n&apos;êtes membre d&apos;aucun club</h4>
                  <p style={{ color: 'var(--ks-text-muted)', fontSize: 14, marginBottom: 20 }}>Recherchez un club à proximité pour commencer votre aventure.</p>
                  <button className="k-btn k-btn-primary" onClick={() => router.push('/dashboard/map')}>Ouvrir la carte</button>
                </div>
              )}
            </div>

            {pendingClubs.length > 0 && (
              <div className="k-widget">
                <h3 className="k-widget-title" style={{ marginBottom: 16 }}>DEMANDES EN ATTENTE</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pendingClubs.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'rgba(254, 243, 199, 0.4)', borderRadius: 16, border: '1px dashed #f59e0b' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20, flexShrink: 0 }}>{c.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#92400e' }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>Demande envoyée</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>En attente</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
