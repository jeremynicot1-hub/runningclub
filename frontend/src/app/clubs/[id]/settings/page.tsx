'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function ClubSettingsPage() {
  const { user } = useAuth();
  const params = useParams();
  const clubId = params.id as string;
  
  const [form, setForm] = useState({ name: '', description: '', city: '', primaryColor: '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (clubId) {
      apiFetch(`/api/clubs/${clubId}`).then((c: any) => {
        setForm({ name: c.name || '', description: c.description || '', city: c.city || '', primaryColor: c.primaryColor || '#FF5A1F' });
      }).catch(console.error);
    }
  }, [clubId]);

  if (user?.role !== 'COACH') {
    return <div style={{ padding: 40 }}>Accès non autorisé. Seul le manager du club peut accéder aux paramètres.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setSaved(false);
    try {
      await apiFetch(`/api/clubs/${clubId}/settings`, {
        method: 'PUT',
        body: JSON.stringify(form)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Inject the new color immediately for preview
      document.documentElement.style.setProperty('--ks-primary', form.primaryColor);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Paramètres du club</h1>
        <p style={{ color: 'var(--ks-text-muted)' }}>Personnalisez l&apos;apparence et les informations de votre espace Kinetic.</p>
      </div>

      <form className="k-widget" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Nom du club</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14 }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Couleur principale (Thème)</label>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <input 
              type="color" 
              value={form.primaryColor} 
              onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} 
              style={{ width: 48, height: 48, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }} 
            />
            <div style={{ flex: 1, color: 'var(--ks-text-muted)', fontSize: 13 }}>
              Cette couleur sera appliquée aux boutons, icônes et accents de tous les membres de ce club.
            </div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Ville</label>
          <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14 }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Description</label>
          <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14, resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, borderTop: '1px solid var(--ks-border)', paddingTop: 24 }}>
          {saved && <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>Enregistré !</span>}
          <button type="submit" className="k-btn k-btn-primary" disabled={loading}>
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
