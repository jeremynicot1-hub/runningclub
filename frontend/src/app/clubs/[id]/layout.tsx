'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

import { apiFetch } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (id) {
      apiFetch<any>(`/api/clubs/${id}`).then((c) => {
        if (c?.primaryColor) {
          document.documentElement.style.setProperty('--ks-primary', c.primaryColor);
        }
      }).catch(console.error);
    }
  }, [user, loading, router, id]);

  if (loading || !user) return null;

  return (
    <div className="kinetic-app">
      <Sidebar clubId={id} />
      <div className="kinetic-main">
        <Topbar />
        <div className="kinetic-content">
          <main className="kinetic-grid">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
