import { useState } from 'react';
import { MapContainer } from '../../components/Map';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useNearbySearch, formatDistance } from '../../hooks/useNearbySearch';
import { MapPin, Navigation, Users, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NearbyExperts() {
  const { latitude, longitude, error: geoError, loading: geoLoading } = useGeolocation();
  const [radius, setRadius] = useState(50);
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);

  const { data, isLoading, error } = useNearbySearch({
    latitude: latitude || 0,
    longitude: longitude || 0,
    radius,
    type: 'experts',
    enabled: !!(latitude && longitude),
  });

  const markers = data?.items.map((item) => ({
    id: item.id,
    position: [item.latitude, item.longitude] as [number, number],
    title: item.name,
    description: `${formatDistance(item.distance)} - ${item.metadata?.professionalField || ''}`,
    type: 'expert' as const,
  })) || [];

  const handleMarkerClick = (id: string) => {
    setSelectedExpertId(id);
    const element = document.getElementById(`expert-${id}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-green-600" />
            附近的专家
          </h1>
          <p className="mt-2 text-gray-600">
            查找您附近的服务专家
          </p>
        </div>

        {/* Loading / Error States */}
        {geoLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-blue-800">正在获取您的位置...</p>
            </div>
          </div>
        )}

        {geoError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              无法获取位置: {geoError}
            </p>
            <p className="text-sm text-red-600 mt-1">
              请确保您已授予浏览器位置权限
            </p>
          </div>
        )}

        {/* Radius Control */}
        {latitude && longitude && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜索半径: {radius} 公里
            </label>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 km</span>
              <span>100 km</span>
              <span>200 km</span>
            </div>
          </div>
        )}

        {/* Map and Results */}
        {latitude && longitude && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                地图视图
              </h2>
              <MapContainer
                center={[latitude, longitude]}
                zoom={10}
                markers={markers}
                onMarkerClick={handleMarkerClick}
                height="600px"
              />
            </div>

            {/* Expert List */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                专家列表 ({data?.total || 0})
              </h2>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    正在加载专家...
                  </div>
                )}

                {error && (
                  <div className="text-center py-8 text-red-600">
                    加载失败，请稍后重试
                  </div>
                )}

                {data?.items.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    附近没有找到专家
                  </div>
                )}

                {data?.items.map((expert) => (
                  <div
                    key={expert.id}
                    id={`expert-${expert.id}`}
                    className={`border rounded-lg p-4 transition-all ${
                      selectedExpertId === expert.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {expert.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{formatDistance(expert.distance)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {expert.metadata?.workStatus || '可用'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {expert.metadata?.professionalField && (
                        <div className="flex items-center gap-2 text-sm">
                          <Wrench className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            {expert.metadata.professionalField}
                          </span>
                        </div>
                      )}

                      {expert.metadata?.yearsOfExperience && (
                        <p className="text-sm text-gray-600">
                          经验: {expert.metadata.yearsOfExperience} 年
                        </p>
                      )}

                      {expert.metadata?.expertTypes && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {expert.metadata.expertTypes.map((type: string) => (
                            <span
                              key={type}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        to={`/expert/profile/${expert.id}`}
                        className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors text-center"
                      >
                        查看详情
                      </Link>
                      {expert.metadata?.passportCode && (
                        <Link
                          to={`/scan/${expert.metadata.passportCode}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                        >
                          护照码
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
