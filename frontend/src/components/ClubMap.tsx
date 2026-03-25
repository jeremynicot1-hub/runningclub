'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix for icon issues in Leaflet
const icon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Club {
  id: string;
  name: string;
  city: string;
  address: string;
  logo?: string;
  primaryColor?: string;
}

export default function ClubMap({ clubs, onSelect }: { clubs: Club[], onSelect?: (club: Club) => void }) {
  const [points, setPoints] = useState<any[]>([]);

  useEffect(() => {
    const newPoints = clubs.map((c, i) => {
      const lat = 45.75 + (Math.random() - 0.5) * 0.15;
      const lng = 4.85 + (Math.random() - 0.5) * 0.15;
      return { ...c, lat, lng };
    });
    setPoints(newPoints);
  }, [clubs]);

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--ks-shadow)' }}>
      <MapContainer center={[45.76, 4.83]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {points.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={icon} eventHandlers={{ click: () => onSelect?.(p) }}>
            <Popup>
              <div style={{ padding: 4 }}>
                <div style={{ fontWeight: 800, color: p.primaryColor || 'var(--ks-primary)' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#666' }}>📍 {p.address || p.city}</div>
                <button 
                  onClick={() => onSelect?.(p)}
                  style={{ 
                    fontSize: 11, color: 'white', background: 'var(--ks-primary)', border: 'none', 
                    fontWeight: 700, marginTop: 8, display: 'block', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' 
                  }}
                >
                  Voir détails
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
