import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  History,
  Star,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Check,
  Filter,
  DollarSign,
  User,
  Building,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { expertRatingApi } from '../../services/api';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface ExpertServiceRecord {
  id: string;
  recordCode: string;
  serviceRequestId: string;
  expertId: string;
  customerUserId: string;
  customerOrgId?: string;
  serviceType: string;
  serviceTitle: string;
  serviceDescription?: string;
  agreedPrice: number;
  finalPrice?: number;
  priceCurrency: string;
  estimatedDuration?: string;
  actualDuration?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  completedAt?: string;
  confirmedByCustomer: boolean;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  expertNotes?: string;
  customerNotes?: string;
  completionNotes?: string;
  serviceLocation?: string;
  isReviewed: boolean;
  createdAt: string;
  serviceRequest?: {
    title: string;
    contactName: string;
    contactPhone: string;
  };
  customerOrg?: {
    name: string;
  };
  customerUser?: {
    name: string;
    email: string;
  };
}

const statusConfig = {
  PENDING: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Pending',
  },
  IN_PROGRESS: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'In Progress',
  },
  COMPLETED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Completed',
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Cancelled',
  },
  DISPUTED: {
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Disputed',
  },
};

type StatusFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

export default function ServiceRecords() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [finalPrice, setFinalPrice] = useState<number | undefined>();

  const { data: records, isLoading } = useQuery({
    queryKey: ['expert-service-records', user?.expertId, statusFilter],
    queryFn: () => expertRatingApi.getExpertServiceRecords(
      user?.expertId as string,
      statusFilter === 'ALL' ? undefined : statusFilter
    ),
    enabled: !!user?.expertId,
  });

  const startServiceMutation = useMutation({
    mutationFn: (recordId: string) => expertRatingApi.startService(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-service-records'] });
      toast.success(t('serviceRecords.serviceStarted', 'Service started successfully'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('serviceRecords.startFailed', 'Failed to start service'));
    },
  });

  const completeServiceMutation = useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: { finalPrice?: number; completionNotes?: string } }) =>
      expertRatingApi.completeService(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-service-records'] });
      toast.success(t('serviceRecords.serviceCompleted', 'Service completed successfully'));
      setShowCompleteModal(null);
      setCompletionNotes('');
      setFinalPrice(undefined);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('serviceRecords.completeFailed', 'Failed to complete service'));
    },
  });

  const cancelServiceMutation = useMutation({
    mutationFn: ({ recordId, reason }: { recordId: string; reason?: string }) =>
      expertRatingApi.cancelService(recordId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-service-records'] });
      toast.success(t('serviceRecords.serviceCancelled', 'Service cancelled'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('serviceRecords.cancelFailed', 'Failed to cancel service'));
    },
  });

  const handleStartService = (recordId: string) => {
    if (window.confirm(t('serviceRecords.confirmStart', 'Are you sure you want to start this service?'))) {
      startServiceMutation.mutate(recordId);
    }
  };

  const handleCompleteService = (record: ExpertServiceRecord) => {
    setShowCompleteModal(record.id);
    setFinalPrice(record.agreedPrice);
  };

  const submitCompletion = () => {
    if (showCompleteModal) {
      completeServiceMutation.mutate({
        recordId: showCompleteModal,
        data: { finalPrice, completionNotes },
      });
    }
  };

  const handleCancelService = (recordId: string) => {
    const reason = window.prompt(t('serviceRecords.cancelReason', 'Please provide a reason for cancellation (optional):'));
    if (reason !== null) {
      cancelServiceMutation.mutate({ recordId, reason: reason || undefined });
    }
  };

  const calculateStats = () => {
    if (!records || records.length === 0) {
      return { total: 0, pending: 0, inProgress: 0, completed: 0 };
    }

    return {
      total: records.length,
      pending: records.filter((r: ExpertServiceRecord) => r.status === 'PENDING').length,
      inProgress: records.filter((r: ExpertServiceRecord) => r.status === 'IN_PROGRESS').length,
      completed: records.filter((r: ExpertServiceRecord) => r.status === 'COMPLETED').length,
    };
  };

  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Service Records - Device Passport System</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6" />
            {t('expert.serviceRecords', 'Service Records')}
          </h1>
        <p className="text-gray-600 mt-1">
          {t('expert.serviceRecordsDesc', 'View your service history and customer reviews')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('expert.totalServices', 'Total Services')}</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('serviceRecords.pending', 'Pending')}</p>
          <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('serviceRecords.inProgress', 'In Progress')}</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('expert.completed', 'Completed')}</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-500">{t('common.filter', 'Filter')}:</span>
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={clsx(
                'px-3 py-1 text-sm rounded-full transition-colors',
                statusFilter === status
                  ? 'bg-primary-100 text-primary-700 border border-primary-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {status === 'ALL' ? t('common.all', 'All') : t(`serviceStatus.${status}`, status.replace('_', ' '))}
            </button>
          ))}
        </div>
      </div>

      {/* Service Records List */}
      {records && records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record: ExpertServiceRecord) => {
            const statusInfo = statusConfig[record.status];
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={record.id}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
                        statusInfo.bgColor,
                        statusInfo.color
                      )}>
                        <StatusIcon className="w-3 h-3" />
                        {t(`serviceStatus.${record.status}`, statusInfo.label)}
                      </span>
                      <span className="text-sm text-gray-500 font-mono">
                        {record.recordCode}
                      </span>
                      {record.confirmedByCustomer && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          <Check className="w-3 h-3" />
                          {t('serviceRecords.confirmed', 'Confirmed')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {record.serviceTitle}
                    </h3>
                    {record.serviceDescription && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {record.serviceDescription}
                      </p>
                    )}
                  </div>
                </div>

                {/* Service Details */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  {record.scheduledStart && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(record.scheduledStart).toLocaleDateString()}
                    </span>
                  )}
                  {record.serviceLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {record.serviceLocation}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {record.priceCurrency} {record.finalPrice || record.agreedPrice}
                  </span>
                  {record.completedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {t('expert.completedOn', 'Completed')}: {new Date(record.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Customer Info */}
                <div className="text-sm text-gray-600 mb-4 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {record.customerUser?.name || record.serviceRequest?.contactName || 'Customer'}
                  </span>
                  {record.customerOrg?.name && (
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {record.customerOrg.name}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                  {record.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStartService(record.id)}
                        disabled={startServiceMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                      >
                        <Play className="w-4 h-4" />
                        {t('serviceRecords.startService', 'Start Service')}
                      </button>
                      <button
                        onClick={() => handleCancelService(record.id)}
                        disabled={cancelServiceMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        {t('common.cancel', 'Cancel')}
                      </button>
                    </>
                  )}
                  {record.status === 'IN_PROGRESS' && (
                    <>
                      <button
                        onClick={() => handleCompleteService(record)}
                        disabled={completeServiceMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t('serviceRecords.completeService', 'Complete Service')}
                      </button>
                      <button
                        onClick={() => handleCancelService(record.id)}
                        disabled={cancelServiceMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        {t('common.cancel', 'Cancel')}
                      </button>
                    </>
                  )}
                  {record.status === 'COMPLETED' && !record.confirmedByCustomer && (
                    <span className="text-sm text-yellow-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {t('serviceRecords.awaitingConfirmation', 'Awaiting customer confirmation')}
                    </span>
                  )}
                  {record.status === 'COMPLETED' && record.confirmedByCustomer && !record.isReviewed && (
                    <span className="text-sm text-blue-600 flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {t('serviceRecords.awaitingReview', 'Awaiting customer review')}
                    </span>
                  )}
                  <Link
                    to={`/expert/service-records/${record.id}`}
                    className="ml-auto text-sm text-blue-600 hover:text-blue-800"
                  >
                    {t('common.viewDetails', 'View Details')}
                  </Link>
                </div>

                {/* Completion Notes (if completed) */}
                {record.completionNotes && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">{t('serviceRecords.completionNotes', 'Completion Notes')}:</p>
                    <p className="text-sm text-gray-700">{record.completionNotes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {t('expert.noServiceRecords', 'No service records yet')}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {t('expert.noServiceRecordsDesc', 'Your completed service assignments will appear here')}
          </p>
        </div>
      )}

      {/* Complete Service Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('serviceRecords.completeServiceTitle', 'Complete Service')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('serviceRecords.finalPrice', 'Final Price')}
                </label>
                <input
                  type="number"
                  value={finalPrice || ''}
                  onChange={(e) => setFinalPrice(parseFloat(e.target.value) || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('serviceRecords.completionNotes', 'Completion Notes')}
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('serviceRecords.completionNotesPlaceholder', 'Describe the work performed...')}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCompleteModal(null);
                  setCompletionNotes('');
                  setFinalPrice(undefined);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={submitCompletion}
                disabled={completeServiceMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {completeServiceMutation.isPending
                  ? t('common.saving', 'Saving...')
                  : t('serviceRecords.markComplete', 'Mark as Complete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
