import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Target, X, MessageSquare, ArrowRight, MapPin, Clock, Wrench } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { expertApi } from '../../services/api';
import { MatchStatus, MATCH_STATUS_NAMES, MatchSource, MATCH_SOURCE_NAMES } from '@device-passport/shared';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface ExpertMatch {
  id: string;
  status: MatchStatus;
  matchSource: MatchSource;
  totalScore: number;
  scoreBreakdown: {
    skillMatch?: number;
    locationMatch?: number;
    experienceMatch?: number;
    availabilityMatch?: number;
  };
  distanceKm?: number;
  serviceRequest?: {
    id: string;
    title: string;
    description: string;
    serviceType: string;
    location: string;
    urgency: string;
    estimatedDuration: string;
    requiredSkills: string[];
  };
  customerOrg?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function ExpertMatches() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['expert-matches', user?.expertId],
    queryFn: () => expertApi.getExpertMatches(50),
    enabled: !!user?.expertId,
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => expertApi.dismissExpertMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-matches'] });
      toast.success(t('matching.dismissed', 'Match dismissed'));
    },
  });

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case MatchStatus.NEW:
        return 'bg-blue-100 text-blue-800';
      case MatchStatus.VIEWED:
        return 'bg-gray-100 text-gray-800';
      case MatchStatus.CONTACTED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchSourceColor = (source: MatchSource) => {
    switch (source) {
      case MatchSource.PLATFORM_RECOMMENDED:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case MatchSource.BUYER_SPECIFIED:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case MatchSource.AI_MATCHED:
      default:
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toUpperCase()) {
      case 'HIGH':
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const renderScoreBar = (score: number) => {
    const getScoreColor = () => {
      if (score >= 85) return 'bg-green-500';
      if (score >= 70) return 'bg-blue-500';
      if (score >= 50) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all', getScoreColor())}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-sm font-medium text-gray-700 w-12 text-right">
          {score}%
        </span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-6 h-6" />
          {t('expert.matches', 'Service Matches')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('expert.matchesDesc', 'Service requests that match your skills and expertise')}
        </p>
      </div>

      {/* Matches list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-40 animate-pulse" />
          ))}
        </div>
      ) : matches && matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((match: ExpertMatch) => (
            <div
              key={match.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={clsx(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        getStatusColor(match.status)
                      )}
                    >
                      {MATCH_STATUS_NAMES[match.status]}
                    </span>
                    {match.matchSource && (
                      <span
                        className={clsx(
                          'px-2 py-0.5 text-xs font-medium rounded-full border',
                          getMatchSourceColor(match.matchSource)
                        )}
                      >
                        {MATCH_SOURCE_NAMES[match.matchSource as MatchSource]}
                      </span>
                    )}
                    {match.totalScore >= 85 && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {t('matching.highQuality', 'High Quality')}
                      </span>
                    )}
                    {match.serviceRequest?.urgency && (
                      <span
                        className={clsx(
                          'px-2 py-0.5 text-xs font-medium rounded-full',
                          getUrgencyColor(match.serviceRequest.urgency)
                        )}
                      >
                        {match.serviceRequest.urgency}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {match.serviceRequest?.title || t('matching.untitled', 'Untitled Service')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('matching.from', 'From')}: {match.customerOrg?.name || t('matching.anonymous', 'Anonymous')}
                  </p>
                </div>
                <button
                  onClick={() => dismissMutation.mutate(match.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                  title={t('matching.dismiss', 'Dismiss')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Match score */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">{t('matching.matchScore', 'Match Score')}</p>
                {renderScoreBar(match.totalScore)}
              </div>

              {/* Service details preview */}
              {match.serviceRequest && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  {match.serviceRequest.serviceType && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full mb-2">
                      <Wrench className="w-3 h-3 mr-1" />
                      {match.serviceRequest.serviceType}
                    </span>
                  )}
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {match.serviceRequest.description || t('matching.noDescription', 'No description provided')}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                    {match.serviceRequest.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {match.serviceRequest.location}
                      </span>
                    )}
                    {match.distanceKm && (
                      <span>
                        {t('matching.distance', 'Distance')}: {Math.round(match.distanceKm)} km
                      </span>
                    )}
                    {match.serviceRequest.estimatedDuration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {match.serviceRequest.estimatedDuration}
                      </span>
                    )}
                  </div>
                  {match.serviceRequest.requiredSkills && match.serviceRequest.requiredSkills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {match.serviceRequest.requiredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Link
                  to={`/expert/matches/${match.id}`}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('matching.viewDetails', 'View Details')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/service-orders"
                  state={{
                    serviceRequestId: match.serviceRequest?.id,
                    matchId: match.id,
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('expert.acceptService', 'Accept Service')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {t('expert.noMatches', 'No service matches yet')}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {t('expert.noMatchesDesc', 'Service requests matching your skills will appear here')}
          </p>
        </div>
      )}
    </div>
  );
}
