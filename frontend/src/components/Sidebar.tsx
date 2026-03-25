'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function Sidebar({ clubId }: { clubId?: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [clubInfo, setClubInfo] = useState({ name: 'Chargement...', logo: '' });

  useEffect(() => {
    if (clubId) {
      apiFetch<{ name: string, logo?: string }>(`/api/clubs/${clubId}`)
        .then(c => setClubInfo({ name: c.name, logo: c.logo || '' }))
        .catch(() => setClubInfo({ name: 'Kinetic Club', logo: '' }));
    }
  }, [clubId]);

  if (!user || !clubId) return null;

  const baseNav = [
    { label: 'Feed', href: `/clubs/${clubId}/feed`, icon: <path d="M4 19V5a2 2 0 012-2h13.4a.6.6 0 01.48.96L17 8.5l2.88 4.54A.6.6 0 0119.4 14H6v5" /> },
    { label: 'Calendar', href: `/clubs/${clubId}/calendar`, icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
    { label: 'Members', href: `/clubs/${clubId}/members`, icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></> },
    { label: 'Chat', href: `/clubs/${clubId}/chat`, icon: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /> },
    { label: 'Events', href: `/clubs/${clubId}/events`, icon: <><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></> },
    { label: 'Paramètres', href: `/clubs/${clubId}/settings`, icon: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></> }
  ];

  const nav = baseNav;

  return (
    <aside className="kinetic-sidebar">
      <div className="kinetic-logo" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '24px' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ks-text-muted)', fontWeight: 600, marginBottom: 16, textDecoration: 'none', transition: 'color 0.2s' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Changer d&apos;espace
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          {clubInfo.logo ? (
            <img src={clubInfo.logo} alt="Logo" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--ks-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18 }}>
              {clubInfo.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--ks-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CLUB</div>
            <div className="kinetic-logo-main" style={{ fontSize: 16, lineHeight: 1.1, wordBreak: 'break-word' }}>{clubInfo.name}</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 0' }}>
        {nav.map(item => (
          <Link key={item.href} href={item.href} className={`kinetic-nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              {item.icon}
            </svg>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout / User switch bottom */}
      <div style={{ padding: '24px' }}>
        <button onClick={() => { logout(); router.push('/login'); }} className="k-btn" style={{ width: '100%', color: 'var(--ks-text-muted)', border: '1px solid var(--ks-border)' }}>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
