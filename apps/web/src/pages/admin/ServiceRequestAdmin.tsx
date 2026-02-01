import { useState, useMemo, lazy, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Users,
  Send,
  Zap,
  ChevronDown,
  ChevronUp,
  MapPin,
  Star,
  CheckCircle,
  X,
  RefreshCw,
  Map,
  List,
} from 'lucide-react';
import { expertApi } from '../../services/api';
import { format } from 'date-fns';
import clsx from 'clsx';

// Lazy load map component to avoid SSR issues
const ExpertMatchMap = lazy(() => import('../../components/common/ExpertMatchMap'));

interface ServiceRequest {
  id: string;
  requestCode: string;
  title: string;
  description: string;
  serviceType: string;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: string;
  serviceLocation?: string;
  locationLat?: number;
  locationLng?: number;
  requiredSkills: string[];
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency?: string;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
  };
  viewCount: number;
  applicationCount: number;
}

interface Expert {
  id: string;
  expertCode: string;
  personalName: string;
  professionalField: string;
  skillTags: string[];
  avgRating: number;
  totalReviews: number;
  workStatus: string;
  membershipLevel: string;
  currentLocation?: string;
  locationLat?: number;
  locationLng?: number;
}

interface SearchResult {
  expert: Expert;
  score: number;
  scoreBreakdown: Record<string, number>;
  distanceKm: number | null;
  hasExistingMatch: boolean;
}

const urgencyConfig: Record<string, { color: string; label: string }> = {
  LOW: { color: 'bg-green-100 text-green-800', label: 'Low' },
  NORMAL: { color: 'bg-blue-100 text-blue-800', label: 'Normal' },
  HIGH: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  URGENT: { color: 'bg-red-100 text-red-800', label: 'Urgent' },
};

const workStatusConfig: Record<string, { color: string; label: string; icon: string }> = {
  RUSHING: { color: 'bg-red-100 text-red-700', label: 'Rushing', icon: '🔥' },
  IDLE: { color: 'bg-green-100 text-green-700', label: 'Idle', icon: '✓' },
  BOOKED: { color: 'bg-blue-100 text-blue-700', label: 'Booked', icon: '📋' },
  IN_SERVICE: { color: 'bg-purple-100 text-purple-700', label: 'In Service', icon: '🔧' },
  OFF_DUTY: { color: 'bg-gray-100 text-gray-700', label: 'Off Duty', icon: '💤' },
};

