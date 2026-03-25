'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      {/* Left brand panel */}
      <div style={{
        background: 'var(--text)', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '40px 48px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>A</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.3px' }}>AthletiX</span>
        </div>
        {/* Quote */}
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 20, letterSpacing: '-0.5px' }}>
            &ldquo;Le seul outil dont votre club a besoin pour performer.&rdquo;
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,90,31,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700 }}>M</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Marc Dupont</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Coach, EA Lyon Athlétisme</div>
            </div>
          </div>
        </div>
        {/* Decorative */}
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,90,31,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,90,31,0.05)', pointerEvents: 'none' }} />
      </div>

      {/* Right form panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 6 }}>Bon retour 👋</h1>
            <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Connectez-vous à votre espace</p>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <input className="form-input" type="email" placeholder="jean@club.fr"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ marginTop: 4, padding: '11px 20px', fontSize: 15, fontWeight: 600 }}>
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-2)', fontSize: 14 }}>
            Pas encore de compte ?{' '}
            <Link href="/register" className="link">Créer un compte</Link>
          </p>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <Link href="/landing" style={{ fontSize: 13, color: 'var(--text-3)' }}>← Retour à l&apos;accueil</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
