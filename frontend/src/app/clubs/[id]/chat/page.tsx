'use client';
export default function ClubChatPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Messagerie du club</h1>
        <p style={{ color: 'var(--ks-text-muted)' }}>Discussion en temps réel avec tous les membres.</p>
      </div>
      <div className="k-widget" style={{ padding: 40, textAlign: 'center', color: 'var(--ks-text-muted)' }}>
        Module Chat en temps réel (Socket.io) en cours de portage vers le nouveau système de Club.
      </div>
    </div>
  );
}
