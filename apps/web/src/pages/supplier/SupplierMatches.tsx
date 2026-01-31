import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Target, X, MessageSquare, ArrowRight } from 'lucide-react';
import { matchingApi } from '../../services/api';
import { MatchScoreBar } from '../../components/marketplace';
import { MatchStatus, MATCH_STATUS_NAMES, MatchSource, MATCH_SOURCE_NAMES } from '@device-passport/shared';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function SupplierMatches() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: matches, isLoading } = useQuery({
    queryKey: ['supplier-matches'],
    queryFn: () => matchingApi.getRecommendations('supplier', 50, true),
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => matchingApi.dismissMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-matches'] });
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('supplier.matchRecommendations', 'Match Recommendations')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('supplier.matchDesc', 'Buyer requirements that match your products')}
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
          {matches.map((match: any) => (
            <div
              key={match.id}
              className="bg-white rounded-lg border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
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
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {match.buyerRequirement?.title || t('matching.untitled', 'Untitled RFQ')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('matching.from', 'From')}: {match.buyerOrg?.name || t('matching.anonymous', 'Anonymous')}
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
                <MatchScoreBar
                  totalScore={match.totalScore}
                  breakdown={match.scoreBreakdown}
                  distanceKm={match.distanceKm}
                  showBreakdown={false}
                />
              </div>

              {/* RFQ details preview */}
              {match.buyerRequirement && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {match.buyerRequirement.description || t('matching.noDescription', 'No description provided')}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                    {match.buyerRequirement.quantity && (
                      <span>
                        {t('matching.qty', 'Qty')}: {match.buyerRequirement.quantity}
                      </span>
                    )}
                    {match.buyerRequirement.budgetMax && (
                      <span>
                        {t('matching.budget', 'Budget')}: {match.buyerRequirement.budgetCurrency || 'USD'}{' '}
                        {Number(match.buyerRequirement.budgetMax).toLocaleString()}
                      </span>
                    )}
                    {match.distanceKm && (
                      <span>
                        {t('matching.distance', 'Distance')}: {Math.round(match.distanceKm)} km
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Link
                  to={`/matching/${match.id}?role=supplier`}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('matching.viewDetails', 'View Details')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/inquiries/create"
                  state={{
                    rfqId: match.buyerRequirementId,
                    rfqTitle: match.buyerRequirement?.title,
                    buyerOrgId: match.buyerOrgId,
                    buyerName: match.buyerOrg?.name,
                    matchId: match.id,
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('matching.contact', 'Contact Buyer')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {t('supplier.noMatches', 'No match recommendations yet')}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {t('supplier.publishToMatch', 'Publish products to get matched with buyer requirements')}
          </p>
        </div>
      )}
    </div>
  );
}
