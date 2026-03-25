'use client';
export default function ClubEventsPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Événements & Courses</h1>
        <p style={{ color: 'var(--ks-text-muted)' }}>Les objectifs majeurs et compétitions ciblées par le club.</p>
      </div>
      <div className="k-widget" style={{ padding: 40, textAlign: 'center', color: 'var(--ks-text-muted)' }}>
        Module Compétitions en cours d&apos;intégration.
      </div>
    </div>
  );
}
