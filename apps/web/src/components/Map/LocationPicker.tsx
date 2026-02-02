import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPickerProps {
  initialPosition?: [number, number];
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  height?: string;
  showAddressSearch?: boolean;
}

// Component to handle map clicks
function LocationMarker({
  position,
  setPosition,
}: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export function LocationPicker({
  initialPosition,
  onLocationSelect,
  height = '400px',
  showAddressSearch = true,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialPosition || null
  );
  const [address, setAddress] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Default center (Beijing, China)
  const defaultCenter: [number, number] = [39.9042, 116.4074];
  const center = position || initialPosition || defaultCenter;

  useEffect(() => {
    if (position) {
      onLocationSelect(position[0], position[1], address);
      // Reverse geocoding to get address (using Nominatim OSM)
      fetchAddress(position[0], position[1]);
    }
  }, [position]);

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=zh-CN`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Failed to fetch address:', error);
    }
  };

  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition: [number, number] = [
            pos.coords.latitude,
            pos.coords.longitude,
          ];
          setPosition(newPosition);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
          alert('无法获取当前位置，请检查位置权限设置');
        }
      );
    } else {
      setIsLoadingLocation(false);
      alert('您的浏览器不支持地理定位');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&accept-language=zh-CN&limit=1`
      );
      const data = await response.json();
      if (data.length > 0) {
        const newPosition: [number, number] = [
          parseFloat(data[0].lat),
          parseFloat(data[0].lon),
        ];
        setPosition(newPosition);
        setAddress(data[0].display_name);
      } else {
        alert('未找到该地址');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('地址搜索失败');
    }
  };

  return (
    <div className="space-y-3">
      {showAddressSearch && (
        <div className="space-y-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="搜索地址..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              搜索
            </button>
          </form>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            <Navigation className="w-4 h-4" />
            {isLoadingLocation ? '定位中...' : '使用当前位置'}
          </button>
        </div>
      )}

      <div className="rounded-lg overflow-hidden shadow-md" style={{ height }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      {position && (
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                坐标: {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </p>
              {address && (
                <p className="text-xs text-gray-600 mt-1 break-words">{address}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        💡 点击地图选择位置，或使用上方搜索框查找地址
      </p>
    </div>
  );
}
