import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Target,
  CheckCircle,
  Clock,
  Clipboard,
  ArrowRight,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { expertApi } from '../../services/api';
import { ServiceRecordStatus, SERVICE_RECORD_STATUS_NAMES } from '@device-passport/shared';
import clsx from 'clsx';
import WorkStatusCard from '../../components/expert/WorkStatusCard';

interface DashboardStats {
  candidateOrders: number;
  acceptedOrders: number;
  inProgressOrders: number;
  recentOrders: {
    id: string;
    recordCode: string;
    serviceTitle: string;
    serviceType: string;
    status: ServiceRecordStatus;
    agreedPrice: number;
    priceCurrency: string;
    customerName: string;
    scheduledStart?: string;
    actualStart?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export default function ExpertDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['expert-dashboard', user?.expertId],
    queryFn: () => expertApi.getDashboardStats(user?.expertId || ''),
    enabled: !!user?.expertId,
  });

  const getStatusIcon = (status: ServiceRecordStatus) => {
    switch (status) {
      case ServiceRecordStatus.PENDING:
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case ServiceRecordStatus.IN_PROGRESS:
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case ServiceRecordStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case ServiceRecordStatus.CANCELLED:
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case ServiceRecordStatus.DISPUTED:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('expert.dashboard', 'Expert Dashboard')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('expert.dashboardDesc', 'Overview of your service orders and activities')}
        </p>
      </div>

      {/* Work Status Card */}
      <div className="mb-6">
        <WorkStatusCard />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Candidate Orders */}
        <Link
          to="/expert/matches"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t('expert.candidateOrders', 'Candidate Orders')}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.candidateOrders || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-600">
            {t('expert.viewMatches', 'View matches')}
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* Accepted Orders */}
        <Link
          to="/expert/service-records"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-green-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t('expert.acceptedOrders', 'Accepted Orders')}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.acceptedOrders || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            {t('expert.viewAccepted', 'View accepted')}
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        {/* In Progress Orders */}
        <Link
          to="/expert/service-records"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-orange-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {t('expert.inProgressOrders', 'In Progress')}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.inProgressOrders || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-orange-600">
            {t('expert.viewInProgress', 'View in progress')}
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clipboard className="w-5 h-5" />
            {t('expert.recentOrders', 'Recent Orders')}
          </h2>
          <Link
            to="/expert/service-records"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
          >
            {t('common.viewAll', 'View all')}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{order.serviceTitle}</h3>
                      <p className="text-sm text-gray-500">
                        {order.recordCode} | {order.serviceType}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {t('expert.customer', 'Customer')}: {order.customerName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={clsx(
                        'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                        getStatusColor(order.status)
                      )}
                    >
                      {SERVICE_RECORD_STATUS_NAMES[order.status]}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      {formatCurrency(order.agreedPrice, order.priceCurrency)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {order.scheduledStart && (
                    <span>
                      {t('expert.scheduled', 'Scheduled')}:{' '}
                      {new Date(order.scheduledStart).toLocaleDateString()}
                    </span>
                  )}
                  {order.completedAt && (
                    <span className="ml-4">
                      {t('expert.completed', 'Completed')}:{' '}
                      {new Date(order.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Clipboard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>{t('expert.noOrders', 'No orders yet')}</p>
            <p className="text-sm text-gray-400 mt-1">
              {t('expert.noOrdersDesc', 'Your service orders will appear here')}
            </p>
            <Link
              to="/expert/service-hall"
              className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700"
            >
              {t('expert.browseServiceHall', 'Browse Service Hall')}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/expert/service-hall"
          className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:border-blue-300 hover:shadow-md transition-all"
        >
          <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <span className="text-sm text-gray-700">{t('expert.serviceHall', 'Service Hall')}</span>
        </Link>
        <Link
          to="/expert/matches"
          className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:border-blue-300 hover:shadow-md transition-all"
        >
          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <span className="text-sm text-gray-700">{t('expert.myMatches', 'My Matches')}</span>
        </Link>
        <Link
          to="/expert/passport"
          className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:border-blue-300 hover:shadow-md transition-all"
        >
          <Clipboard className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <span className="text-sm text-gray-700">{t('expert.myPassport', 'My Passport')}</span>
        </Link>
        <Link
          to="/expert/profile"
          className="bg-white rounded-lg border border-gray-200 p-4 text-center hover:border-blue-300 hover:shadow-md transition-all"
        >
          <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <span className="text-sm text-gray-700">{t('expert.myProfile', 'My Profile')}</span>
        </Link>
      </div>
    </div>
  );
}
