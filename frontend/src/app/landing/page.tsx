'use client';
import Link from 'next/link';

const features = [
  { icon: '📅', title: 'Planning intelligent', desc: 'Calendrier interactif pour organiser toutes vos séances d\'entraînement.' },
  { icon: '👥', title: 'Gestion d\'équipes', desc: 'Créez vos équipes, gérez vos athlètes et suivez leur progression.' },
  { icon: '📈', title: 'Suivi des performances', desc: 'Analysez les données de chaque séance et visualisez la progression.' },
  { icon: '💬', title: 'Communication en temps réel', desc: 'Chat intégré pour garder tout le club connecté.' },
];

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* NAV */}
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'var(--primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15 }}>A</div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>AthletiX</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/login" className="btn btn-ghost btn-sm">Connexion</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Commencer gratuitement</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 13, fontWeight: 500, marginBottom: 24 }}>
          🏃 Conçu pour l&apos;athlétisme
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, color: 'var(--text)', marginBottom: 20 }}>
          Gérez votre club<br />
          <span style={{ color: 'var(--primary)' }}>sans friction.</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.7 }}>
          AthletiX simplifie la gestion des membres, la planification des entraînements et le suivi des performances pour les clubs d&apos;athlétisme.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" className="btn btn-primary btn-lg">Créer un compte gratuit →</Link>
          <Link href="/login" className="btn btn-secondary btn-lg">Se connecter</Link>
        </div>

        {/* Fake dashboard preview */}
        <div style={{
          marginTop: 64, background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 20, boxShadow: '0 8px 48px rgba(0,0,0,0.10)', overflow: 'hidden',
          maxWidth: 860, marginLeft: 'auto', marginRight: 'auto'
        }}>
          {/* Mock topbar */}
          <div style={{ height: 48, background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 6 }}>
            {['#ff5f56', '#ffbd2e', '#27c93f'].map(c => (
              <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
            ))}
            <div style={{ flex: 1, margin: '0 16px', height: 24, background: 'var(--border)', borderRadius: 4 }} />
          </div>
          {/* Mock content */}
          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, minHeight: 300 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Dashboard', 'Planning', 'Équipes', 'Chat', 'Profil'].map((item, i) => (
                <div key={item} style={{ padding: '8px 12px', borderRadius: 8, background: i === 0 ? 'var(--primary-light)' : 'transparent', color: i === 0 ? 'var(--primary)' : 'var(--text-2)', fontSize: 14, fontWeight: i === 0 ? 600 : 400 }}>{item}</div>
              ))}
            </div>
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
                {[['14', 'Membres'], ['3', 'Équipes'], ['8', 'Séances'], ['2', 'Aujourd\'hui']].map(([v, l]) => (
                  <div key={l} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{v}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                📅 Calendrier des entraînements
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', color: 'var(--text)', marginBottom: 10 }}>Tout ce dont votre club a besoin</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 16 }}>Une seule plateforme pour coaches et athlètes.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 16, background: 'var(--surface)' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--text)' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', color: 'var(--text)', marginBottom: 12 }}>Prêt à moderniser votre club ?</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 16, lineHeight: 1.6, marginBottom: 28 }}>Rejoignez les clubs qui font confiance à AthletiX pour gérer leur quotidien.</p>
          <Link href="/register" className="btn btn-primary btn-lg">Commencer maintenant, c&apos;est gratuit</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 24px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
        © 2026 AthletiX — La plateforme SaaS pour les clubs d&apos;athlétisme
      </footer>
    </div>
  );
}
