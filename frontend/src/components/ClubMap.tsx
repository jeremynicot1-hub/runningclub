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
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <BoundsHandler clubs={clubs} onBoundsChange={onBoundsChange} />

        {clubs.map(p => {
          if (!p.lat || !p.lng) return null;
          
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div style="
                background-color: ${p.primaryColor || '#FF5A1F'};
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 4px 6px rgba(0,0,0,0.2);
              ">
                <div style="
                  transform: rotate(45deg);
                  color: white;
                  font-weight: 900;
                  font-size: 14px;
                ">${p.name[0]}</div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
          });

          return (
            <Marker 
              key={p.id} 
              position={[p.lat, p.lng]} 
              icon={customIcon} 
            >
              <Popup className="kinetic-popup">
                <div style={{ padding: 4, minWidth: 160 }}>
                  <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 16, marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>📍 {p.city}</div>
                  <button 
                    onClick={() => onSelect?.(p)}
                    style={{ 
                      fontSize: 12, color: 'white', background: p.primaryColor || 'var(--ks-primary)', border: 'none', 
                      fontWeight: 800, marginTop: 14, display: 'block', padding: '10px 14px', borderRadius: 10, cursor: 'pointer', width: '100%',
                      boxShadow: `0 4px 12px ${p.primaryColor}44`
                    }}
                  >
                    Voir le club
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
