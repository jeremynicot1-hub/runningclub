'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import DashboardSidebar from '@/components/DashboardSidebar';
import Topbar from '@/components/Topbar';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    sport: 'Athlétisme',
    city: '',
    address: '',
    bio: '',
    license: '',
    pb5k: '',
    pb10k: '',
    pb21k: '',
    pb42k: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        sport: user.sport || 'Athlétisme',
        city: user.city || '',
        address: user.address || '',
        bio: user.bio || '',
        license: user.license || '',
        pb5k: user.pb5k || '',
        pb10k: user.pb10k || '',
        pb21k: user.pb21k || '',
        pb42k: user.pb42k || ''
      });
    }
  }, [user, loading, router]);

  const formatTime = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Take only first 6 digits
    const limited = digits.slice(0, 6);
    
    // Format based on length
    if (limited.length <= 2) return limited;
    if (limited.length <= 4) return `${limited.slice(0, 2)}:${limited.slice(2)}`;
    return `${limited.slice(0, 2)}:${limited.slice(2, 4)}:${limited.slice(4)}`;
  };

  const handleTimeChange = (field: string, value: string) => {
    const formatted = formatTime(value);
    setFormData((prev: any) => ({ ...prev, [field]: formatted }));
  };

  const validate = () => {
    if (formData.license && !/^\d{8}$/.test(formData.license)) {
      setError('La licence doit contenir exactement 8 chiffres.');
      return false;
    }
    const timeRegex = /^([0-9]{2}):([0-5][0-9]):([0-5][0-9])$/;
    const prFields = ['pb5k', 'pb10k', 'pb21k', 'pb42k'];
    for (const field of prFields) {
      const val = formData[field];
      if (val && !timeRegex.test(val)) {
        setError(`Le format du record (${field.replace('pb', '').toUpperCase()}) doit être HH:MM:SS.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    
    setIsSaving(true);
    try {
      await apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setIsEditing(false);
      window.location.reload(); 
    } catch (err) {
      setError('Erreur lors de la mise à jour.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="kinetic-app" style={{ background: '#fcfcfc' }}>
      <DashboardSidebar />
      <div className="kinetic-main">
        <Topbar />
        
        {/* Profile Header / Breadcrumb */}
        <div style={{ padding: '24px 80px 0', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c02631' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 style={{ fontSize: 18, fontWeight: 900, color: '#1a1a1b', margin: 0 }}>Profil Athlète</h1>
          <div style={{ flex: 1 }} />
          <div style={{ color: '#c02631', fontWeight: 900, fontStyle: 'italic', fontSize: 20, letterSpacing: '-0.02em' }}>VELOCITY</div>
        </div>

        <div className="kinetic-content">
          <div className="kinetic-grid">
            
            {/* Main Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
              
              {/* Hero Section */}
              <div style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    width: 200, height: 200, borderRadius: 32, overflow: 'hidden', 
                    background: '#fff', border: '1px solid #ddd', boxShadow: '0 15px 40px rgba(0,0,0,0.06)' 
                  }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}`} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ 
                    position: 'absolute', top: -10, left: -10, width: 36, height: 36, 
                    borderRadius: 10, background: '#c02631', color: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(192, 38, 49, 0.3)'
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </div>
                </div>
                
                <div style={{ flex: 1, paddingTop: 12 }}>
                  <div style={{ 
                    display: 'inline-block', background: '#ffe4e6', color: '#c02631', 
                    fontSize: 10, fontWeight: 900, textTransform: 'uppercase', 
                    padding: '6px 14px', borderRadius: 20, marginBottom: 20, letterSpacing: '0.05em' 
                  }}>
                    Athlète Élite
                  </div>
                  <h2 style={{ fontSize: 56, fontWeight: 900, color: '#1a1a1b', margin: '0 0 20px 0', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {user.firstName} {user.lastName}
                  </h2>
                  <p style={{ fontSize: 18, lineHeight: 1.7, color: '#64748b', fontStyle: 'italic', maxWidth: 600, margin: 0 }}>
                    &ldquo;{user.bio || "Passionné de course à pied and de performance. En route pour le prochain championnat élite."}&rdquo;
                  </p>
                </div>
              </div>

              {/* Season Performance */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                  <div style={{ color: '#c02631' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg></div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Performance de la Saison</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
                  <div className="k-widget" style={{ padding: '40px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 16 }}>Distance Totale</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 40, fontWeight: 900 }}>1,240</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#64748b' }}>km</span>
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, left: 40, right: 40, height: 4, background: '#eee', borderRadius: 2 }}>
                      <div style={{ width: '70%', height: '100%', background: '#c02631' }} />
                    </div>
                  </div>
                  <div className="k-widget" style={{ padding: '40px', borderLeft: '6px solid #c02631' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 16 }}>Séances Actives</div>
                    <div style={{ fontSize: 40, fontWeight: 900 }}>142</div>
                  </div>
                  <div className="k-widget" style={{ padding: '40px' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 16 }}>Membre Depuis</div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>Oct 2023</div>
                  </div>
                </div>
              </section>

              {/* Personal Records */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                  <div style={{ color: '#c02631' }}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg></div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Records Personnels</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
                  {[
                    { label: '5KM', value: formData.pb5k || '--:--', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                    { label: '10KM', value: formData.pb10k || '--:--', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                    { label: 'SEMI', value: formData.pb21k || '--:--', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
                    { label: 'MARATHON', value: formData.pb42k || '--:--', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg> },
                  ].map((pr, i) => (
                    <div key={i} className="k-widget hover-bg" style={{ padding: 32, background: '#f8fafc', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <div style={{ color: '#c02631', marginBottom: 16 }}>{pr.icon}</div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 6 }}>{pr.label}</div>
                      <div style={{ fontSize: 20, fontWeight: 900 }}>{pr.value}</div>
                    </div>
                  ))}
                </div>
              </section>

            </div>

            {/* Sidebar Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
              
              {/* Administrative Card */}
              <div className="k-widget" style={{ padding: 48, borderRadius: 40, position: 'relative' }}>
                <div style={{ 
                  position: 'absolute', top: 0, right: 0, width: 100, height: 100, 
                  background: 'rgba(192, 38, 49, 0.03)', borderRadius: '0 40px 0 100px' 
                }} />
                
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 40 }}>Administratif</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #eee' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Adresse</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1b', lineHeight: 1.5 }}>{user.address || "123 Rue de la République"}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #eee' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21h18"/><path d="M3 7v1a3 3 0 0 0 6 0V7m6 0v1a3 3 0 0 0 6 0V7M3 7l1.1-2.2A2 2 0 0 1 5.8 4h12.4a2 2 0 0 1 1.7 1L21 7M9 7h6"/><rect x="4" y="11" width="16" height="10" rx="2"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Ville</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1b' }}>{user.city || "Paris, France"}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #eee' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h10"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Licence Athlète</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1b', letterSpacing: '0.05em' }}>#{user.license || "--------"}</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsEditing(true)}
                  className="k-btn k-btn-primary" 
                  style={{ width: '100%', marginTop: 48, padding: '18px 0', borderRadius: 16, background: '#c02631', fontSize: 15 }}
                >
                  Modifier le Profil <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginLeft: 8 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>

              {/* Training Focus */}
              <div className="k-widget" style={{ padding: 48 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, marginBottom: 28 }}>Focus d&apos;Entraînement</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  {['Endurance', 'Tempo Runs', 'Récupération', 'Vitesse', 'Trail', 'Prépa Marathon'].map(tag => (
                    <div key={tag} style={{ 
                      padding: '12px 20px', borderRadius: 14, background: '#f8fafc', 
                      fontSize: 13, fontWeight: 700, color: '#64748b', border: '1px solid #eee' 
                    }}>
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Modal-style Edit Layer */}
        {isEditing && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
            <div className="k-widget custom-scrollbar" style={{ width: '100%', maxWidth: 580, padding: 48, borderRadius: 40, maxHeight: '90vh', overflowY: 'auto', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                <h2 style={{ fontSize: 28, fontWeight: 900 }}>Modifier le Profil</h2>
                <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '14px 20px', borderRadius: 14, fontSize: 14, fontWeight: 700, marginBottom: 32, border: '1px solid #fee2e2' }}>⚠️ {error}</div>}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Prénom</label>
                    <input className="k-input" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Nom</label>
                    <input className="k-input" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Bio / Citation</label>
                  <textarea className="k-input" rows={2} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ resize: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Ville</label>
                    <input className="k-input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>Numéro de Licence (8 chiffres)</label>
                    <input className="k-input" placeholder="12345678" value={formData.license} onChange={e => setFormData({...formData, license: e.target.value})} maxLength={8} />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#1a1a1b', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Records Personnels <span style={{ color: '#c02631' }}>(HH:MM:SS)</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', marginBottom: 6 }}>5 KM (H:M:S)</div>
                      <input className="k-input" value={formData.pb5k} onChange={e => handleTimeChange('pb5k', e.target.value)} placeholder="00:18:45" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', marginBottom: 6 }}>10 KM (H:M:S)</div>
                      <input className="k-input" value={formData.pb10k} onChange={e => handleTimeChange('pb10k', e.target.value)} placeholder="00:39:12" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', marginBottom: 6 }}>SEMI (H:M:S)</div>
                      <input className="k-input" value={formData.pb21k} onChange={e => handleTimeChange('pb21k', e.target.value)} placeholder="01:28:30" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', marginBottom: 6 }}>MARATHON (H:M:S)</div>
                      <input className="k-input" value={formData.pb42k} onChange={e => handleTimeChange('pb42k', e.target.value)} placeholder="03:12:15" />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                  <button type="submit" className="k-btn k-btn-primary" style={{ flex: 2, padding: '20px', background: '#c02631', fontSize: 16 }}>
                    {isSaving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="k-btn" style={{ flex: 1, padding: '20px', background: '#f1f5f9', color: '#64748b', fontSize: 16 }}>
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
