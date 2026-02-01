import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  Coffee,
  Moon,
  Briefcase,
  Play,
  Award,
  Star,
  TrendingUp,
} from 'lucide-react';
import { expertApi } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import {
  ExpertWorkStatus,
  EXPERT_WORK_STATUS_NAMES,
  ExpertMembershipLevel,
  EXPERT_MEMBERSHIP_LEVEL_NAMES,
  CreditLevel,
  CREDIT_LEVEL_NAMES,
} from '@device-passport/shared';
import clsx from 'clsx';

interface WorkSummary {
  workStatus: ExpertWorkStatus;
  membershipLevel: ExpertMembershipLevel;
  membershipExpiresAt: string | null;
  membershipExpired: boolean;
  canUseRushingMode: boolean;
  activeServiceCount: number;
  maxConcurrentServices: number;
  rushingStartedAt: string | null;
  rewardPoints: number;
  creditScore: number;
  creditLevel: CreditLevel;
}

export default function WorkStatusCard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isChanging, setIsChanging] = useState(false);

  const { data: summary, isLoading } = useQuery<WorkSummary>({
    queryKey: ['expert-work-summary', user?.expertId],
    queryFn: () => expertApi.getWorkSummary(user?.expertId || ''),
    enabled: !!user?.expertId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: ExpertWorkStatus) =>
      expertApi.updateWorkStatus(user?.expertId || '', status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-work-summary'] });
    },
  });

  const [rushingError, setRushingError] = useState<string | null>(null);

  const startRushingMutation = useMutation({
    mutationFn: () => expertApi.startRushing(user?.expertId || ''),
    onSuccess: () => {
      setRushingError(null);
      queryClient.invalidateQueries({ queryKey: ['expert-work-summary'] });
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || error.message || t('expert.rushingFailed', 'Failed to start rushing mode');
      setRushingError(message);
    },
  });

  const stopRushingMutation = useMutation({
    mutationFn: () => expertApi.stopRushing(user?.expertId || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-work-summary'] });
    },
  });

  const getStatusIcon = (status: ExpertWorkStatus) => {
    switch (status) {
      case ExpertWorkStatus.RUSHING:
        return <Zap className="w-5 h-5" />;
      case ExpertWorkStatus.IDLE:
        return <Coffee className="w-5 h-5" />;
      case ExpertWorkStatus.BOOKED:
        return <Briefcase className="w-5 h-5" />;
      case ExpertWorkStatus.IN_SERVICE:
        return <Play className="w-5 h-5" />;
      case ExpertWorkStatus.OFF_DUTY:
        return <Moon className="w-5 h-5" />;
      default:
        return <Coffee className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: ExpertWorkStatus) => {
    switch (status) {
      case ExpertWorkStatus.RUSHING:
        return 'bg-red-100 text-red-700 border-red-300';
      case ExpertWorkStatus.IDLE:
        return 'bg-green-100 text-green-700 border-green-300';
      case ExpertWorkStatus.BOOKED:
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case ExpertWorkStatus.IN_SERVICE:
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case ExpertWorkStatus.OFF_DUTY:
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getMembershipColor = (level: ExpertMembershipLevel) => {
    switch (level) {
      case ExpertMembershipLevel.DIAMOND:
        return 'text-purple-600';
      case ExpertMembershipLevel.GOLD:
        return 'text-yellow-600';
      case ExpertMembershipLevel.SILVER:
        return 'text-gray-500';
      default:
        return 'text-gray-400';
    }
  };

  const getCreditLevelColor = (level: CreditLevel) => {
    switch (level) {
      case CreditLevel.DIAMOND:
        return 'text-purple-600 bg-purple-100';
      case CreditLevel.PLATINUM:
        return 'text-blue-600 bg-blue-100';
      case CreditLevel.GOLD:
        return 'text-yellow-600 bg-yellow-100';
      case CreditLevel.SILVER:
        return 'text-gray-500 bg-gray-100';
      default:
        return 'text-orange-600 bg-orange-100';
    }
  };

  const handleStatusChange = async (newStatus: ExpertWorkStatus) => {
    if (newStatus === ExpertWorkStatus.RUSHING) {
      await startRushingMutation.mutateAsync();
    } else if (summary?.workStatus === ExpertWorkStatus.RUSHING) {
      await stopRushingMutation.mutateAsync();
      if (newStatus !== ExpertWorkStatus.IDLE) {
        await updateStatusMutation.mutateAsync(newStatus);
      }
    } else {
      await updateStatusMutation.mutateAsync(newStatus);
    }
    setIsChanging(false);
  };

  const canChangeStatus = summary?.workStatus !== ExpertWorkStatus.BOOKED &&
                          summary?.workStatus !== ExpertWorkStatus.IN_SERVICE;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
        <div className="h-10 bg-gray-200 rounded w-full mb-4" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-16 bg-gray-200 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
          <div className="h-16 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Status Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('expert.workStatus', 'Work Status')}
          </h3>
          <div className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-full border',
            getStatusColor(summary.workStatus)
          )}>
            {getStatusIcon(summary.workStatus)}
            <span className="font-medium">
              {EXPERT_WORK_STATUS_NAMES[summary.workStatus]?.en || summary.workStatus}
            </span>
          </div>
        </div>

        {/* Status Change Buttons */}
        {canChangeStatus && (
          <div className="mt-4">
            {!isChanging ? (
              <button
                onClick={() => setIsChanging(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {t('expert.changeStatus', 'Change Status')}
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                {summary.workStatus !== ExpertWorkStatus.RUSHING && (
                  summary.canUseRushingMode ? (
                    <button
                      onClick={() => handleStatusChange(ExpertWorkStatus.RUSHING)}
                      disabled={startRushingMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200"
                    >
                      <Zap className="w-4 h-4" />
                      {t('expert.startRushing', 'Start Rushing')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-400 rounded-lg border border-gray-200 cursor-not-allowed" title={t('expert.rushingRequiresMembership', 'Requires paid membership')}>
                      <Zap className="w-4 h-4" />
                      {t('expert.startRushing', 'Start Rushing')}
                    </div>
                  )
                )}
                {summary.workStatus !== ExpertWorkStatus.IDLE && summary.workStatus !== ExpertWorkStatus.RUSHING && (
                  <button
                    onClick={() => handleStatusChange(ExpertWorkStatus.IDLE)}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200"
                  >
                    <Coffee className="w-4 h-4" />
                    {t('expert.goIdle', 'Go Idle')}
                  </button>
                )}
                {summary.workStatus === ExpertWorkStatus.RUSHING && (
                  <button
                    onClick={() => handleStatusChange(ExpertWorkStatus.IDLE)}
                    disabled={stopRushingMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200"
                  >
                    <Coffee className="w-4 h-4" />
                    {t('expert.stopRushing', 'Stop Rushing')}
                  </button>
                )}
                {summary.workStatus !== ExpertWorkStatus.OFF_DUTY && (
                  <button
                    onClick={() => handleStatusChange(ExpertWorkStatus.OFF_DUTY)}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 border border-gray-200"
                  >
                    <Moon className="w-4 h-4" />
                    {t('expert.goOffDuty', 'Go Off Duty')}
                  </button>
                )}
                <button
                  onClick={() => setIsChanging(false)}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              </div>
            )}
          </div>
        )}

        {!canChangeStatus && (
          <p className="mt-2 text-sm text-gray-500">
            {summary.workStatus === ExpertWorkStatus.BOOKED
              ? t('expert.statusLockedBooked', 'Status locked: You have a scheduled service')
              : t('expert.statusLockedInService', 'Status locked: You are currently in service')}
          </p>
        )}

        {/* Rushing Duration */}
        {summary.workStatus === ExpertWorkStatus.RUSHING && summary.rushingStartedAt && (
          <p className="mt-2 text-sm text-orange-600">
            {t('expert.rushingSince', 'Rushing since')}:{' '}
            {new Date(summary.rushingStartedAt).toLocaleTimeString()}
          </p>
        )}

        {/* Rushing Error Message */}
        {rushingError && (
          <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
            {rushingError}
          </p>
        )}

        {/* Membership Upgrade Message */}
        {!summary.canUseRushingMode && canChangeStatus && isChanging && (
          <p className="mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded">
            {summary.membershipExpired ? (
              t('expert.membershipExpired', 'Your membership has expired. Please renew to use Rushing mode.')
            ) : (
              t('expert.rushingRequiresMembership', 'Rushing mode requires a paid membership (Silver, Gold, or Diamond). Upgrade to get priority order notifications.')
            )}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 divide-x divide-gray-200">
        {/* Active Services */}
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {summary.activeServiceCount}/{summary.maxConcurrentServices}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {t('expert.activeServices', 'Active Services')}
          </div>
        </div>

        {/* Credit Score */}
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-gray-900">{summary.creditScore}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            <span className={clsx(
              'inline-flex px-1.5 py-0.5 rounded text-xs',
              getCreditLevelColor(summary.creditLevel)
            )}>
              {CREDIT_LEVEL_NAMES[summary.creditLevel]?.en || summary.creditLevel}
            </span>
          </div>
        </div>

        {/* Reward Points */}
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-900">
              {summary.rewardPoints.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {t('expert.rewardPoints', 'Reward Points')}
          </div>
        </div>
      </div>

      {/* Membership Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className={clsx('w-5 h-5', getMembershipColor(summary.membershipLevel))} />
            <span className="text-sm font-medium text-gray-700">
              {EXPERT_MEMBERSHIP_LEVEL_NAMES[summary.membershipLevel]?.en || summary.membershipLevel}
            </span>
          </div>
          {summary.membershipExpiresAt && summary.membershipLevel !== ExpertMembershipLevel.STANDARD && (
            <span className="text-xs text-gray-500">
              {t('expert.expiresAt', 'Expires')}:{' '}
              {new Date(summary.membershipExpiresAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
