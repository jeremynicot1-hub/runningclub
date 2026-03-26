'use client';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Topbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  
  if (!user) return null;

  const topNav = [
    { name: 'Mon Flux', href: '/dashboard' },
    { name: 'Explorer', href: '/dashboard/clubs' },
    { name: 'Performance', href: '/dashboard/performance' },
  ];

  return (
    <div className="kinetic-topbar">
      <div className="kinetic-logo-main" style={{ fontSize: 24, fontStyle: 'normal', letterSpacing: '-0.03em' }}>
        Velocity<span style={{ color: 'var(--ks-text-main)', opacity: 0.7 }}>Social</span>
      </div>
      
      <div className="kinetic-search" style={{ marginLeft: 40 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Rechercher des athlètes, clubs et événements..." />
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginRight: 40 }}>
        {topNav.map(item => (
          <Link 
            key={item.href} 
            href={item.href} 
            style={{ 
              textDecoration: 'none', 
              fontSize: 14, 
              fontWeight: 700, 
              color: pathname === item.href ? 'var(--ks-primary)' : 'var(--ks-text-muted)' 
            }}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', color: 'var(--ks-text-muted)' }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>
    </div>
  );
}
