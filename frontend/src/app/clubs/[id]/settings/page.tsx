'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function ClubSettingsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const clubId = params.id as string;
  
  const [club, setClub] = useState<any>(null);
  const [form, setForm] = useState({ 
    name: '', description: '', city: '', address: '', region: '', department: '', 
    website: '', sports: '', primaryColor: '', logo: '' 
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [leavingClub, setLeavingClub] = useState(false);

  const loadClub = () => {
    if (clubId) {
      apiFetch<any>(`/api/clubs/${clubId}`).then((c) => {
        setClub(c);
        setForm({ 
          name: c.name || '', description: c.description || '', city: c.city || '', address: c.address || '', 
          region: c.region || '', department: c.department || '', website: c.website || '',
          sports: (c.sports || []).join(', '),
          primaryColor: c.primaryColor || '#FF5A1F', logo: c.logo || '' 
        });
      }).catch(console.error);
    }
  };

  useEffect(() => { loadClub(); }, [clubId]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setSaved(false);
    try {
      let finalLogo = form.logo;
      if (logoFile) {
        const formData = new FormData();
        formData.append('logo', logoFile);
        const res = await fetch(`http://localhost:5000/api/clubs/${clubId}/logo`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData
        });
        const data = await res.json();
        finalLogo = data.logo;
      }

      await apiFetch(`/api/clubs/${clubId}/settings`, { 
        method: 'PUT', 
        body: JSON.stringify({ 
          ...form, 
          logo: finalLogo, 
          sports: form.sports.split(',').map(s => s.trim()).filter(Boolean) 
        }) 
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      document.documentElement.style.setProperty('--ks-primary', form.primaryColor);
      loadClub(); // Refresh to show new logo
      setLogoFile(null);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleApprove = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await apiFetch(`/api/clubs/${clubId}/requests/${requestId}`, { method: 'PUT', body: JSON.stringify({ status }) });
      loadClub();
    } catch (err) { console.error(err); }
  };

  const handleLeave = async () => {
    setLeavingClub(true);
    try {
      await apiFetch(`/api/clubs/${clubId}/leave`, { method: 'POST' });
      router.push('/dashboard');
    } catch (err: any) {
      alert(err?.message || 'Impossible de quitter le club.');
      setLeavingClub(false);
    }
  };

  const isOwner = club?.ownerId === user?.id;
  const pendingRequests = club?.joinRequests?.filter((r: any) => r.status === 'PENDING') ?? [];

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', paddingBottom: 60, display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Paramètres du club</h1>
        <p style={{ color: 'var(--ks-text-muted)' }}>Personnalisez l&apos;espace Kinetic de votre club.</p>
      </div>

      {/* Coach-only settings form */}
      {user?.role === 'COACH' && isOwner && (
        <form className="k-widget" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Apparence &amp; Identité</h2>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Nom du club</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14 }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Logo du club</label>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div className="k-avatar k-avatar-lg" style={{ borderRadius: 12, overflow: 'hidden', background: '#f8fafc', border: '1px solid var(--ks-border)' }}>
                {form.logo ? <img src={`http://localhost:5000${form.logo}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'Logo'}
              </div>
              <div style={{ flex: 1 }}>
                <input type="file" accept="image/*" onChange={handleLogoChange} style={{ fontSize: 13 }} />
                <p style={{ color: 'var(--ks-text-muted)', fontSize: 11, marginTop: 4 }}>Format recommandé: carré (PNG, JPG, max 2Mo)</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Couleur de base (Primaire)</label>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <input type="color" value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} style={{ width: 44, height: 44, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }} />
                <div style={{ fontSize: 12, color: 'var(--ks-text-muted)' }}>Code: {form.primaryColor}</div>
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--ks-text-muted)', fontSize: 12, marginTop: -4 }}>Cette couleur habillera l&apos;espace de votre club pour tous vos membres.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Région</label>
              <input type="text" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} placeholder="Ex: Bretagne" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Département (N°)</label>
              <input type="text" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Ex: 35" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Ville</label>
            <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14 }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Adresse complète pour l&apos;annuaire</label>
            <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Ex: Stade Municipal..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14 }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Lien Site Web</label>
            <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14 }} />
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Spécialités / Sports (séparés par des virgules)</label>
            <input type="text" value={form.sports} onChange={e => setForm(f => ({ ...f, sports: e.target.value }))} placeholder="Sprint, Trail, Saut..." style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14 }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, borderTop: '1px solid var(--ks-border)', paddingTop: 20 }}>
            {saved && <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>✓ Enregistré</span>}
            <button type="submit" className="k-btn k-btn-primary" disabled={loading}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      )}

      {/* Join requests approval — coaches only */}
      {user?.role === 'COACH' && pendingRequests.length > 0 && (
        <div className="k-widget">
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>
            Demandes d&apos;adhésion
            <span style={{ marginLeft: 8, background: 'var(--ks-primary)', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 12 }}>{pendingRequests.length}</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingRequests.map((r: any) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: 'var(--ks-bg)', borderRadius: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.user.firstName} {r.user.lastName}</div>
                  <div style={{ color: 'var(--ks-text-muted)', fontSize: 12 }}>{r.user.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="k-btn" style={{ padding: '6px 12px', fontSize: 12, color: '#dc2626', border: '1px solid #dc2626' }} onClick={() => handleApprove(r.id, 'REJECTED')}>Refuser</button>
                  <button className="k-btn k-btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleApprove(r.id, 'APPROVED')}>Accepter</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave club — non-owners only */}
      {!isOwner && club?.members?.some((m: any) => m.id === user?.id) && (
        <div className="k-widget" style={{ border: '1px solid #fecaca' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#dc2626', marginBottom: 8 }}>Zone dangereuse</h2>
          <p style={{ color: 'var(--ks-text-muted)', fontSize: 14, marginBottom: 16 }}>Quitter le club supprimera votre accès à tous ses contenus.</p>
          {!leaveConfirm ? (
            <button className="k-btn" style={{ color: '#dc2626', border: '1px solid #dc2626' }} onClick={() => setLeaveConfirm(true)}>Quitter le club</button>
          ) : (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 16 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#dc2626', marginBottom: 12 }}>⚠️ Attention — Cette action est irréversible. Êtes-vous sûr de vouloir quitter {club?.name} ?</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="k-btn" onClick={() => setLeaveConfirm(false)}>Annuler</button>
                <button className="k-btn" style={{ background: '#dc2626', color: 'white', border: 'none' }} disabled={leavingClub} onClick={handleLeave}>
                  {leavingClub ? 'En cours...' : 'Confirmer et quitter'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
