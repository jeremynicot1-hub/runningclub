'use client';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function ClubCalendarPage() {
  const { user } = useAuth();
  const params = useParams();
  const clubId = params.id as string;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newSession, setNewSession] = useState({ type: 'Course', description: '', duration: 60, targetDistance: 10 });
  const [loading, setLoading] = useState(false);

  const fetchSessions = () => {
    apiFetch<any[]>(`/api/sessions?clubId=${clubId}`).then(setSessions).catch(console.error);
  };

  useEffect(() => {
    fetchSessions();
  }, [clubId]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Adjust for Monday start (JS 0=Sun, so 1=Mon... 0 becomes 6)
  const offset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDayClick = (day: number) => {
    if (user?.role === 'COACH') {
      setSelectedDay(day);
      setShowModal(true);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;
    setLoading(true);
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
    try {
      await apiFetch('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ ...newSession, date: date.toISOString(), clubId })
      });
      fetchSessions();
      setShowModal(false);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>Calendrier des entraînements</h1>
          <p style={{ color: 'var(--ks-text-muted)', fontSize: 14 }}>Planifiez et consultez les séances du club.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="k-btn" onClick={prevMonth} style={{ background: 'white', border: '1px solid var(--ks-border)' }}>←</button>
          <div style={{ fontWeight: 800, fontSize: 16, minWidth: 140, textAlign: 'center' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <button className="k-btn" onClick={nextMonth} style={{ background: 'white', border: '1px solid var(--ks-border)' }}>→</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 20, boxShadow: 'var(--ks-shadow)', overflow: 'hidden', border: '1px solid var(--ks-border)' }}>
        {/* Days of week header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--ks-bg)', borderBottom: '1px solid var(--ks-border)' }}>
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
            <div key={d} style={{ padding: '12px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--ks-text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} style={{ height: 120, borderRight: '1px solid var(--ks-border-light)', borderBottom: '1px solid var(--ks-border-light)', background: '#fafafa' }} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
            const daySessions = sessions.filter(s => {
              const d = new Date(s.date);
              return d.getDate() === day && d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
            });

            return (
              <div 
                key={day} 
                onClick={() => handleDayClick(day)}
                style={{ 
                  height: 120, borderRight: '1px solid var(--ks-border-light)', borderBottom: '1px solid var(--ks-border-light)',
                  padding: 10, cursor: user?.role === 'COACH' ? 'pointer' : 'default', transition: 'background 0.2s',
                  background: isToday ? 'rgba(255, 90, 31, 0.03)' : 'white'
                }}
                className={user?.role === 'COACH' ? 'hover-bg-ks-light' : ''}
              >
                <div style={{ fontSize: 13, fontWeight: isToday ? 900 : 600, color: isToday ? 'var(--ks-primary)' : 'inherit', marginBottom: 8 }}>
                  {day}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {daySessions.map(s => (
                    <div key={s.id} style={{ 
                      fontSize: 10, padding: '4px 8px', borderRadius: 4, 
                      background: s.type === 'Sprint' ? '#fee2e2' : '#e0e7ff',
                      color: s.type === 'Sprint' ? '#991b1b' : '#3730a3',
                      fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      🏃 {s.description || s.type}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Session Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="k-widget" style={{ width: 400, padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, marginBottom: 20 }}>Programmer une séance - {selectedDay} {monthNames[currentDate.getMonth()]}</h2>
            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Type de séance</label>
                <select 
                  value={newSession.type} 
                  onChange={e => setNewSession(s => ({ ...s, type: e.target.value }))}
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--ks-border)' }}
                >
                  <option value="Sprint">Sprint / VMA</option>
                  <option value="Seuil">Seuil</option>
                  <option value="Fond">Endurance Fondamentale</option>
                  <option value="Course">Course Libre</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Description / Consignes</label>
                <textarea 
                  value={newSession.description}
                  onChange={e => setNewSession(s => ({ ...s, description: e.target.value }))}
                  placeholder="Ex: 5x1000m repos 2min..."
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--ks-border)', minHeight: 80 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Durée (min)</label>
                  <input type="number" value={newSession.duration} onChange={e => setNewSession(f => ({ ...f, duration: parseInt(e.target.value) }))} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--ks-border)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Distance (km)</label>
                  <input type="number" step="0.1" value={newSession.targetDistance} onChange={e => setNewSession(f => ({ ...f, targetDistance: parseFloat(e.target.value) }))} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--ks-border)' }} />
                </div>
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
