'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

type Role = 'COACH' | 'ATHLETE';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    role: 'ATHLETE' as Role, email: '', password: '', firstName: '', lastName: '',
    sport: 'Athlétisme', license: '', dob: '', height: '', weight: ''
  });
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { setMounted(true); }, []);

  const canNext = form.firstName && form.lastName && form.email && form.password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register({ ...form, height: form.height ? parseFloat(form.height) : undefined, weight: form.weight ? parseFloat(form.weight) : undefined });
      router.push('/');
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erreur'); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>A</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)', letterSpacing: '-0.3px' }}>AthletiX</span>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {[1, 2].map(s => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s' }} />
          ))}
        </div>

        <div className="card card-p-lg">
          {error && <div className="alert alert-error">{error}</div>}

          {step === 1 && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 4 }}>Créer un compte</h1>
                <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Étape 1 : choisissez votre rôle et vos identifiants</p>
              </div>

              {/* Role picker — rendered only client-side to avoid hydration mismatch */}
              {mounted && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {(['COACH', 'ATHLETE'] as Role[]).map(r => {
                  const isSelected = form.role === r;
                  return (
                    <button key={r} type="button" onClick={() => upd('role', r)} style={{
                      padding: '16px 12px', borderRadius: 12, textAlign: 'center',
                      border: `2px solid ${isSelected ? '#c02631' : '#e5e7eb'}`,
                      background: isSelected ? '#fff0f0' : '#ffffff',
                      cursor: 'pointer', transition: 'all 0.15s',
                      outline: 'none'
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{r === 'COACH' ? '🏋️' : '🏃'}</div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: isSelected ? '#c02631' : '#111111', marginBottom: 2 }}>{r === 'COACH' ? 'Coach' : 'Athlète'}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{r === 'COACH' ? 'Gérer un club' : 'Rejoindre un club'}</div>
                    </button>
                  );
                })}
              </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="form-group"><label className="form-label">Prénom</label><input className="form-input" value={form.firstName} onChange={e => upd('firstName', e.target.value)} placeholder="Jean" /></div>
                <div className="form-group"><label className="form-label">Nom</label><input className="form-input" value={form.lastName} onChange={e => upd('lastName', e.target.value)} placeholder="Dupont" /></div>
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="jean@club.fr" /></div>
              <div className="form-group" style={{ marginBottom: 24 }}><label className="form-label">Mot de passe</label><input className="form-input" type="password" value={form.password} onChange={e => upd('password', e.target.value)} placeholder="6 caractères minimum" /></div>

              <button className="btn btn-primary" style={{ width: '100%', padding: '12px 20px', fontSize: 15 }}
                disabled={!canNext} onClick={() => canNext && setStep(2)}>
                Continuer →
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 4 }}>Profil sportif</h2>
                <p style={{ color: 'var(--text-2)', fontSize: 14 }}>Étape 2 : informations sportives (optionnelles)</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group"><label className="form-label">Sport</label><input className="form-input" value={form.sport} onChange={e => upd('sport', e.target.value)} /></div>
                <div className="form-group"><label className="form-label">N° de licence <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optionnel)</span></label><input className="form-input" value={form.license} onChange={e => upd('license', e.target.value)} placeholder="123456789" /></div>
                <div className="form-group"><label className="form-label">Date de naissance</label><input className="form-input" type="date" value={form.dob} onChange={e => upd('dob', e.target.value)} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label className="form-label">Taille (cm)</label><input className="form-input" type="number" value={form.height} onChange={e => upd('height', e.target.value)} placeholder="175" /></div>
                  <div className="form-group"><label className="form-label">Poids (kg)</label><input className="form-input" type="number" value={form.weight} onChange={e => upd('weight', e.target.value)} placeholder="70" /></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>← Retour</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '12px 20px', fontSize: 15 }} disabled={loading}>
                  {loading ? 'Création...' : 'Créer mon compte 🚀'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-2)', fontSize: 14 }}>
          Déjà un compte ? <Link href="/login" className="link">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
