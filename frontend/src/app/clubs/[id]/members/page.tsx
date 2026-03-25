'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function ClubMembersPage() {
  const params = useParams();
  const clubId = params.id as string;
  const [club, setClub] = useState<any>(null);

  useEffect(() => {
    if (clubId) {
      apiFetch(`/api/clubs/${clubId}`).then(setClub).catch(console.error);
    }
  }, [clubId]);

  if (!club) return <div style={{ padding: 40, textAlign: 'center' }}>Chargement des membres...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Membres du club</h1>
        <p style={{ color: 'var(--ks-text-muted)' }}>Découvrez tous les athlètes et coachs inscrits au club {club.name}.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {club.members?.map((m: any) => (
          <div key={m.id} className="k-widget" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
            <div className="k-avatar k-avatar-md" style={{ background: m.role === 'COACH' ? 'var(--ks-primary)' : '#1e293b', color: 'white' }}>
              {m.firstName[0]}{m.lastName[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.firstName} {m.lastName}</div>
              <div style={{ fontSize: 12, color: 'var(--ks-text-muted)', marginTop: 2 }}>{m.role === 'COACH' ? 'ENTRAÎNEUR' : 'ATHLÈTE'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
