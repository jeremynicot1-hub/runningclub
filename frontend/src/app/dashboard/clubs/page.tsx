'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import dynamic from 'next/dynamic';
import DashboardSidebar from '@/components/DashboardSidebar';
import Topbar from '@/components/Topbar';
import Link from 'next/link';

// Dynamic import for Leaflet
const ClubMap = dynamic(() => import('@/components/ClubMap'), { 
  ssr: false,
  loading: () => <div style={{ height: 500, background: '#f1f5f9', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Chargement de la carte...</div>
});

// Haversine formula for distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const CITY_COORDS: Record<string, { lat: number, lng: number }> = {
  'Paris': { lat: 48.8566, lng: 2.3522 },
  'Bordeaux': { lat: 44.8378, lng: -0.5792 },
  'Lyon': { lat: 45.7640, lng: 4.8357 },
  'Marseille': { lat: 43.2965, lng: 5.3698 },
  'Lille': { lat: 50.6292, lng: 3.0573 },
  'Nantes': { lat: 47.2184, lng: -1.5536 },
  'Toulouse': { lat: 43.6047, lng: 1.4442 },
  'Strasbourg': { lat: 48.5734, lng: 7.7521 },
  'Nice': { lat: 43.7102, lng: 7.2620 },
  'Montpellier': { lat: 43.6108, lng: 3.8767 },
  'Rennes': { lat: 48.1173, lng: -1.6778 },
  'Clermont-Ferrand': { lat: 45.7772, lng: 3.0870 },
};

export default function ClubsHubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [allClubs, setAllClubs] = useState<any[]>([]);
  const [userClubs, setUserClubs] = useState<any[]>([]);
  const [pendingClubs, setPendingClubs] = useState<any[]>([]);
  
  // Filters
  const [nameFilter, setNameFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [mapBoundsClubs, setMapBoundsClubs] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      apiFetch<any>('/api/users/me').then(me => {
        setUserClubs(me.clubs || []);
      }).catch(console.error);

      apiFetch<any[]>('/api/clubs').then(data => {
        setAllClubs(data);
        const pending = data.filter(c => 
          c.joinRequests?.some((r: any) => r.userId === user.id && r.status === 'PENDING')
        );
        setPendingClubs(pending);
      }).catch(console.error);
    }
  }, [user, loading, router]);

  // Reference coordinates for distance calculation
  const searchCoords = useMemo(() => {
    const city = Object.keys(CITY_COORDS).find(k => k.toLowerCase() === cityFilter.toLowerCase());
    return city ? CITY_COORDS[city] : null;
  }, [cityFilter]);

  // Filter and sort logic
  const filteredClubs = useMemo(() => {
    let result = allClubs.filter(c => {
      const matchesName = !nameFilter || c.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesCity = !cityFilter || c.city?.toLowerCase().includes(cityFilter.toLowerCase());
      return matchesName && matchesCity;
    });

    if (searchCoords) {
      result = result.sort((a, b) => {
        const distA = calculateDistance(searchCoords.lat, searchCoords.lng, a.lat || 0, a.lng || 0);
        const distB = calculateDistance(searchCoords.lat, searchCoords.lng, b.lat || 0, b.lng || 0);
        return distA - distB;
      });
    }

    return result;
  }, [allClubs, nameFilter, cityFilter, searchCoords]);

  const handleBoundsChange = useCallback((visibleIds: string[]) => {
    setMapBoundsClubs(prev => {
        const visible = filteredClubs.filter(c => visibleIds.includes(c.id));
        const prevIds = prev.map(c => c.id).sort().join(',');
        const nextIds = visible.map(c => c.id).sort().join(',');
        if (prevIds === nextIds) return prev;
        return visible;
    });
  }, [filteredClubs]);

  const handleSelect = useCallback((c: any) => {
    setSelectedClub(c);
  }, []);

  if (loading || !user) return null;

  const isMember = (id: string) => userClubs.some(c => c.id === id);
  const isPending = (id: string) => pendingClubs.some(c => c.id === id);

  return (
    <div className="kinetic-app">
      <DashboardSidebar />

      <div className="kinetic-main">
        <Topbar />

        <div className="kinetic-content" style={{ padding: '32px 40px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--ks-text-main)', marginBottom: 8 }}>Trouvez votre prochain club</h1>
              <p style={{ color: 'var(--ks-text-muted)', fontSize: 15 }}>Découvrez des communautés athlétiques proches de chez vous ou partout en France.</p>
            </div>

            {/* 1. New Premium Search Bar */}
            <div style={{ 
              marginBottom: 32, 
              background: 'white', 
              padding: '8px', 
              borderRadius: 20, 
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
              display: 'flex',
              gap: 8,
              border: '1px solid var(--ks-border)'
            }}>
              <div style={{ flex: 1.2, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--ks-primary)', opacity: 0.8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                </div>
                <input 
                  type="text" 
                  className="k-input" 
                  placeholder="Rechercher un club par son nom..." 
                  value={nameFilter}
                  onChange={e => setNameFilter(e.target.value)}
                  style={{ padding: '14px 16px 14px 44px', border: 'none', background: 'transparent', fontSize: 14, fontWeight: 500 }}
                />
              </div>
              <div style={{ width: 1, background: 'var(--ks-border)', margin: '8px 0' }}></div>
              <div style={{ flex: 1, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--ks-primary)', opacity: 0.8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <input 
                  type="text" 
                  className="k-input" 
                  placeholder="Ville (ex: Paris, Lyon...)" 
                  value={cityFilter}
                  onChange={e => setCityFilter(e.target.value)}
                  style={{ padding: '14px 16px 14px 44px', border: 'none', background: 'transparent', fontSize: 14, fontWeight: 500 }}
                />
              </div>
              <button className="k-btn k-btn-primary" style={{ padding: '0 32px', borderRadius: 14, fontWeight: 800, fontSize: 13 }}>
                Filtrer
              </button>
            </div>

            {/* Layout Map (Left) / List (Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24, height: 750 }}>
              {/* Left: Map */}
              <div style={{ position: 'relative', borderRadius: 32, overflow: 'hidden', boxShadow: 'var(--ks-shadow-lg)', border: '1px solid var(--ks-border)' }}>
                <ClubMap 
                  clubs={filteredClubs} 
                  onSelect={handleSelect}
                  onBoundsChange={handleBoundsChange}
                />
              </div>

              {/* Right: List Side Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--ks-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', justifyContent: 'space-between', padding: '0 8px' }}>
                   <span>{mapBoundsClubs.length} clubs dans la zone</span>
                   {searchCoords && <span>Proximité activée</span>}
                 </div>
                 <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 12 }} className="custom-scrollbar">
                   {mapBoundsClubs.map(c => {
                     const dist = searchCoords ? calculateDistance(searchCoords.lat, searchCoords.lng, c.lat || 0, c.lng || 0) : null;
                     
                     return (
                       <div key={c.id} className="k-card hover-lift" style={{ border: '1px solid var(--ks-border)', padding: '18px', cursor: 'pointer', background: 'white', borderRadius: 20 }} onClick={() => handleSelect(c)}>
                          <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f8fafc', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--ks-border)' }}>
                              {c.logo ? <img src={`http://localhost:5000${c.logo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                                <div style={{ width: '100%', height: '100%', background: c.primaryColor || 'var(--ks-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 20 }}>{c.name[0]}</div>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 15, fontWeight: 900, color: '#0f172a', marginBottom: 2 }}>{c.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--ks-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                📍 {c.city}
                                {dist !== null && (
                                  <>
                                    <span style={{ color: 'var(--ks-border)' }}>•</span>
                                    <span style={{ color: 'var(--ks-primary)', fontWeight: 900 }}>{dist.toFixed(1)} km</span>
                                  </>
                                )}
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                                {c.sports?.slice(0, 3).map((s: string) => (
                                  <span key={s} style={{ fontSize: 9, background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', padding: '3px 10px', borderRadius: 8, fontWeight: 800, color: 'var(--ks-text-muted)', textTransform: 'uppercase' }}>{s}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                       </div>
                     );
                   })}
                   {mapBoundsClubs.length === 0 && (
                     <div style={{ textAlign: 'center', padding: '80px 32px', color: 'var(--ks-text-muted)', fontSize: 14, background: 'var(--ks-bg)', borderRadius: 32, border: '1px dashed var(--ks-border)' }}>
                       <div style={{ fontSize: 40, marginBottom: 16 }}>🛰️</div>
                       <div style={{ fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>Aucun club détecté</div>
                       Déplacez la carte ou modifiez vos filtres pour explorer de nouveaux horizons.
                     </div>
                   )}
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Club Details Modal */}
      {selectedClub && (
        <ClubDetailsModal 
          club={selectedClub} 
          isMember={isMember(selectedClub.id)} 
          isPending={isPending(selectedClub.id)}
          onClose={() => setSelectedClub(null)} 
        />
      )}
    </div>
  );
}

// Sub-component for Details Modal
function ClubDetailsModal({ club, isMember, isPending, onClose }: { club: any, isMember: boolean, isPending: boolean, onClose: () => void }) {
  const [isJoining, setIsJoining] = useState(false);
  const [requestSent, setRequestSent] = useState(isPending);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await apiFetch(`/api/clubs/${club.id}/join`, { method: 'POST' });
      setRequestSent(true);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la demande d\'adhésion.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="k-widget" 
        style={{ width: '100%', maxWidth: 550, padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)', borderRadius: 32, background: 'white' }}
      >
        <div style={{ height: 160, background: club.primaryColor || 'var(--ks-primary)', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), transparent)' }}></div>
          <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>✕</button>
        </div>
        <div style={{ padding: '0 40px 40px 40px', marginTop: -50, textAlign: 'center', position: 'relative' }}>
          <div className="k-avatar" style={{ width: 100, height: 100, margin: '0 auto 20px', border: '6px solid white', boxShadow: 'var(--ks-shadow-lg)', background: 'white', borderRadius: 28 }}>
            {club.logo ? <img src={`http://localhost:5000${club.logo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
               <div style={{ width: '100%', height: '100%', background: club.primaryColor || 'var(--ks-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 36 }}>{club.name[0]}</div>
            )}
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 8, color: '#0f172a' }}>{club.name}</h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
            {club.sports?.map((s: string) => (
              <span key={s} style={{ padding: '6px 14px', background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', color: '#475569', borderRadius: 12, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>{s}</span>
            ))}
          </div>

          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>📍</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--ks-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Adresse</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{club.address || club.city}</div>
              </div>
            </div>

            {club.website && (
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🌐</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--ks-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Site Web</div>
                  <a href={club.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 700, color: 'var(--ks-primary)', textDecoration: 'none' }}>{club.website.replace(/^https?:\/\//, '')}</a>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>📅</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--ks-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Horaires des Séances</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#334155', lineHeight: 1.5 }}>
                  {club.schedule || 'Nous consulter pour les horaires.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>📝</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--ks-text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Description</div>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{club.description || "Pas de description disponible pour le moment."}</div>
              </div>
            </div>
          </div>

          {requestSent ? (
            <div style={{ background: '#f0fdf4', color: '#166534', padding: '20px', borderRadius: 20, fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px solid #bbf7d0' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
              Demande d&apos;adhésion envoyée !
            </div>
          ) : (
            <button 
              onClick={handleJoin}
              disabled={isJoining || isMember}
              className="k-btn k-btn-primary" 
              style={{ width: '100%', padding: '18px', fontSize: 16, borderRadius: 20, boxShadow: '0 10px 15px -3px rgba(255, 90, 31, 0.3)' }}
            >
              {isJoining ? 'Envoi...' : isMember ? 'Déjà membre' : 'Rejoindre l\'aventure'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

