import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { History, Star, Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { expertApi } from '../../services/api';
import clsx from 'clsx';

interface ServiceRecord {
  id: string;
  serviceOrderId: string;
  serviceOrderCode: string;
  title: string;
  description: string;
  customerName: string;
  customerOrganization: string;
  location: string;
  serviceDate: string;
  completedAt: string;
  status: 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  rating?: number;
  review?: string;
  reviewedAt?: string;
}

const statusConfig = {
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
  IN_PROGRESS: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'In Progress',
  },
};

export default function ServiceRecords() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const { data: records, isLoading } = useQuery({
    queryKey: ['expert-service-records', user?.expertId],
    queryFn: () => expertApi.getServiceRecords(user?.expertId!),
    enabled: !!user?.expertId,
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={clsx(
              'w-4 h-4',
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    );
  };

  const calculateStats = () => {
    if (!records || records.length === 0) {
      return { total: 0, completed: 0, avgRating: 0, totalReviews: 0 };
    }

    const completed = records.filter((r: ServiceRecord) => r.status === 'COMPLETED').length;
    const withRating = records.filter((r: ServiceRecord) => r.rating);
    const avgRating = withRating.length > 0
      ? withRating.reduce((sum: number, r: ServiceRecord) => sum + (r.rating || 0), 0) / withRating.length
      : 0;

    return {
      total: records.length,
      completed,
      avgRating: avgRating.toFixed(1),
      totalReviews: withRating.length,
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
          <p className="text-sm text-gray-500">{t('expert.completed', 'Completed')}</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('expert.avgRating', 'Avg. Rating')}</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-yellow-600">{stats.avgRating}</p>
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">{t('expert.totalReviews', 'Total Reviews')}</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalReviews}</p>
        </div>
      </div>

      {/* Service Records List */}
      {records && records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record: ServiceRecord) => {
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
                      <span className="text-sm text-gray-500">
                        {record.serviceOrderCode}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {record.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {record.description}
                    </p>
                  </div>
                  <Link
                    to={`/service-orders/${record.serviceOrderId}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {t('common.viewDetails', 'View Details')}
                  </Link>
                </div>

                {/* Service Details */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(record.serviceDate).toLocaleDateString()}
                  </span>
                  {record.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {record.location}
                    </span>
                  )}
                  {record.completedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {t('expert.completedOn', 'Completed')}: {new Date(record.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Customer Info */}
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">{t('expert.customer', 'Customer')}:</span>{' '}
                  {record.customerName}
                  {record.customerOrganization && ` (${record.customerOrganization})`}
                </div>

                {/* Rating and Review */}
                {record.rating && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {t('expert.customerRating', 'Customer Rating')}:
                      </span>
                      {renderStars(record.rating)}
                      <span className="text-sm text-gray-500">({record.rating}/5)</span>
                    </div>
                    {record.review && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700 italic">"{record.review}"</p>
                        {record.reviewedAt && (
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(record.reviewedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
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
    </div>
  );
}
