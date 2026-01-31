import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Flag, Send } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { ratingApi } from '../../services/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface ExpertReview {
  id: string;
  overallRating: number;
  qualityRating?: number;
  communicationRating?: number;
  punctualityRating?: number;
  professionalismRating?: number;
  valueRating?: number;
  title?: string;
  comment?: string;
  pros: string[];
  cons: string[];
  expertResponse?: string;
  expertRespondedAt?: string;
  helpfulCount: number;
  notHelpfulCount: number;
  isVerified: boolean;
  reviewer?: {
    id: string;
    name: string;
  };
  serviceRecord?: {
    id: string;
    serviceTitle: string;
    serviceType: string;
    completedAt: string;
  };
  createdAt: string;
}

interface RatingSummary {
  avgRating: number;
  totalReviews: number;
  completedServices: number;
  ratingDistribution: Record<number, number>;
  categoryAverages: {
    quality: number;
    communication: number;
    punctuality: number;
    professionalism: number;
    value: number;
  };
}

interface ExpertReviewsProps {
  expertId: string;
  isOwnProfile?: boolean;
}

export default function ExpertReviews({ expertId, isOwnProfile = false }: ExpertReviewsProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [responseText, setResponseText] = useState<Record<string, string>>({});
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  // Fetch rating summary
  const { data: summary } = useQuery<RatingSummary>({
    queryKey: ['expert-rating-summary', expertId],
    queryFn: () => ratingApi.getExpertRatingSummary(expertId),
    enabled: !!expertId,
  });

  // Fetch reviews
  const { data: reviews, isLoading } = useQuery<ExpertReview[]>({
    queryKey: ['expert-reviews', expertId],
    queryFn: () => ratingApi.getExpertReviews(expertId),
    enabled: !!expertId,
  });

  // Respond to review mutation (for expert)
  const respondMutation = useMutation({
    mutationFn: ({ reviewId, response }: { reviewId: string; response: string }) =>
      ratingApi.respondToReview(reviewId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-reviews', expertId] });
      toast.success(t('rating.responseSent', 'Response sent successfully'));
    },
    onError: () => {
      toast.error(t('rating.responseError', 'Failed to send response'));
    },
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: ({ reviewId, isHelpful }: { reviewId: string; isHelpful: boolean }) =>
      ratingApi.voteReview(reviewId, isHelpful),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-reviews', expertId] });
    },
  });

  // Flag mutation
  const flagMutation = useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) =>
      ratingApi.flagReview(reviewId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-reviews', expertId] });
      toast.success(t('rating.flagged', 'Review flagged for moderation'));
    },
  });

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={clsx(
              sizeClasses[size],
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const renderRatingBar = (count: number, total: number, stars: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-8 text-gray-600">{stars}</span>
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-8 text-gray-500 text-right">{count}</span>
      </div>
    );
  };

  const handleRespond = (reviewId: string) => {
    const response = responseText[reviewId];
    if (!response?.trim()) {
      toast.error(t('rating.emptyResponse', 'Please enter a response'));
      return;
    }
    respondMutation.mutate({ reviewId, response: response.trim() });
    setResponseText((prev) => ({ ...prev, [reviewId]: '' }));
    setExpandedReview(null);
  };

  const handleFlag = (reviewId: string) => {
    const reason = prompt(t('rating.flagReason', 'Please provide a reason for flagging this review:'));
    if (reason) {
      flagMutation.mutate({ reviewId, reason });
    }
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {summary && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('rating.summary', 'Rating Summary')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {summary.avgRating.toFixed(1)}
              </div>
              <div className="mt-1">{renderStars(Math.round(summary.avgRating), 'lg')}</div>
              <div className="text-sm text-gray-500 mt-1">
                {t('rating.basedOn', 'Based on {{count}} reviews', {
                  count: summary.totalReviews,
                })}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {t('rating.completedServices', '{{count}} completed services', {
                  count: summary.completedServices,
                })}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars}>
                  {renderRatingBar(
                    summary.ratingDistribution[stars] || 0,
                    summary.totalReviews,
                    stars
                  )}
                </div>
              ))}
            </div>

            {/* Category Averages */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                {t('rating.categories', 'Categories')}
              </h3>
              {[
                { key: 'quality', label: t('rating.quality', 'Quality') },
                { key: 'communication', label: t('rating.communication', 'Communication') },
                { key: 'punctuality', label: t('rating.punctuality', 'Punctuality') },
                { key: 'professionalism', label: t('rating.professionalism', 'Professionalism') },
                { key: 'value', label: t('rating.value', 'Value') },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{label}</span>
                  <div className="flex items-center gap-1">
                    {renderStars(
                      Math.round(summary.categoryAverages[key as keyof typeof summary.categoryAverages] || 0),
                      'sm'
                    )}
                    <span className="text-gray-500 w-8 text-right">
                      {(summary.categoryAverages[key as keyof typeof summary.categoryAverages] || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('rating.reviews', 'Reviews')} ({reviews?.length || 0})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-4">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.overallRating)}
                      {review.isVerified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {t('rating.verified', 'Verified')}
                        </span>
                      )}
                    </div>
                    {review.title && (
                      <h3 className="font-medium text-gray-900 mt-1">{review.title}</h3>
                    )}
                    <div className="text-sm text-gray-500 mt-1">
                      {review.reviewer?.name || t('rating.anonymous', 'Anonymous')} -{' '}
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                    {review.serviceRecord && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {review.serviceRecord.serviceTitle} ({review.serviceRecord.serviceType})
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                {review.comment && (
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                )}

                {/* Pros & Cons */}
                {(review.pros.length > 0 || review.cons.length > 0) && (
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {review.pros.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-1">
                          {t('rating.pros', 'Pros')}
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-0.5">
                          {review.pros.map((pro, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <span className="text-green-500">+</span> {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-1">
                          {t('rating.cons', 'Cons')}
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-0.5">
                          {review.cons.map((con, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <span className="text-red-500">-</span> {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Expert Response */}
                {review.expertResponse && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-3">
                    <div className="text-xs text-gray-500 mb-1">
                      {t('rating.expertResponse', 'Expert Response')} -{' '}
                      {new Date(review.expertRespondedAt!).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-gray-700">{review.expertResponse}</p>
                  </div>
                )}

                {/* Response Form (for expert) */}
                {isOwnProfile && !review.expertResponse && (
                  <div className="mt-3">
                    {expandedReview === review.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={responseText[review.id] || ''}
                          onChange={(e) =>
                            setResponseText((prev) => ({
                              ...prev,
                              [review.id]: e.target.value,
                            }))
                          }
                          placeholder={t('rating.writeResponse', 'Write your response...')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespond(review.id)}
                            disabled={respondMutation.isPending}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            {t('rating.send', 'Send')}
                          </button>
                          <button
                            onClick={() => setExpandedReview(null)}
                            className="px-3 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                          >
                            {t('common.cancel', 'Cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setExpandedReview(review.id)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <MessageSquare className="w-4 h-4" />
                        {t('rating.respond', 'Respond to review')}
                      </button>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => voteMutation.mutate({ reviewId: review.id, isHelpful: true })}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {t('rating.helpful', 'Helpful')} ({review.helpfulCount})
                  </button>
                  <button
                    onClick={() => voteMutation.mutate({ reviewId: review.id, isHelpful: false })}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    ({review.notHelpfulCount})
                  </button>
                  {user && !isOwnProfile && (
                    <button
                      onClick={() => handleFlag(review.id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-600 ml-auto"
                    >
                      <Flag className="w-4 h-4" />
                      {t('rating.flag', 'Flag')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>{t('rating.noReviews', 'No reviews yet')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
