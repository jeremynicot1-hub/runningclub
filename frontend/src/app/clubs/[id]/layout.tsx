'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import Topbar from '@/components/Topbar';
import { apiFetch } from '@/lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const id = params?.id as string;
  const [club, setClub] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (id) {
      apiFetch<any>(`/api/clubs/${id}`).then((c) => {
        setClub(c);
        if (c?.primaryColor) {
          document.documentElement.style.setProperty('--ks-primary', c.primaryColor);
        }
      }).catch(console.error);
    }
  }, [user, loading, router, id]);

  if (loading || !user) return null;

  const [showMembers, setShowMembers] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const tabs = [
    { name: 'Flux', href: `/clubs/${id}/feed` },
    { name: 'Chat Club', href: `/clubs/${id}/chat` },
    { name: 'Agenda Club', href: `/clubs/${id}/calendar` },
    { name: 'Événements', href: `/clubs/${id}/events` },
  ];

  return (
    <div className="kinetic-app">
      <DashboardSidebar />
      <div className="kinetic-main">
        <Topbar />
        
        {/* Club Specific Header */}
        <div style={{ background: 'white', borderBottom: '1px solid var(--ks-border)' }}>
          <div style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ 
                width: 54, height: 54, borderRadius: 12, 
                background: club?.primaryColor || 'var(--ks-primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 24, fontWeight: 900
              }}>
                {club?.logo ? <img src={`http://localhost:5000${club.logo}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} /> : club?.name?.[0]}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--ks-primary)', letterSpacing: '-0.02em', margin: 0 }}>{club?.name?.toUpperCase()}</h1>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ks-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Membre Premium</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowMembers(true)} className="k-btn" style={{ background: '#f0f2f5', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 800 }}>Membres</button>
              <button onClick={() => setShowInvite(true)} className="k-btn k-btn-primary" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 800 }}>Inviter un athlète</button>
            </div>
          </div>
          
          <div style={{ padding: '0 40px', display: 'flex', gap: 32 }}>
            {tabs.map(tab => (
              <Link 
                key={tab.href}
                href={tab.href}
                style={{ 
                  padding: '12px 0', 
                  fontSize: 14, 
                  fontWeight: 800, 
                  color: pathname === tab.href || (tab.name === 'Flux' && pathname === `/clubs/${id}`) ? 'var(--ks-primary)' : 'var(--ks-text-muted)',
                  textDecoration: 'none',
                  borderBottom: pathname === tab.href || (tab.name === 'Flux' && pathname === `/clubs/${id}`) ? '3px solid var(--ks-primary)' : '3px solid transparent'
                }}
              >
                {tab.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Members Modal */}
        {showMembers && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowMembers(false)}>
            <div style={{ background: 'white', width: 440, borderRadius: 24, padding: 32 }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 24 }}>Liste des Athlètes</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 400, overflowY: 'auto' }}>
                {club?.members?.map((m: any) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div className="k-avatar" style={{ background: 'var(--ks-bg)', border: '1px solid var(--ks-border)' }}>{m.firstName[0]}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800 }}>{m.firstName} {m.lastName}</div>
                        <div style={{ fontSize: 11, color: 'var(--ks-text-muted)' }}>{m.role === 'COACH' ? 'Coach' : 'Athlète'} • {m.city || 'Paris'}</div>
                      </div>
                    </div>
                    <button className="k-btn" style={{ padding: '6px 12px', fontSize: 11, borderRadius: 8 }}>Profil</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInvite && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowInvite(false)}>
            <div style={{ background: 'white', width: 440, borderRadius: 24, padding: 32 }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Inviter un athlète</h2>
              <p style={{ fontSize: 14, color: 'var(--ks-text-muted)', marginBottom: 24 }}>Partagez ce lien unique ou envoyez une invitation par email.</p>
              
              <div style={{ background: 'var(--ks-bg)', padding: 16, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <code style={{ fontSize: 12 }}>athletix.app/join/{club?.id?.slice(0,8)}</code>
                <button className="k-btn" style={{ padding: '6px 12px', fontSize: 11, background: 'white' }}>Copier</button>
              </div>

              <input type="email" placeholder="Email de l'athlète..." style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid var(--ks-border)', marginBottom: 16, fontSize: 14, outline: 'none' }} />
              <button className="k-btn k-btn-primary" style={{ width: '100%', padding: 14, borderRadius: 12 }} onClick={() => { alert('Invitation envoyée !'); setShowInvite(false); }}>Envoyer l'invitation</button>
            </div>
          </div>
        )}

        <div className="kinetic-content" style={{ padding: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
