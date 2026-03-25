'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface Session { id: string; date: string; type: string; description?: string; team?: { name: string }; result?: object | null; }
interface Message { id: string; content: string; createdAt: string; sender: { firstName: string; lastName: string; role: string } }

export default function ClubFeedPage() {
  const { user } = useAuth();
  const params = useParams();
  const clubId = params.id as string;
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loadingPost, setLoadingPost] = useState(false);

  useEffect(() => {
    if (clubId) {
      apiFetch<Session[]>(`/api/sessions?clubId=${clubId}`).then(setSessions).catch(() => []);
      apiFetch<Message[]>(`/api/messages/club/${clubId}?type=POST`).then(m => setMessages(m.reverse())).catch(() => []);
      apiFetch<any[]>(`/api/events/club/${clubId}`).then(setEvents).catch(() => []);
    }
  }, [clubId]);

  const upcoming = sessions.filter(s => new Date(s.date) >= new Date()).slice(0, 3);

  const handlePost = async () => {
    if (!newPost.trim() || !clubId) return;
    setLoadingPost(true);
    try {
      const msg = await apiFetch<Message>(`/api/messages/club/${clubId}`, {
        method: 'POST', body: JSON.stringify({ content: newPost, type: 'POST' })
      });
      setMessages(prev => [msg, ...prev]);
      setNewPost('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPost(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
      {/* Main Feed Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Creator / Post input */}
        <div className="k-creator">
          <div style={{ display: 'flex', gap: 16 }}>
            <div className="k-avatar k-avatar-md"> {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''} </div>
            <div style={{ flex: 1 }}>
              <textarea rows={2} placeholder="Partagez une nouvelle, une info importante..." value={newPost} onChange={e => setNewPost(e.target.value)} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16, color: 'var(--ks-primary)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                </div>
                <button className="k-btn k-btn-primary" onClick={handlePost} disabled={loadingPost || !newPost.trim()}>{loadingPost ? '...' : 'Publier'}</button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        {messages.map(msg => (
          <div key={msg.id} className="k-post">
            <div className="k-post-header">
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="k-avatar k-avatar-md" style={{ background: msg.sender.role === 'COACH' ? 'var(--ks-primary)' : '#1e293b', color: 'white' }}>
                  {msg.sender.firstName[0]}{msg.sender.lastName[0]}
                </div>
                <div>
                  <div className="k-post-author">{msg.sender.firstName} {msg.sender.lastName}</div>
                  <div className="k-post-meta">{new Date(msg.createdAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</div>
                </div>
              </div>
              {msg.sender.role === 'COACH' && <span className="k-pill" style={{ background: '#fee2e2', color: '#b91c1c' }}>COACH</span>}
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--ks-text-muted)', padding: '40px 0', fontSize: 14 }}>
            Aucun message dans le club pour le moment.
          </div>
        )}

        {/* PROCHAINS DÉPARTS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
          <div className="k-widget" style={{ background: 'var(--ks-primary)', color: 'white', border: 'none' }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', opacity: 0.8, marginBottom: 8 }}>ÉVÉNEMENT DU CLUB</div>
            <div style={{ fontSize: 32, fontStyle: 'italic', fontWeight: 900, lineHeight: 1, marginBottom: 16 }}>GRAND PRIX<br/>KINETIC 2024</div>
            <p style={{ fontSize: 13, opacity: 0.9, lineHeight: 1.5, marginBottom: 24, maxWidth: 200 }}>
              Inscrivez-vous pour la compétition annuelle du club. 10 disciplines représentées.
            </p>
            <button className="k-btn" style={{ background: 'white', color: 'var(--ks-primary)', width: '100%' }}>S&apos;inscrire maintenant</button>
          </div>
          
          <div className="k-widget">
            <h3 className="k-widget-title" style={{ marginBottom: 16 }}>PROCHAINS DÉPARTS</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcoming.length > 0 ? upcoming.map(s => (
                <div key={s.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--ks-bg)', padding: '12px', borderRadius: 12 }}>
                  <div style={{ background: 'white', borderRadius: 8, padding: '4px', textAlign: 'center', minWidth: 44, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--ks-primary)' }}>{new Date(s.date).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}</div>
                    <div style={{ fontSize: 16, fontWeight: 900 }}>{new Date(s.date).getDate()}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{s.type}</div>
                    <div style={{ fontSize: 10, color: 'var(--ks-text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>18:30 • PISTE SUD</div>
                  </div>
                </div>
              )) : (
                <p style={{ fontSize: 13, color: 'var(--ks-text-muted)' }}>Aucune séance prévue.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Right Rail Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Événements */}
        <div className="k-widget">
          <h3 className="k-widget-title">ÉVÉNEMENTS À VENIR</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {events.slice(0, 3).map(e => (
              <div key={e.id} style={{ borderLeft: '3px solid var(--ks-primary)', paddingLeft: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--ks-primary)' }}>
                  {new Date(e.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }).toUpperCase()}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, margin: '2px 0' }}>{e.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ks-text-muted)' }}>📍 {e.location}</div>
              </div>
            ))}
            {events.length === 0 && <div style={{ fontSize: 13, color: 'var(--ks-text-muted)' }}>Aucun événement.</div>}
          </div>
        </div>

        {/* Tendances */}
        <div className="k-widget">
          <h3 className="k-widget-title">TENDANCES CLUB</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--ks-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>POPULAIRE MAINTENANT</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>#ObjectifMarathon2024</div>
              <div style={{ fontSize: 12, color: 'var(--ks-text-muted)' }}>42 athlètes y participent</div>
            </div>
            
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--ks-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>ÉQUIPEMENT</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Test des nouvelles Vaporfly</div>
              <div style={{ fontSize: 12, color: 'var(--ks-text-muted)' }}>12 nouveaux avis</div>
            </div>
            
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--ks-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>NUTRITION</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Recuperation post-sprint</div>
              <div style={{ fontSize: 12, color: 'var(--ks-text-muted)' }}>Discussion en cours</div>
            </div>
          </div>
        </div>

        {/* KMs widget */}
        <div className="k-widget" style={{ padding: '24px', background: 'linear-gradient(135deg, #f5f6f8, #e2e8f0)', border: 'none' }}>
          <div style={{ fontSize: 32, fontStyle: 'italic', fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>342</div>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ks-text-main)', marginBottom: 12 }}>KILOMÈTRES CETTE SEMAINE</div>
          
          <div style={{ height: 6, width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: '67%', height: '100%', background: 'var(--ks-primary)' }} />
          </div>
          <p style={{ fontSize: 10, color: 'var(--ks-text-muted)' }}>Le club a parcouru 67% de l&apos;objectif hebdomadaire</p>
        </div>

      </div>
    </div>
  );
}
