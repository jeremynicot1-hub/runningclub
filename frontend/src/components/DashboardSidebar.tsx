'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClubOpen, setIsClubOpen] = useState(true);

  if (!user) return null;

  const userClubs = (user as any).clubs || [];

  const navItems = [
    { name: 'Tableau de bord', href: '/dashboard', icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
    )},
    { name: 'Messages', href: '/dashboard/messages', icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    )},
  ];

  return (
    <aside className="kinetic-sidebar">
      <div className="kinetic-logo">
        <div>
          <div className="kinetic-logo-main" style={{ fontSize: 20, color: '#1a1a1b' }}>Portail Athlète</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ks-text-muted)', marginTop: 2 }}>Performance Élite</div>
        </div>
      </div>
      
      <nav style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
        <div style={{ padding: '0 0 16px 0' }}>
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={`kinetic-nav-item ${pathname === item.href ? 'active' : ''}`}
            >
              {item.icon(pathname === item.href)}
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        <div className="kinetic-nav-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Vos Clubs</span>
          <svg 
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" 
            style={{ cursor: 'pointer', transition: 'transform 0.3s', transform: isClubOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            onClick={() => setIsClubOpen(!isClubOpen)}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
        
        <div style={{ 
          display: 'grid',
          gridTemplateRows: isClubOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.3s ease',
          overflow: 'hidden'
        }}>
          <div style={{ minHeight: 0 }}>
            {userClubs.map((club: any) => (
              <Link 
                key={club.id} 
                href={`/clubs/${club.id}/feed`} 
                className={`kinetic-nav-item ${pathname.includes(`/clubs/${club.id}`) ? 'active' : ''}`}
                style={{ paddingLeft: 32 }}
              >
                <div style={{ 
                  width: 24, height: 24, borderRadius: 6, 
                  background: club.primaryColor || 'var(--ks-primary-light)', 
                  color: club.primaryColor ? '#fff' : 'var(--ks-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 900
                }}>
                  {club.name[0]}
                </div>
                <span style={{ fontSize: 13 }}>{club.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div style={{ padding: '16px 20px 32px' }}>
        <Link 
          href="/dashboard/clubs" 
          className="k-btn k-btn-primary" 
          style={{ width: '100%', borderRadius: 12, padding: '14px 0', marginBottom: 24, gap: 10 }}
        >
          <span style={{ fontSize: 20, fontWeight: 400 }}>+</span>
          Ajouter un club
        </Link>

        <Link 
          href="/dashboard/settings" 
          className="kinetic-nav-item" 
          style={{ padding: '10px 4px', color: 'var(--ks-text-muted)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 18, height: 18 }}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span style={{ fontSize: 13 }}>Paramètres</span>
        </Link>

        <Link 
          href="/dashboard/support" 
          className="kinetic-nav-item" 
          style={{ padding: '10px 4px', color: 'var(--ks-text-muted)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 18, height: 18 }}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style={{ fontSize: 13 }}>Support Technique</span>
        </Link>
      </div>
    </aside>
  );
}
