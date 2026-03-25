'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function CreateClubPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const club = await apiFetch<any>('/api/clubs', { method: 'POST', body: JSON.stringify(form) });
      router.push(`/clubs/${club.id}/feed`);
    } catch (err: any) { 
      setError(err?.message || 'Erreur lors de la création'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'var(--ks-primary)', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>← Retour</button>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Créer votre espace Club</h1>
        <p style={{ color: 'var(--ks-text-muted)', fontSize: 15 }}>Configurez votre club pour inviter vos athlètes et planifier vos séances.</p>
      </div>

      <div className="k-widget" style={{ padding: 32 }}>
        {error && <div style={{ padding: 12, background: '#fee2e2', color: '#b91c1c', borderRadius: 8, marginBottom: 24, fontSize: 13, fontWeight: 600 }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Nom du club *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: EA Lyon Athlétisme" required style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14 }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Ville</label>
            <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Ex: Lyon" style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14 }} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Description</label>
            <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Présentez brièvement votre club..." style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--ks-border)', background: 'var(--ks-bg)', fontSize: 14, resize: 'vertical' }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--ks-border)' }}>
            <button type="submit" className="k-btn k-btn-primary" disabled={loading} style={{ padding: '12px 24px', fontSize: 15 }}>
              {loading ? 'Création...' : 'Créer et continuer →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
