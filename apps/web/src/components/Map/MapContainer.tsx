import { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in production build
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapContainerProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    id: string;
    position: [number, number];
    title: string;
    description?: string;
    type?: 'device' | 'expert' | 'service-request' | 'default';
  }>;
  onMarkerClick?: (id: string) => void;
  onClick?: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

// Component to handle map events
function MapEvents({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (onClick) {
      const handleClick = (e: L.LeafletMouseEvent) => {
        onClick(e.latlng.lat, e.latlng.lng);
      };
      map.on('click', handleClick);
      return () => {
        map.off('click', handleClick);
      };
    }
  }, [map, onClick]);

  return null;
}

// Custom marker icons for different types
const getMarkerIcon = (type: string) => {
  const iconColors: Record<string, string> = {
    device: '#3b82f6', // blue
    expert: '#10b981', // green
    'service-request': '#ef4444', // red
    default: '#6b7280', // gray
  };

  const color = iconColors[type] || iconColors.default;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          color: white;
          font-size: 12px;
        ">
          ${type === 'device' ? '📦' : type === 'expert' ? '👨‍🔧' : type === 'service-request' ? '🛠' : '📍'}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

export function MapContainer({
  center,
  zoom = 13,
  markers = [],
  onMarkerClick,
  onClick,
  height = '400px',
  className = '',
}: MapContainerProps) {
  return (
    <div className={`rounded-lg overflow-hidden shadow-md ${className}`} style={{ height }}>
      <LeafletMap
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={getMarkerIcon(marker.type || 'default')}
            eventHandlers={{
              click: () => onMarkerClick?.(marker.id),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">{marker.title}</h3>
                {marker.description && (
                  <p className="text-xs text-gray-600">{marker.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        <MapEvents onClick={onClick} />
      </LeafletMap>
    </div>
  );
}
