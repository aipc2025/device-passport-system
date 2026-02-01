import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  DollarSign,
  User,
  Building,
  FileText,
  Phone,
  Mail,
  Star,
  MessageSquare,
} from 'lucide-react';
import { ratingApi } from '../../services/api';
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
    description?: string;
    contactName: string;
    contactPhone: string;
    contactEmail?: string;
    urgency?: string;
  };
  customerOrg?: {
    name: string;
    phone?: string;
    email?: string;
  };
  customerUser?: {
    name: string;
    email: string;
  };
  review?: {
    id: string;
    overallRating: number;
    qualityRating?: number;
    communicationRating?: number;
    punctualityRating?: number;
    valueRating?: number;
    reviewText?: string;
    createdAt: string;
  };
}

type ServiceRecordStatusType = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

const statusConfig: Record<ServiceRecordStatusType, {
  icon: typeof Clock;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}> = {
  PENDING: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
    label: 'Pending',
  },
  IN_PROGRESS: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-300',
    label: 'In Progress',
  },
  COMPLETED: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    label: 'Completed',
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    label: 'Cancelled',
  },
  DISPUTED: {
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
    label: 'Disputed',
  },
};

export default function ServiceRecordDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [finalPrice, setFinalPrice] = useState<number | undefined>();

  const { data: record, isLoading, error } = useQuery<ExpertServiceRecord>({
    queryKey: ['service-record', id],
    queryFn: () => ratingApi.getServiceRecord(id!),
    enabled: !!id,
  });

  const startServiceMutation = useMutation({
    mutationFn: () => ratingApi.startService(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-record', id] });
      queryClient.invalidateQueries({ queryKey: ['expert-service-records'] });
      toast.success(t('serviceRecords.serviceStarted', 'Service started successfully'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('serviceRecords.startFailed', 'Failed to start service'));
    },
  });

  const completeServiceMutation = useMutation({
    mutationFn: (data: { finalPrice?: number; completionNotes?: string }) =>
      ratingApi.completeService(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-record', id] });
      queryClient.invalidateQueries({ queryKey: ['expert-service-records'] });
      toast.success(t('serviceRecords.serviceCompleted', 'Service completed successfully'));
      setShowCompleteModal(false);
      setCompletionNotes('');
      setFinalPrice(undefined);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('serviceRecords.completeFailed', 'Failed to complete service'));
    },
  });

  const cancelServiceMutation = useMutation({
    mutationFn: (reason?: string) => ratingApi.cancelService(id!, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-record', id] });
      queryClient.invalidateQueries({ queryKey: ['expert-service-records'] });
      toast.success(t('serviceRecords.serviceCancelled', 'Service cancelled'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('serviceRecords.cancelFailed', 'Failed to cancel service'));
    },
  });

  const handleStartService = () => {
    if (window.confirm(t('serviceRecords.confirmStart', 'Are you sure you want to start this service?'))) {
      startServiceMutation.mutate();
    }
  };

  const handleCompleteService = () => {
    if (record) {
      setFinalPrice(record.agreedPrice);
      setShowCompleteModal(true);
    }
  };

  const submitCompletion = () => {
    completeServiceMutation.mutate({ finalPrice, completionNotes });
  };

  const handleCancelService = () => {
    const reason = window.prompt(t('serviceRecords.cancelReason', 'Please provide a reason for cancellation (optional):'));
    if (reason !== null) {
      cancelServiceMutation.mutate(reason || undefined);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {t('serviceRecords.notFound', 'Service record not found')}
          </p>
          <Link
            to="/expert/service-records"
            className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
          >
            {t('common.back', 'Back to list')}
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[record.status];
  const StatusIcon = statusInfo.icon;

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={clsx(
              'w-4 h-4',
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            )}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/expert/service-records')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back', 'Back')}
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full',
                statusInfo.bgColor,
                statusInfo.color
              )}>
                <StatusIcon className="w-4 h-4" />
                {t(`serviceStatus.${record.status}`, statusInfo.label)}
              </span>
              <span className="text-sm text-gray-500 font-mono">{record.recordCode}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{record.serviceTitle}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Service Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t('serviceRecords.serviceDetails', 'Service Details')}
            </h2>

            {record.serviceDescription && (
              <div className="mb-4">
                <label className="text-sm text-gray-500">{t('common.description', 'Description')}</label>
                <p className="text-gray-900 mt-1">{record.serviceDescription}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">{t('serviceRecords.serviceType', 'Service Type')}</label>
                <p className="text-gray-900 mt-1">{record.serviceType}</p>
              </div>
              {record.serviceLocation && (
                <div>
                  <label className="text-sm text-gray-500">{t('serviceRecords.location', 'Location')}</label>
                  <p className="text-gray-900 mt-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {record.serviceLocation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Schedule & Duration */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {t('serviceRecords.schedule', 'Schedule')}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {record.scheduledStart && (
                <div>
                  <label className="text-sm text-gray-500">{t('serviceRecords.scheduledStart', 'Scheduled Start')}</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(record.scheduledStart).toLocaleString()}
                  </p>
                </div>
              )}
              {record.scheduledEnd && (
                <div>
                  <label className="text-sm text-gray-500">{t('serviceRecords.scheduledEnd', 'Scheduled End')}</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(record.scheduledEnd).toLocaleString()}
                  </p>
                </div>
              )}
              {record.actualStart && (
                <div>
                  <label className="text-sm text-gray-500">{t('serviceRecords.actualStart', 'Actual Start')}</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(record.actualStart).toLocaleString()}
                  </p>
                </div>
              )}
              {record.actualEnd && (
                <div>
                  <label className="text-sm text-gray-500">{t('serviceRecords.actualEnd', 'Actual End')}</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(record.actualEnd).toLocaleString()}
                  </p>
                </div>
              )}
              {record.estimatedDuration && (
                <div>
                  <label className="text-sm text-gray-500">{t('serviceRecords.estimatedDuration', 'Estimated Duration')}</label>
                  <p className="text-gray-900 mt-1">{record.estimatedDuration}</p>
                </div>
              )}
              {record.actualDuration && (
                <div>
                  <label className="text-sm text-gray-500">{t('serviceRecords.actualDuration', 'Actual Duration')}</label>
                  <p className="text-gray-900 mt-1">{record.actualDuration}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {t('serviceRecords.pricing', 'Pricing')}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">{t('serviceRecords.agreedPrice', 'Agreed Price')}</label>
                <p className="text-gray-900 mt-1 text-lg font-semibold">
                  {record.priceCurrency} {record.agreedPrice.toLocaleString()}
                </p>
              </div>
              {record.finalPrice && record.finalPrice !== record.agreedPrice && (
                <div>
                  <label className="text-sm text-gray-500">{t('serviceRecords.finalPrice', 'Final Price')}</label>
                  <p className="text-gray-900 mt-1 text-lg font-semibold">
                    {record.priceCurrency} {record.finalPrice.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {(record.expertNotes || record.customerNotes || record.completionNotes) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {t('serviceRecords.notes', 'Notes')}
              </h2>

              <div className="space-y-4">
                {record.expertNotes && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className="text-sm text-blue-600 font-medium">{t('serviceRecords.expertNotes', 'Expert Notes')}</label>
                    <p className="text-gray-900 mt-1">{record.expertNotes}</p>
                  </div>
                )}
                {record.customerNotes && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <label className="text-sm text-purple-600 font-medium">{t('serviceRecords.customerNotes', 'Customer Notes')}</label>
                    <p className="text-gray-900 mt-1">{record.customerNotes}</p>
                  </div>
                )}
                {record.completionNotes && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <label className="text-sm text-green-600 font-medium">{t('serviceRecords.completionNotes', 'Completion Notes')}</label>
                    <p className="text-gray-900 mt-1">{record.completionNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancellation Info */}
          {record.status === 'CANCELLED' && (
            <div className="bg-red-50 rounded-lg border border-red-200 p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {t('serviceRecords.cancellationDetails', 'Cancellation Details')}
              </h2>

              <div className="space-y-2">
                {record.cancelledAt && (
                  <p className="text-sm text-red-700">
                    <span className="font-medium">{t('serviceRecords.cancelledAt', 'Cancelled at')}:</span>{' '}
                    {new Date(record.cancelledAt).toLocaleString()}
                  </p>
                )}
                {record.cancellationReason && (
                  <p className="text-sm text-red-700">
                    <span className="font-medium">{t('serviceRecords.reason', 'Reason')}:</span>{' '}
                    {record.cancellationReason}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Review */}
          {record.review && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                {t('serviceRecords.customerReview', 'Customer Review')}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">{t('serviceRecords.overallRating', 'Overall Rating')}</label>
                  <div className="mt-1">{renderRatingStars(record.review.overallRating)}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {record.review.qualityRating && (
                    <div>
                      <label className="text-sm text-gray-500">{t('serviceRecords.quality', 'Quality')}</label>
                      <div className="mt-1">{renderRatingStars(record.review.qualityRating)}</div>
                    </div>
                  )}
                  {record.review.communicationRating && (
                    <div>
                      <label className="text-sm text-gray-500">{t('serviceRecords.communication', 'Communication')}</label>
                      <div className="mt-1">{renderRatingStars(record.review.communicationRating)}</div>
                    </div>
                  )}
                  {record.review.punctualityRating && (
                    <div>
                      <label className="text-sm text-gray-500">{t('serviceRecords.punctuality', 'Punctuality')}</label>
                      <div className="mt-1">{renderRatingStars(record.review.punctualityRating)}</div>
                    </div>
                  )}
                  {record.review.valueRating && (
                    <div>
                      <label className="text-sm text-gray-500">{t('serviceRecords.valueForMoney', 'Value for Money')}</label>
                      <div className="mt-1">{renderRatingStars(record.review.valueRating)}</div>
                    </div>
                  )}
                </div>

                {record.review.reviewText && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <p className="text-gray-700 italic">"{record.review.reviewText}"</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(record.review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Customer Info & Actions */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              {t('serviceRecords.customerInfo', 'Customer Information')}
            </h2>

            <div className="space-y-3">
              {record.customerUser?.name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{record.customerUser.name}</span>
                </div>
              )}
              {record.customerOrg?.name && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{record.customerOrg.name}</span>
                </div>
              )}
              {(record.serviceRequest?.contactPhone || record.customerOrg?.phone) && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${record.serviceRequest?.contactPhone || record.customerOrg?.phone}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {record.serviceRequest?.contactPhone || record.customerOrg?.phone}
                  </a>
                </div>
              )}
              {(record.customerUser?.email || record.customerOrg?.email || record.serviceRequest?.contactEmail) && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${record.customerUser?.email || record.customerOrg?.email || record.serviceRequest?.contactEmail}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    {record.customerUser?.email || record.customerOrg?.email || record.serviceRequest?.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Status Info */}
          <div className={clsx(
            'rounded-lg border p-6',
            statusInfo.bgColor,
            statusInfo.borderColor
          )}>
            <div className="flex items-center gap-2 mb-3">
              <StatusIcon className={clsx('w-5 h-5', statusInfo.color)} />
              <span className={clsx('font-semibold', statusInfo.color)}>
                {t(`serviceStatus.${record.status}`, statusInfo.label)}
              </span>
            </div>

            {record.status === 'COMPLETED' && !record.confirmedByCustomer && (
              <p className="text-sm text-yellow-700">
                {t('serviceRecords.awaitingConfirmation', 'Awaiting customer confirmation')}
              </p>
            )}
            {record.status === 'COMPLETED' && record.confirmedByCustomer && (
              <p className="text-sm text-green-700 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {t('serviceRecords.customerConfirmed', 'Customer confirmed')}
                {record.confirmedAt && ` - ${new Date(record.confirmedAt).toLocaleDateString()}`}
              </p>
            )}
            {record.completedAt && (
              <p className="text-sm mt-2 text-gray-600">
                {t('serviceRecords.completedAt', 'Completed')}: {new Date(record.completedAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Actions */}
          {(record.status === 'PENDING' || record.status === 'IN_PROGRESS') && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('common.actions', 'Actions')}
              </h2>

              <div className="space-y-3">
                {record.status === 'PENDING' && (
                  <>
                    <button
                      onClick={handleStartService}
                      disabled={startServiceMutation.isPending}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                    >
                      <Play className="w-4 h-4" />
                      {startServiceMutation.isPending
                        ? t('common.loading', 'Loading...')
                        : t('serviceRecords.startService', 'Start Service')}
                    </button>
                    <button
                      onClick={handleCancelService}
                      disabled={cancelServiceMutation.isPending}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      {t('serviceRecords.cancelService', 'Cancel Service')}
                    </button>
                  </>
                )}
                {record.status === 'IN_PROGRESS' && (
                  <>
                    <button
                      onClick={handleCompleteService}
                      disabled={completeServiceMutation.isPending}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t('serviceRecords.completeService', 'Complete Service')}
                    </button>
                    <button
                      onClick={handleCancelService}
                      disabled={cancelServiceMutation.isPending}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      {t('serviceRecords.cancelService', 'Cancel Service')}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {t('common.timestamps', 'Timestamps')}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{t('common.created', 'Created')}:</span>
                <span>{new Date(record.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {record.priceCurrency}
                  </span>
                  <input
                    type="number"
                    value={finalPrice || ''}
                    onChange={(e) => setFinalPrice(parseFloat(e.target.value) || undefined)}
                    className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
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
                  setShowCompleteModal(false);
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
  );
}
