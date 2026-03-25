'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function ClubEventsPage() {
  const { user } = useAuth();
  const params = useParams();
  const clubId = params.id as string;
  const [events, setEvents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', date: '', location: '' });
  const [loading, setLoading] = useState(false);

  const fetchEvents = () => {
    apiFetch<any[]>(`/api/events/club/${clubId}`).then(setEvents).catch(console.error);
  };

  useEffect(() => {
    fetchEvents();
  }, [clubId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/api/events', {
        method: 'POST',
        body: JSON.stringify({ ...newEvent, clubId })
      });
      fetchEvents();
      setShowModal(false);
      setNewEvent({ name: '', date: '', location: '' });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Événements du club</h1>
          <p style={{ color: 'var(--ks-text-muted)', fontSize: 14 }}>Compétitions, sorties sociales et rassemblements.</p>
        </div>
        {user?.role === 'COACH' && (
          <button className="k-btn k-btn-primary" onClick={() => setShowModal(true)}>+ Créer un événement</button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {events.length === 0 && (
          <div className="k-widget" style={{ padding: 40, textAlign: 'center', color: 'var(--ks-text-muted)' }}>
            Aucun événement prévu pour le moment.
          </div>
        )}
        {events.map(event => (
          <div key={event.id} className="k-card hover-lift" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ background: 'var(--ks-bg)', padding: '10px 16px', borderRadius: 12, textAlign: 'center', minWidth: 70 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ks-primary)', textTransform: 'uppercase' }}>
                  {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>{new Date(event.date).getDate()}</div>
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{event.name}</h3>
                <div style={{ fontSize: 13, color: 'var(--ks-text-muted)', marginTop: 4 }}>
                  📍 {event.location || 'Lieu à définir'} • {new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <button className="k-btn" style={{ background: 'var(--ks-bg)', fontSize: 12, fontWeight: 700 }}>Je participe</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="k-widget" style={{ width: 400, padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Nouvel événement</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Nom de l&apos;événement</label>
                <input required type="text" value={newEvent.name} onChange={e => setNewEvent(v => ({ ...v, name: e.target.value }))} placeholder="Ex: Corrida de Noël" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--ks-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Date et Heure</label>
                <input required type="datetime-local" value={newEvent.date} onChange={e => setNewEvent(v => ({ ...v, date: e.target.value }))} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--ks-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Lieu</label>
                <input type="text" value={newEvent.location} onChange={e => setNewEvent(v => ({ ...v, location: e.target.value }))} placeholder="Ex: Centre ville" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--ks-border)' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="k-btn" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Annuler</button>
                <button type="submit" className="k-btn k-btn-primary" disabled={loading} style={{ flex: 1 }}>{loading ? 'Création...' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
