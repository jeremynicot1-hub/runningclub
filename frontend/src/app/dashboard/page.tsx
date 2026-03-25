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
  const [activeClub, setActiveClub] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      // Fetch all clubs to join
      apiFetch<any[]>('/api/clubs').then(setClubs).catch(() => []);
      
      // If user is in a club, fetch its details to show in "Mes Clubs"
      if (user.clubId) {
        apiFetch<any>(`/api/clubs/${user.clubId}`).then(setActiveClub).catch(console.error);
      }
    }
  }, [user, loading, router]);

  const joinClub = async (clubId: string) => {
    try {
      await apiFetch(`/api/clubs/${clubId}/join`, { method: 'POST' });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="kinetic-app">
      {/* Sidebar for Personal Dashboard */}
      <aside className="kinetic-sidebar" style={{ background: '#0f172a', borderRight: 'none' }}>
        <div className="kinetic-logo" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
          <div className="kinetic-logo-main" style={{ fontSize: 22, color: 'white' }}>KINETIC</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ks-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personnel</div>
        </div>
        
        <nav style={{ flex: 1, padding: '12px 0' }}>
          <div className="kinetic-nav-item active" style={{ color: 'white', background: 'rgba(255,255,255,0.05)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            Mon Accueil
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
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Espace Personnel</h2>
        </header>
        
        <div className="kinetic-content">
          <main className="kinetic-grid" style={{ gridTemplateColumns: '1fr 320px' }}>
            
            {/* Colonne Feed Personnel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Bonjour, {user.firstName} 👋</h1>
                <p style={{ color: 'var(--ks-text-muted)' }}>Bienvenue dans votre espace personnel Kinetic.</p>
              </div>

              <div className="k-widget" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🌍</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Fil d&apos;actualité global</h3>
                <p style={{ color: 'var(--ks-text-muted)', fontSize: 13 }}>Le flux de vos activités, de vos abonnements et des clubs sera affiché ici.</p>
              </div>
            </div>

            {/* Colonne de droite: Mes Clubs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              <div className="k-widget">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 className="k-widget-title" style={{ margin: 0 }}>MES CLUBS</h3>
                  {user.role === 'COACH' && !user.clubId && (
                    <Link href="/dashboard/create" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ks-primary)', textDecoration: 'none' }}>+ Créer</Link>
                  )}
                </div>

                {activeClub ? (
                  <Link href={`/clubs/${activeClub.id}/feed`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--ks-bg)', borderRadius: 12, textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s', cursor: 'pointer' }} className="hover-lift">
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: activeClub.primaryColor || 'var(--ks-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20 }}>
                      {activeClub.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{activeClub.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ks-text-muted)', marginTop: 2 }}>Accéder à l&apos;espace →</div>
                    </div>
                  </Link>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--ks-text-muted)', textAlign: 'center', padding: '16px 0' }}>
                    Vous n&apos;avez rejoint aucun club.
                  </div>
                )}
              </div>

              {/* Suggestions de clubs pour les athlètes */}
              {!activeClub && (
                <div className="k-widget" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                  <h3 className="k-widget-title" style={{ marginBottom: 16 }}>SUGGESTIONS</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {clubs.map(c => (
                      <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'white', border: '1px solid var(--ks-border)', borderRadius: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--ks-text-muted)', marginTop: 2 }}>📍 {c.city || 'Ville inconnue'}</div>
                        </div>
                        <button className="k-btn k-btn-primary" style={{ padding: '8px 12px', fontSize: 12 }} onClick={() => joinClub(c.id)}>Rejoindre</button>
                      </div>
                    ))}
                    {clubs.length === 0 && <p style={{ fontSize: 12, color: 'var(--ks-text-muted)' }}>Aucun club disponible.</p>}
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
