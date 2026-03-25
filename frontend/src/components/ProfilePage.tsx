'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Profile { id: string; firstName: string; lastName: string; email: string; sport: string; license?: string; dob?: string; height?: number; weight?: number; role: string; }

export default function ProfilePage({ role }: { role: 'COACH' | 'ATHLETE' }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', sport: '', license: '', dob: '', height: '', weight: '' });
  const [loading, setLoading] = useState(false);
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    apiFetch<Profile>('/api/users/me').then(p => {
      setProfile(p);
      setForm({ firstName: p.firstName, lastName: p.lastName, sport: p.sport, license: p.license || '', dob: p.dob ? p.dob.split('T')[0] : '', height: p.height?.toString() || '', weight: p.weight?.toString() || '' });
    }).catch(() => router.push('/login'));
  }, [router]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const updated = await apiFetch<Profile>('/api/users/me', { method: 'PUT', body: JSON.stringify({ ...form, height: form.height ? parseFloat(form.height) : null, weight: form.weight ? parseFloat(form.weight) : null }) });
      setProfile(updated); setEditing(false);
    } catch { /* */ } finally { setLoading(false); }
  };

  if (!profile) return <div className="topbar"><span className="topbar-title">Profil</span></div>;

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`;
  const fields = [
    { label: 'Sport', value: profile.sport || '—' },
    { label: 'Licence', value: profile.license || 'Non renseigné' },
    { label: 'Date de naissance', value: profile.dob ? new Date(profile.dob).toLocaleDateString('fr-FR') : '—' },
    { label: 'Taille', value: profile.height ? `${profile.height} cm` : '—' },
    { label: 'Poids', value: profile.weight ? `${profile.weight} kg` : '—' },
  ];

  return (
    <div>
      <div className="topbar">
        <span className="topbar-title">Mon profil</span>
        {!editing && <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>Modifier</button>}
      </div>
      <div className="page" style={{ maxWidth: 600 }}>
        {/* Header card */}
        <div className="card card-p" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
          <div className="avatar avatar-xl">{initials}</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.4px', marginBottom: 2 }}>{profile.firstName} {profile.lastName}</h1>
            <div style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 6 }}>{profile.email}</div>
            <span className={`badge ${role === 'COACH' ? 'badge-orange' : 'badge-green'}`}>{role === 'COACH' ? '🏋️ Coach' : '🏃 Athlète'}</span>
          </div>
        </div>

        <div className="card card-p">
          {!editing ? (
            <>
              {fields.map(f => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-2)', fontSize: 14 }}>{f.label}</span>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{f.value}</span>
                </div>
              ))}
            </>
          ) : (
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label className="form-label">Prénom</label><input className="form-input" value={form.firstName} onChange={e => upd('firstName', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Nom</label><input className="form-input" value={form.lastName} onChange={e => upd('lastName', e.target.value)} /></div>
              </div>
              <div className="form-group"><label className="form-label">Sport</label><input className="form-input" value={form.sport} onChange={e => upd('sport', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Licence</label><input className="form-input" value={form.license} onChange={e => upd('license', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Date de naissance</label><input className="form-input" type="date" value={form.dob} onChange={e => upd('dob', e.target.value)} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label className="form-label">Taille (cm)</label><input className="form-input" type="number" value={form.height} onChange={e => upd('height', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Poids (kg)</label><input className="form-input" type="number" value={form.weight} onChange={e => upd('weight', e.target.value)} /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditing(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
