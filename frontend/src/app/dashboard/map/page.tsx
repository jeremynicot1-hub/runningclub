'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet (window check)
const ClubMap = dynamic(() => import('@/components/ClubMap'), { 
  ssr: false,
  loading: () => <div style={{ height: 500, background: '#f1f5f9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Chargement de la carte...</div>
});

export default function DashboardMapPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [clubs, setClubs] = useState<any[]>([]);
  const [regionFilter, setRegionFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [myClubs, setMyClubs] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      apiFetch<any[]>('/api/clubs').then(setClubs).catch(console.error);
      apiFetch<any>('/api/users/me').then(u => setMyClubs(u.clubs || [])).catch(console.error);
    }
  }, [user, loading, router]);

  const regions = Array.from(new Set(clubs.map(c => c.region).filter(Boolean)));
  const departments = Array.from(new Set(clubs.map(c => c.department).filter(Boolean)));

  const filteredClubs = clubs.filter(c => {
    const matchesRegion = !regionFilter || c.region === regionFilter;
    const matchesDept = !deptFilter || c.department === deptFilter;
    const matchesCity = !cityFilter || c.city?.toLowerCase().includes(cityFilter.toLowerCase());
    return matchesRegion && matchesDept && matchesCity;
  });

  const isAlreadyMember = (id: string) => myClubs.some(c => c.id === id);

  const handleJoin = async () => {
    if (!selectedClub) return;
    setIsJoining(true);
    try {
      await apiFetch(`/api/clubs/${selectedClub.id}/join`, { method: 'POST' });
      setRequestSent(true);
      // Refresh club list to update pending status if needed
      apiFetch<any[]>('/api/clubs').then(setClubs);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la demande d\'adhésion.');
    } finally {
      setIsJoining(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="kinetic-app">
      <aside className="kinetic-sidebar" style={{ background: '#0f172a', borderRight: 'none' }}>
        <div className="kinetic-logo" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
          <div className="kinetic-logo-main" style={{ fontSize: 22, color: 'white' }}>KINETIC</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ks-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Discovery</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          <div className="kinetic-nav-item" onClick={() => router.push('/dashboard')} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
            Mon Accueil
          </div>
          <div className="kinetic-nav-item" onClick={() => router.push('/dashboard/my-club')} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Mon Club
          </div>
          <div className="kinetic-nav-item active" style={{ color: 'white', background: 'rgba(255,255,255,0.05)' }}>
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
          <h2 style={{ fontSize: 16, fontWeight: 800 }}>Découvrir les clubs à proximité</h2>
        </header>
        <div className="kinetic-content">
          <div style={{ width: '100%', maxWidth: '1100px' }}>
            <div className="k-widget" style={{ marginBottom: 24, padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Trouvez votre prochain club d&apos;athlétisme</h3>
              <p style={{ color: 'var(--ks-text-muted)', fontSize: 14, marginBottom: 20 }}>Explorez la carte pour trouver les clubs proches de chez vous et rejoindre une communauté passionnée.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div className="k-field">
                  <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Région</label>
                  <select className="k-input" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} style={{ padding: '10px 12px' }}>
                    <option value="">Toutes les régions</option>
                    {regions.sort().map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="k-field">
                  <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Département</label>
                  <select className="k-input" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={{ padding: '10px 12px' }}>
                    <option value="">Tous les départements</option>
                    {departments.sort().map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="k-field">
                  <label style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>Ville</label>
                  <input className="k-input" type="text" placeholder="Rechercher une ville..." value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} style={{ padding: '10px 12px' }} />
                </div>
              </div>
            </div>
            
            <div style={{ height: 600, background: 'var(--ks-bg)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--ks-shadow)', marginBottom: 32 }}>
              <ClubMap clubs={filteredClubs} onSelect={(c) => { setSelectedClub(c); setRequestSent(false); }} />
            </div>

            <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>{filteredClubs.length} club(s) trouvé(s)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {filteredClubs.map(c => (
                <div key={c.id} className="k-card hover-lift" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="k-avatar k-avatar-md" style={{ borderRadius: 8, background: '#f1f5f9' }}>
                    {c.logo ? <img src={`http://localhost:5000${c.logo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : c.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ks-text-muted)' }}>📍 {c.city}</div>
                  </div>
                  <button className="k-btn" style={{ padding: '6px 12px', fontSize: 12, background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }} onClick={() => { setSelectedClub(c); setRequestSent(false); }}>Détails</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Club Details Modal */}
      {selectedClub && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="k-widget" style={{ width: '100%', maxWidth: 500, padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <div style={{ height: 120, background: selectedClub.primaryColor || 'var(--ks-primary)', position: 'relative' }}>
              <button 
                onClick={() => setSelectedClub(null)}
                style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
              >✕</button>
            </div>
            <div style={{ padding: '0 32px 32px 32px', marginTop: -40, textAlign: 'center' }}>
              <div className="k-avatar" style={{ width: 80, height: 80, margin: '0 auto 16px', border: '4px solid white', boxShadow: 'var(--ks-shadow)', background: 'white' }}>
                {selectedClub.logo ? <img src={`http://localhost:5000${selectedClub.logo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedClub.name[0]}
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{selectedClub.name}</h2>
              <div style={{ color: 'var(--ks-text-muted)', fontSize: 14, marginBottom: 16 }}>📍 {selectedClub.address || selectedClub.city}</div>
              
              {selectedClub.website && (
                <a href={selectedClub.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ks-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 700, marginBottom: 20 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                  Visiter le site web
                </a>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                {selectedClub.sports?.map((s: string) => (
                  <span key={s} style={{ padding: '4px 12px', background: 'rgba(255, 90, 31, 0.1)', color: 'var(--ks-primary)', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>{s}</span>
                ))}
              </div>
              
              <div style={{ textAlign: 'left', background: 'var(--ks-bg)', padding: 20, borderRadius: 16, marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ks-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>À propos du club</div>
                <p style={{ fontSize: 14, color: 'var(--ks-text-main)', lineHeight: 1.6, margin: 0 }}>
                  {selectedClub.description || "Ce club n'a pas encore de description. Rejoignez-les pour en savoir plus sur leurs activités et entraînements."}
                </p>
              </div>

              {requestSent ? (
                <div style={{ background: '#f0fdf4', color: '#166534', padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  Demande d&apos;adhésion envoyée !
                </div>
              ) : (
                <button 
                  onClick={handleJoin}
                  disabled={isJoining || isAlreadyMember(selectedClub.id)}
                  className="k-btn k-btn-primary" 
                  style={{ width: '100%', padding: '16px', fontSize: 16, borderRadius: 12 }}
                >
                  {isJoining ? 'Envoi...' : isAlreadyMember(selectedClub.id) ? 'Déjà membre' : 'Rejoindre le club'}
                </button>
              )}
              {isAlreadyMember(selectedClub.id) && (
                <p style={{ marginTop: 12, fontSize: 12, color: 'var(--ks-primary)', fontWeight: 700 }}>Vous faites déjà partie de ce club.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
