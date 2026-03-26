import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// FIX: Leaflet icons (known issue with Next.js)
const icon = L.icon({
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
  lat?: number;
  lng?: number;
}

// Child component to handle map events and report visible markers
function BoundsHandler({ clubs, onBoundsChange }: { clubs: Club[], onBoundsChange?: (ids: string[]) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onBoundsChange) return;

    const updateVisible = () => {
      const bounds = map.getBounds();
      const visible = clubs
        .filter(c => {
          if (typeof c.lat !== 'number' || typeof c.lng !== 'number') return false;
          return bounds.contains([c.lat, c.lng]);
        })
        .map(c => c.id);
      
      onBoundsChange(visible);
    };

    map.on('moveend', updateVisible);
    // Initial sync and sync on clubs update
    updateVisible();

    return () => {
      map.off('moveend', updateVisible);
    };
  }, [map, clubs, onBoundsChange]);

  return null;
}

export default function ClubMap({ 
  clubs, 
  onSelect, 
  onBoundsChange 
}: { 
  clubs: Club[], 
  onSelect?: (club: Club) => void,
  onBoundsChange?: (visibleIds: string[]) => void
}) {
  const center: [number, number] = [46.2276, 2.2137]; // Centre de France

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={6} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <BoundsHandler clubs={clubs} onBoundsChange={onBoundsChange} />

        {clubs.map(p => {
          if (!p.lat || !p.lng) return null;
          return (
            <Marker 
              key={p.id} 
              position={[p.lat, p.lng]} 
              icon={icon} 
            >
              <Popup>
                <div style={{ padding: 4, minWidth: 150 }}>
                  <div style={{ fontWeight: 800, color: p.primaryColor || 'var(--ks-primary)', fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>📍 {p.city}</div>
                  <button 
                    onClick={() => onSelect?.(p)}
                    style={{ 
                      fontSize: 11, color: 'white', background: 'var(--ks-primary)', border: 'none', 
                      fontWeight: 700, marginTop: 10, display: 'block', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', width: '100%' 
                    }}
                  >
                    Voir détails
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
