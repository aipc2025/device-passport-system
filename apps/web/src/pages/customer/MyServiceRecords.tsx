import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ratingApi } from '../../services/api';
import { ServiceRecordStatus, SERVICE_RECORD_STATUS_NAMES } from '@device-passport/shared';
import ReviewForm from '../../components/rating/ReviewForm';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface ServiceRecord {
  id: string;
  recordCode: string;
  serviceTitle: string;
  serviceDescription?: string;
  serviceType: string;
  status: ServiceRecordStatus;
  agreedPrice: number;
  finalPrice?: number;
  priceCurrency: string;
  estimatedDuration?: string;
  actualDuration?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  serviceLocation?: string;
  expertNotes?: string;
  completionNotes?: string;
  confirmedByCustomer: boolean;
  isReviewed: boolean;
  expert?: {
    id: string;
    personalName: string;
    expertCode?: string;
    avgRating?: number;
    totalReviews?: number;
  };
  createdAt: string;
  completedAt?: string;
}

export default function MyServiceRecords() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ServiceRecordStatus | ''>('');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [reviewingRecord, setReviewingRecord] = useState<ServiceRecord | null>(null);

  const { data: records, isLoading } = useQuery<ServiceRecord[]>({
    queryKey: ['my-service-records', statusFilter],
    queryFn: () => ratingApi.getMyServiceRecords(statusFilter || undefined),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => ratingApi.confirmCompletion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-service-records'] });
      toast.success(t('rating.confirmed', 'Service completion confirmed'));
    },
    onError: () => {
      toast.error(t('rating.confirmError', 'Failed to confirm completion'));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      ratingApi.cancelService(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-service-records'] });
      toast.success(t('rating.cancelled', 'Service cancelled'));
    },
    onError: () => {
      toast.error(t('rating.cancelError', 'Failed to cancel service'));
    },
  });

  const getStatusIcon = (status: ServiceRecordStatus) => {
    switch (status) {
      case ServiceRecordStatus.PENDING:
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case ServiceRecordStatus.IN_PROGRESS:
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      case ServiceRecordStatus.COMPLETED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case ServiceRecordStatus.CANCELLED:
        return <XCircle className="w-5 h-5 text-gray-500" />;
      case ServiceRecordStatus.DISPUTED:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ServiceRecordStatus) => {
    switch (status) {
      case ServiceRecordStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ServiceRecordStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case ServiceRecordStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case ServiceRecordStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      case ServiceRecordStatus.DISPUTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleConfirm = (record: ServiceRecord) => {
    if (window.confirm(t('rating.confirmPrompt', 'Are you satisfied with the service? This will allow you to leave a review.'))) {
      confirmMutation.mutate(record.id);
    }
  };

  const handleCancel = (record: ServiceRecord) => {
    const reason = prompt(t('rating.cancelReason', 'Please provide a reason for cancellation (optional):'));
    cancelMutation.mutate({ id: record.id, reason: reason || undefined });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (reviewingRecord) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            {t('rating.writeReview', 'Write a Review')}
          </h1>
          <ReviewForm
            serviceRecordId={reviewingRecord.id}
            expertName={reviewingRecord.expert?.personalName || 'Expert'}
            serviceTitle={reviewingRecord.serviceTitle}
            onSuccess={() => {
              setReviewingRecord(null);
              queryClient.invalidateQueries({ queryKey: ['my-service-records'] });
            }}
            onCancel={() => setReviewingRecord(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6" />
          {t('rating.myServices', 'My Service Records')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('rating.myServicesDesc', 'View and manage your service history with experts')}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ServiceRecordStatus | '')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">{t('common.allStatus', 'All Status')}</option>
          {Object.values(ServiceRecordStatus).map((status) => (
            <option key={status} value={status}>
              {SERVICE_RECORD_STATUS_NAMES[status]}
            </option>
          ))}
        </select>
      </div>

      {/* Records List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
          ))}
        </div>
      ) : records && records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{record.serviceTitle}</h3>
                      <p className="text-sm text-gray-500">
                        {record.recordCode} | {record.serviceType}
                      </p>
                      {record.expert && (
                        <p className="text-sm text-gray-600 mt-1">
                          {t('rating.expert', 'Expert')}: {record.expert.personalName}
                          {record.expert.avgRating && (
                            <span className="ml-2 inline-flex items-center">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="ml-0.5">
                                {record.expert.avgRating.toFixed(1)} ({record.expert.totalReviews})
                              </span>
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getStatusColor(record.status)
                      )}
                    >
                      {SERVICE_RECORD_STATUS_NAMES[record.status]}
                    </span>
                    <button
                      onClick={() =>
                        setExpandedRecord(expandedRecord === record.id ? null : record.id)
                      }
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {expandedRecord === record.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Price and Date */}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span>
                    {t('rating.price', 'Price')}:{' '}
                    {formatCurrency(record.finalPrice || record.agreedPrice, record.priceCurrency)}
                  </span>
                  <span>
                    {t('rating.created', 'Created')}:{' '}
                    {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                  {record.completedAt && (
                    <span>
                      {t('rating.completed', 'Completed')}:{' '}
                      {new Date(record.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedRecord === record.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {record.serviceLocation && (
                      <div>
                        <span className="text-gray-500">{t('rating.location', 'Location')}:</span>
                        <span className="ml-2 text-gray-900">{record.serviceLocation}</span>
                      </div>
                    )}
                    {record.estimatedDuration && (
                      <div>
                        <span className="text-gray-500">{t('rating.estimated', 'Estimated')}:</span>
                        <span className="ml-2 text-gray-900">{record.estimatedDuration}</span>
                      </div>
                    )}
                    {record.actualDuration && (
                      <div>
                        <span className="text-gray-500">{t('rating.actual', 'Actual')}:</span>
                        <span className="ml-2 text-gray-900">{record.actualDuration}</span>
                      </div>
                    )}
                    {record.scheduledStart && (
                      <div>
                        <span className="text-gray-500">{t('rating.scheduled', 'Scheduled')}:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(record.scheduledStart).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {record.serviceDescription && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">
                        {t('rating.description', 'Description')}:
                      </span>
                      <p className="text-sm text-gray-700 mt-1">{record.serviceDescription}</p>
                    </div>
                  )}

                  {record.expertNotes && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">
                        {t('rating.expertNotes', 'Expert Notes')}:
                      </span>
                      <p className="text-sm text-gray-700 mt-1">{record.expertNotes}</p>
                    </div>
                  )}

                  {record.completionNotes && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">
                        {t('rating.completionNotes', 'Completion Notes')}:
                      </span>
                      <p className="text-sm text-gray-700 mt-1">{record.completionNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-gray-200 p-4 bg-white flex gap-3">
                {record.status === ServiceRecordStatus.COMPLETED && !record.confirmedByCustomer && (
                  <button
                    onClick={() => handleConfirm(record)}
                    disabled={confirmMutation.isPending}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {t('rating.confirmCompletion', 'Confirm Completion')}
                  </button>
                )}

                {record.status === ServiceRecordStatus.COMPLETED &&
                  record.confirmedByCustomer &&
                  !record.isReviewed && (
                    <button
                      onClick={() => setReviewingRecord(record)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      <Star className="w-4 h-4" />
                      {t('rating.leaveReview', 'Leave a Review')}
                    </button>
                  )}

                {record.isReviewed && (
                  <span className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 text-sm rounded-md">
                    <CheckCircle className="w-4 h-4" />
                    {t('rating.reviewed', 'Reviewed')}
                  </span>
                )}

                {(record.status === ServiceRecordStatus.PENDING ||
                  record.status === ServiceRecordStatus.IN_PROGRESS) && (
                  <button
                    onClick={() => handleCancel(record)}
                    disabled={cancelMutation.isPending}
                    className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 disabled:opacity-50"
                  >
                    {t('rating.cancelService', 'Cancel Service')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">{t('rating.noRecords', 'No service records yet')}</p>
          <p className="text-sm text-gray-400 mt-1">
            {t('rating.noRecordsDesc', 'Your service history with experts will appear here')}
          </p>
        </div>
      )}
    </div>
  );
}
