import { useState, useEffect, useCallback } from 'react';
import { MapPin, X, Search } from 'lucide-react';

interface MapPickerProps {
  value?: { lat: number; lng: number; address?: string };
  onChange: (location: { lat: number; lng: number; address?: string } | undefined) => void;
  placeholder?: string;
}

export default function MapPicker({ value, onChange, placeholder }: MapPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempLocation, setTempLocation] = useState(value);
  const [mapCenter, setMapCenter] = useState({ lat: 21.0285, lng: 105.8542 }); // Default: Hanoi
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (value) {
      setTempLocation(value);
      setMapCenter({ lat: value.lat, lng: value.lng });
    }
  }, [value]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newLocation = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name,
        };
        setTempLocation(newLocation);
        setMapCenter({ lat: newLocation.lat, lng: newLocation.lng });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Simple calculation for demonstration
    // In a real app, you'd use a proper map library
    const mapWidth = rect.width;
    const mapHeight = rect.height;

    // Assuming zoom level 12, approximately 0.1 degrees per 100 pixels
    const degPerPixel = 0.002;
    const lat = mapCenter.lat - (y - mapHeight / 2) * degPerPixel;
    const lng = mapCenter.lng + (x - mapWidth / 2) * degPerPixel;

    setTempLocation({ lat, lng });
  }, [mapCenter]);

  const handleConfirm = () => {
    onChange(tempLocation);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(undefined);
    setTempLocation(undefined);
  };

  const displayValue = value
    ? value.address || `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`
    : '';

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            className="input pr-10"
            placeholder={placeholder || 'Click to select location on map'}
            value={displayValue}
            readOnly
            onClick={() => setIsOpen(true)}
          />
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
        {value && (
          <button
            type="button"
            className="btn-secondary px-3"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Select Location</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Search location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  type="button"
                  className="btn-primary px-4"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {/* Map Container */}
              <div
                className="relative h-80 bg-gray-100 rounded-lg overflow-hidden cursor-crosshair"
                onClick={handleMapClick}
              >
                <iframe
                  title="Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  style={{ pointerEvents: 'none' }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.05}%2C${mapCenter.lat - 0.03}%2C${mapCenter.lng + 0.05}%2C${mapCenter.lat + 0.03}&layer=mapnik&marker=${tempLocation ? `${tempLocation.lat}%2C${tempLocation.lng}` : ''}`}
                />
                {tempLocation && (
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none"
                    style={{
                      top: `${50 - (tempLocation.lat - mapCenter.lat) / 0.0012}%`,
                      left: `${50 + (tempLocation.lng - mapCenter.lng) / 0.002}%`,
                    }}
                  >
                    <MapPin className="h-8 w-8 text-red-500 drop-shadow-lg" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs text-gray-600">
                  Click to select location
                </div>
              </div>

              {/* Coordinates */}
              {tempLocation && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Latitude</label>
                    <input
                      type="number"
                      className="input"
                      value={tempLocation.lat}
                      onChange={(e) => setTempLocation({ ...tempLocation, lat: parseFloat(e.target.value) })}
                      step="0.000001"
                    />
                  </div>
                  <div>
                    <label className="label">Longitude</label>
                    <input
                      type="number"
                      className="input"
                      value={tempLocation.lng}
                      onChange={(e) => setTempLocation({ ...tempLocation, lng: parseFloat(e.target.value) })}
                      step="0.000001"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleConfirm}
                disabled={!tempLocation}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
