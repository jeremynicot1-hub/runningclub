'use client';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ClubFeedPage() {
  const { user } = useAuth();
  const params = useParams();
  const id = params?.id as string;
  const [club, setClub] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    if (id) {
      apiFetch<any>(`/api/clubs/${id}`).then(setClub).catch(console.error);
      apiFetch<any[]>(`/api/chat/club/${id}?type=POST`).then(setPosts).catch(console.error);
    }
  }, [id]);

  const handlePost = async () => {
    if (!postContent.trim()) return;
    try {
      await apiFetch(`/api/chat/club/${id}`, {
        method: 'POST',
        body: JSON.stringify({ content: postContent.trim(), type: 'POST' })
      });
      setPostContent('');
      const newPosts = await apiFetch<any[]>(`/api/chat/club/${id}?type=POST`);
      setPosts(newPosts);
    } catch (err) {
      console.error(err);
    }
  };

  if (!club) return null;

  return (
    <div style={{ padding: '32px 40px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: 32, maxWidth: 1400, margin: '0 auto' }}>
        
        {/* Left: Club Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="k-widget" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Momentum du Club</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{club.members?.length || 0}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ks-text-muted)' }}>ATHLÈTES ACTIFS</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>1240 km</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ks-text-muted)' }}>PARCOURUS CETTE SEMAINE</div>
              </div>
              <div style={{ paddingTop: 16, borderTop: '1px solid var(--ks-border-light)' }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>Spécialités</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {club.sports?.map((s: string) => (
                    <span key={s} style={{ fontSize: 10, fontWeight: 900, padding: '4px 8px', background: 'var(--ks-bg)', borderRadius: 6 }}>{s.toUpperCase()}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="k-widget" style={{ padding: 24, background: 'var(--ks-black-card)', color: 'white', border: 'none' }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', opacity: 0.8, marginBottom: 12 }}>Performance Exclusive</h3>
            <p style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.9 }}>Votre club maintient une cadence impressionnante. Les séances de cette semaine visent à optimiser votre VMA.</p>
          </div>
        </div>

        {/* Center: Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Post Creator */}
          <div className="k-widget" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div className="k-avatar k-avatar-md" style={{ background: club.primaryColor }}>{user?.firstName?.[0]}</div>
              <textarea 
                placeholder={`Partagez une nouvelle avec le club ${club.name}...`} 
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'var(--ks-bg)', borderRadius: 12, padding: 12, fontSize: 14, resize: 'none', height: 80, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handlePost} className="k-btn k-btn-primary" style={{ padding: '8px 24px', borderRadius: 20 }}>Publier</button>
            </div>
          </div>

          {/* Posts */}
          {[...posts].reverse().map(post => (
            <div key={post.id} className="k-widget" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="k-avatar" style={{ width: 40, height: 40, background: club.primaryColor }}>{post.sender.firstName[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{post.sender.firstName} {post.sender.lastName}</div>
                    <div style={{ fontSize: 11, color: 'var(--ks-text-muted)' }}>{new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.6 }}>{post.content}</p>
            </div>
          ))}

          {posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
              <p style={{ fontWeight: 700 }}>Aucune publication pour le moment.</p>
            </div>
          )}
        </div>

        {/* Right: Sessions & Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Weekly Sessions */}
          <div className="k-widget" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, marginBottom: 20 }}>Séances de la Semaine</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {club.sessions?.map((s: any) => (
                <div key={s.id} style={{ padding: '0 0 0 12px', borderLeft: `3px solid ${club.primaryColor}` }}>
                  <div style={{ fontSize: 13, fontWeight: 900, marginBottom: 4 }}>{s.type}</div>
                  <div style={{ fontSize: 11, color: 'var(--ks-text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' }}>
                    {new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })} • {s.duration} MIN
                  </div>
                  <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--ks-text-main)', fontStyle: 'italic', background: 'var(--ks-bg)', padding: '8px 12px', borderRadius: 8 }}>
                    {s.description}
                  </p>
                </div>
              ))}
              {(!club.sessions || club.sessions.length === 0) && <p style={{ fontSize: 12, color: 'var(--ks-text-muted)' }}>Aucune séance prévue.</p>}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="k-widget" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, marginBottom: 20 }}>Événements à venir</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {club.events?.map((e: any) => (
                <div key={e.id} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, background: 'var(--ks-bg)', border: '1px solid var(--ks-border)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 8, fontWeight: 800, color: club.primaryColor }}>
                      {new Date(e.date).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 900 }}>
                      {new Date(e.date).getDate()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{e.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ks-text-light)', marginTop: 2 }}>📍 {e.location}</div>
                  </div>
                </div>
              ))}
              {(!club.events || club.events.length === 0) && <p style={{ fontSize: 12, color: 'var(--ks-text-muted)' }}>Aucun événement prévu.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
