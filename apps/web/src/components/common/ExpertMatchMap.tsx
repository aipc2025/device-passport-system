import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'expert' | 'request';
  label: string;
  status?: string;
  score?: number;
  onClick?: () => void;
}

interface ExpertMatchMapProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  selectedMarkerId?: string;
}

// Custom icons for different marker types
const createIcon = (type: 'expert' | 'request', status?: string, isSelected?: boolean) => {
  const colors = {
    expert: {
      RUSHING: '#EF4444', // red
      IDLE: '#22C55E', // green
      BOOKED: '#3B82F6', // blue
      IN_SERVICE: '#8B5CF6', // purple
      OFF_DUTY: '#6B7280', // gray
      default: '#22C55E',
    },
    request: {
      URGENT: '#EF4444',
      HIGH: '#F97316',
      NORMAL: '#3B82F6',
      LOW: '#22C55E',
      default: '#3B82F6',
    },
  };

  const color = type === 'expert'
    ? colors.expert[status as keyof typeof colors.expert] || colors.expert.default
    : colors.request[status as keyof typeof colors.request] || colors.request.default;

  const size = isSelected ? 40 : 30;
  const borderWidth = isSelected ? 4 : 2;

  const svg = type === 'expert'
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="${borderWidth / 10}">
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 1 0-16 0" />
      </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="${borderWidth / 10}">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>`;

  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;filter:drop-shadow(2px 2px 2px rgba(0,0,0,0.3));">${svg}</div>`,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

export default function ExpertMatchMap({
  markers,
  center,
  zoom = 10,
  height = '400px',
  onMarkerClick,
  selectedMarkerId,
}: ExpertMatchMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Calculate center from markers if not provided
  const mapCenter = useMemo(() => {
    if (center) return center;
    if (markers.length === 0) return { lat: 21.0285, lng: 105.8542 }; // Default: Hanoi

    const validMarkers = markers.filter(m => m.lat && m.lng);
    if (validMarkers.length === 0) return { lat: 21.0285, lng: 105.8542 };

    const sumLat = validMarkers.reduce((sum, m) => sum + m.lat, 0);
    const sumLng = validMarkers.reduce((sum, m) => sum + m.lng, 0);
    return {
      lat: sumLat / validMarkers.length,
      lng: sumLng / validMarkers.length,
    };
  }, [center, markers]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([mapCenter.lat, mapCenter.lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center when it changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([mapCenter.lat, mapCenter.lng], zoom);
    }
  }, [mapCenter, zoom]);

  // Update markers when they change
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    markers.forEach((marker) => {
      if (!marker.lat || !marker.lng) return;

      const isSelected = marker.id === selectedMarkerId;
      const icon = createIcon(marker.type, marker.status, isSelected);

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
        .addTo(markersLayerRef.current!);

      // Create popup content
      const popupContent = `
        <div class="p-2 min-w-[150px]">
          <div class="font-semibold text-sm mb-1">${marker.label}</div>
          ${marker.status ? `<div class="text-xs text-gray-500">${marker.status}</div>` : ''}
          ${marker.score !== undefined ? `<div class="text-xs text-blue-600 font-medium">Score: ${marker.score}</div>` : ''}
        </div>
      `;

      leafletMarker.bindPopup(popupContent);

      leafletMarker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(marker);
        }
        if (marker.onClick) {
          marker.onClick();
        }
      });
    });

    // Fit bounds if we have markers
    const validMarkers = markers.filter(m => m.lat && m.lng);
    if (validMarkers.length > 1) {
      const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, selectedMarkerId, onMarkerClick]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200">
      <div ref={mapRef} style={{ height }} className="w-full" />

      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-white rounded-lg shadow-md p-2 text-xs z-[1000]">
        <div className="font-medium mb-1">Legend</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>RUSHING Expert</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>Available Expert</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>Service Request</span>
          </div>
        </div>
      </div>
    </div>
  );
}