export default function ServiceRequestAdmin() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('OPEN');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [expertSearchKeyword, setExpertSearchKeyword] = useState('');
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);
  const [showPushModal, setShowPushModal] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedMapMarkerId, setSelectedMapMarkerId] = useState<string | null>(null);

  // Fetch all service requests
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['admin-service-requests', searchTerm],
    queryFn: () => expertApi.getPublicServiceRequests({
      search: searchTerm,
    }),
  });

  // Fetch RUSHING experts
  const { data: rushingExperts } = useQuery({
    queryKey: ['rushing-experts'],
    queryFn: () => expertApi.getRushingExperts(),
  });

  // Search experts for a request
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['expert-search', currentRequestId, expertSearchKeyword],
    queryFn: () => currentRequestId ? expertApi.searchExpertsForRequest(currentRequestId, {
      keyword: expertSearchKeyword,
      limit: 30,
    }) : null,
    enabled: !!currentRequestId && showPushModal,
  });

  // Push to experts mutation
  const pushMutation = useMutation({
    mutationFn: ({ requestId, expertIds }: { requestId: string; expertIds: string[] }) =>
      expertApi.pushToExperts(requestId, expertIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['expert-search'] });
      setShowPushModal(false);
      setSelectedExperts([]);
      setCurrentRequestId(null);
    },
  });

  // Auto-match RUSHING mutation
  const autoMatchMutation = useMutation({
    mutationFn: (requestId?: string) => expertApi.triggerAutoMatchRushing(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-requests'] });
    },
  });

  // Run matching mutation
  const runMatchingMutation = useMutation({
    mutationFn: (requestId: string) => expertApi.runMatchingForRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-service-requests'] });
    },
  });

  const handleOpenPushModal = (requestId: string) => {
    setCurrentRequestId(requestId);
    setShowPushModal(true);
    setSelectedExperts([]);
    setExpertSearchKeyword('');
  };

  const handleToggleExpert = (expertId: string) => {
    setSelectedExperts(prev =>
      prev.includes(expertId)
        ? prev.filter(id => id !== expertId)
        : [...prev, expertId]
    );
  };

  const handlePush = () => {
    if (currentRequestId && selectedExperts.length > 0) {
      pushMutation.mutate({ requestId: currentRequestId, expertIds: selectedExperts });
    }
  };

  // Filter requests
  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    return requests.filter((req: ServiceRequest) => {
      if (selectedStatus && req.status !== selectedStatus) return false;
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          req.title.toLowerCase().includes(search) ||
          req.requestCode.toLowerCase().includes(search) ||
          req.description?.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [requests, searchTerm, selectedStatus]);

  // Generate map markers from requests and rushing experts
  const mapMarkers = useMemo(() => {
    const markers: Array<{
      id: string;
      lat: number;
      lng: number;
      type: 'expert' | 'request';
      label: string;
      status?: string;
      score?: number;
    }> = [];

    // Add service request markers
    filteredRequests.forEach((req: ServiceRequest) => {
      if (req.locationLat && req.locationLng) {
        markers.push({
          id: `req-${req.id}`,
          lat: req.locationLat,
          lng: req.locationLng,
          type: 'request',
          label: req.title,
          status: req.urgency,
        });
      }
    });

    // Add RUSHING expert markers
    if (rushingExperts) {
      rushingExperts.forEach((expert: Expert) => {
        if (expert.locationLat && expert.locationLng) {
          markers.push({
            id: `exp-${expert.id}`,
            lat: expert.locationLat,
            lng: expert.locationLng,
            type: 'expert',
            label: expert.personalName,
            status: expert.workStatus,
            score: expert.avgRating ? Number(expert.avgRating) : undefined,
          });
        }
      });
    }

    return markers;
  }, [filteredRequests, rushingExperts]);

  const handleMapMarkerClick = (marker: { id: string; type: 'expert' | 'request' }) => {
    setSelectedMapMarkerId(marker.id);
    if (marker.type === 'request') {
      const reqId = marker.id.replace('req-', '');
      setExpandedRequestId(reqId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t('admin.serviceRequests', 'Service Requests')}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {t('admin.serviceRequestsDesc', 'Manage service requests and push to experts')}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => autoMatchMutation.mutate(undefined)}
            disabled={autoMatchMutation.isPending}
            className="btn btn-secondary flex items-center gap-1 sm:gap-2 text-sm sm:text-base px-3 sm:px-4"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">{t('admin.autoMatchRushing', 'Auto-Match RUSHING')}</span>
            <span className="sm:hidden">Auto-Match</span>
          </button>
        </div>
      </div>

      {/* RUSHING Experts Summary */}
      {rushingExperts && rushingExperts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800 flex items-center gap-2 mb-2">
            🔥 {t('admin.rushingExperts', 'RUSHING Experts')} ({rushingExperts.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {rushingExperts.slice(0, 10).map((expert: Expert) => (
              <span key={expert.id} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded border border-red-200 text-sm">
                <span className="font-medium">{expert.personalName}</span>
                {expert.avgRating && (
                  <span className="text-yellow-500 flex items-center">
                    <Star className="w-3 h-3 fill-current" />
                    {Number(expert.avgRating).toFixed(1)}
                  </span>
                )}
              </span>
            ))}
            {rushingExperts.length > 10 && (
              <span className="text-red-600 text-sm">+{rushingExperts.length - 10} more</span>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('admin.searchRequests', 'Search requests...')}
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <select
              className="input flex-1 sm:flex-none sm:w-auto"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-2 flex items-center justify-center transition-colors',
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
                title={t('common.listView', 'List View')}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={clsx(
                  'p-2 flex items-center justify-center transition-colors border-l border-gray-300',
                  viewMode === 'map'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
                title={t('common.mapView', 'Map View')}
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <Suspense fallback={<div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>}>
          <ExpertMatchMap
            markers={mapMarkers}
            height="400px"
            onMarkerClick={handleMapMarkerClick}
            selectedMarkerId={selectedMapMarkerId || undefined}
          />
          <div className="text-sm text-gray-500 mt-2 text-center">
            {t('admin.mapHint', 'Click on markers to view details. Red = RUSHING experts, Blue = Service requests')}
          </div>
        </Suspense>
      )}

      {/* Request List - Show in list view or when a marker is selected in map view */}
      {(viewMode === 'list' || selectedMapMarkerId) && (
        <div className="space-y-3 sm:space-y-4">
          {requestsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('admin.noRequests', 'No service requests found')}
            </div>
          ) : (
            filteredRequests
              .filter((r: ServiceRequest) => viewMode === 'list' || selectedMapMarkerId === `req-${r.id}`)
              .map((request: ServiceRequest) => (
              <div key={request.id} className="card overflow-hidden">
                {/* Request Header */}
                <div
                  className="p-3 sm:p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedRequestId(
                    expandedRequestId === request.id ? null : request.id
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                        <span className="text-xs sm:text-sm text-gray-500">{request.requestCode}</span>
                        <span className={clsx(
                          'text-xs px-2 py-0.5 rounded-full',
                          urgencyConfig[request.urgency]?.color || 'bg-gray-100'
                        )}>
                          {urgencyConfig[request.urgency]?.label || request.urgency}
                        </span>
                        <span className={clsx(
                          'text-xs px-2 py-0.5 rounded-full',
                          request.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                          request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        )}>
                          {request.status}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">{request.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mt-1">
                        {request.description}
                      </p>
                      <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                        {request.serviceLocation && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> <span className="truncate max-w-[150px] sm:max-w-none">{request.serviceLocation}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {request.applicationCount}
                        </span>
                        <span>{format(new Date(request.createdAt), 'MM-dd')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {request.status === 'OPEN' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              runMatchingMutation.mutate(request.id);
                            }}
                            disabled={runMatchingMutation.isPending}
                            className="btn btn-secondary btn-sm flex items-center gap-1 text-xs sm:text-sm"
                            title={t('admin.runMatching', 'Run Matching')}
                          >
                            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPushModal(request.id);
                            }}
                            className="btn btn-primary btn-sm flex items-center gap-1 text-xs sm:text-sm"
                          >
                            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">{t('admin.pushToExperts', 'Push')}</span>
                          </button>
                        </>
                      )}
                      {expandedRequestId === request.id ? (
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRequestId === request.id && (
                  <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-500">Service Type:</span>{' '}
                        <span className="font-medium">{request.serviceType}</span>
                      </div>
                      {request.budgetMin && (
                        <div>
                          <span className="text-gray-500">Budget:</span>{' '}
                          <span className="font-medium">
                            {request.budgetCurrency || 'USD'} {request.budgetMin}
                            {request.budgetMax && ` - ${request.budgetMax}`}
                          </span>
                        </div>
                      )}
                      {request.requiredSkills?.length > 0 && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-500">Required Skills:</span>{' '}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {request.requiredSkills.map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {request.organization && (
                        <div>
                          <span className="text-gray-500">Organization:</span>{' '}
                          <span className="font-medium">{request.organization.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Push to Experts Modal */}
      {showPushModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] sm:max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b">
              <h2 className="text-base sm:text-lg font-semibold">
                {t('admin.pushToExperts', 'Push to Experts')}
              </h2>
              <button
                onClick={() => {
                  setShowPushModal(false);
                  setSelectedExperts([]);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 sm:p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('admin.searchExperts', 'Search experts...')}
                  className="input pl-10 text-sm sm:text-base"
                  value={expertSearchKeyword}
                  onChange={(e) => setExpertSearchKeyword(e.target.value)}
                />
              </div>
              {selectedExperts.length > 0 && (
                <div className="mt-2 text-xs sm:text-sm text-blue-600">
                  {selectedExperts.length} expert(s) selected
                </div>
              )}
            </div>

            {/* Expert List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {searchLoading ? (
                <div className="text-center py-8 text-gray-500 text-sm">Searching...</div>
              ) : !searchResults || searchResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {t('admin.noExpertsFound', 'No matching experts found')}
                </div>
              ) : (
                <div className="space-y-2">
                  {searchResults.map((result: SearchResult) => (
                    <div
                      key={result.expert.id}
                      onClick={() => handleToggleExpert(result.expert.id)}
                      className={clsx(
                        'p-2 sm:p-3 border rounded-lg cursor-pointer transition-colors',
                        selectedExperts.includes(result.expert.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300',
                        result.hasExistingMatch && 'opacity-60'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <span className="font-medium text-sm sm:text-base">{result.expert.personalName}</span>
                            <span className="text-xs text-gray-500 hidden sm:inline">{result.expert.expertCode}</span>
                            {result.hasExistingMatch && (
                              <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                Matched
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                            <span className={clsx(
                              'text-xs px-1 sm:px-1.5 py-0.5 rounded',
                              workStatusConfig[result.expert.workStatus]?.color || 'bg-gray-100'
                            )}>
                              {workStatusConfig[result.expert.workStatus]?.icon}
                              <span className="hidden sm:inline"> {workStatusConfig[result.expert.workStatus]?.label || result.expert.workStatus}</span>
                            </span>
                            {result.expert.avgRating && (
                              <span className="text-xs flex items-center text-yellow-600">
                                <Star className="w-3 h-3 fill-current" />
                                {Number(result.expert.avgRating).toFixed(1)}
                              </span>
                            )}
                            {result.distanceKm && (
                              <span className="text-xs text-gray-500">
                                {result.distanceKm.toFixed(0)}km
                              </span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate">
                            {result.expert.professionalField}
                          </div>
                          {result.expert.skillTags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.expert.skillTags.slice(0, 3).map((skill, i) => (
                                <span key={i} className="text-xs px-1 sm:px-1.5 py-0.5 bg-gray-100 rounded truncate max-w-[80px] sm:max-w-none">
                                  {skill}
                                </span>
                              ))}
                              {result.expert.skillTags.length > 3 && (
                                <span className="text-xs text-gray-400">+{result.expert.skillTags.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="text-base sm:text-lg font-bold text-blue-600">
                            {result.score.toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500 hidden sm:block">Score</div>
                          {selectedExperts.includes(result.expert.id) ? (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                {selectedExperts.length} selected
              </div>
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setShowPushModal(false);
                    setSelectedExperts([]);
                  }}
                  className="btn btn-secondary flex-1 sm:flex-none text-sm"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handlePush}
                  disabled={selectedExperts.length === 0 || pushMutation.isPending}
                  className="btn btn-primary flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{pushMutation.isPending ? 'Pushing...' : `Push (${selectedExperts.length})`}</span>
                  <span className="sm:hidden">{pushMutation.isPending ? '...' : 'Push'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
