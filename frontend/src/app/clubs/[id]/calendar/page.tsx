'use client';
export default function ClubCalendarPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Calendrier du club</h1>
        <p style={{ color: 'var(--ks-text-muted)' }}>Consultez et planifiez les séances d&apos;entraînement.</p>
      </div>
      <div className="k-widget" style={{ padding: 40, textAlign: 'center', color: 'var(--ks-text-muted)' }}>
        Le module Calendrier Unifié (Drag & Drop) est en cours de développement. Bientôt disponible.
      </div>
    </div>
  );
}
