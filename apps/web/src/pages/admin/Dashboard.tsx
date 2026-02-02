import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, ClipboardList, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { passportApi, serviceOrderApi } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { UserRole, DeviceStatus, ServiceOrderStatus } from '@device-passport/shared';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, hasRole } = useAuthStore();

  const { data: passports } = useQuery({
    queryKey: ['passports', { limit: 5 }],
    queryFn: () => passportApi.getAll({ limit: 5 }),
  });

  const { data: serviceOrders } = useQuery({
    queryKey: ['service-orders', { limit: 5 }],
    queryFn: () => serviceOrderApi.getAll({ limit: 5 }),
  });

  const stats = [
    {
      name: t('dashboard.totalDevices'),
      value: passports?.meta?.total || 0,
      icon: Package,
      color: 'bg-blue-500',
      href: '/passports',
    },
    {
      name: t('dashboard.inService'),
      value:
        passports?.data?.filter((p: { status: DeviceStatus }) => p.status === DeviceStatus.IN_SERVICE)
          .length || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      href: '/passports?status=IN_SERVICE',
    },
    {
      name: t('dashboard.openOrders'),
      value:
        serviceOrders?.data?.filter(
          (o: { status: ServiceOrderStatus }) =>
            o.status !== ServiceOrderStatus.COMPLETED && o.status !== ServiceOrderStatus.CANCELLED
        ).length || 0,
      icon: ClipboardList,
      color: 'bg-yellow-500',
      href: '/service-orders',
    },
    {
      name: t('dashboard.qcPending'),
      value:
        passports?.data?.filter((p: { status: DeviceStatus }) => p.status === DeviceStatus.IN_QC)
          .length || 0,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      href: '/passports?status=IN_QC',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Device Passport System</title>
      </Helmet>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-600">{t('dashboard.welcome')}, {user?.name}</p>
        </div>
        {hasRole([UserRole.OPERATOR]) && (
          <Link to="/passports/create" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            {t('passport.create')}
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.href} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Passports */}
        <div className="card">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t('dashboard.recentPassports')}</h2>
            <Link to="/passports" className="text-sm text-primary-600 hover:text-primary-500">
              {t('dashboard.viewAll')}
            </Link>
          </div>
          <div className="divide-y">
            {passports?.data?.slice(0, 5).map((passport: {
              id: string;
              passportCode: string;
              deviceName: string;
              status: DeviceStatus;
            }) => (
              <Link
                key={passport.id}
                to={`/passports/${passport.id}`}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{passport.passportCode}</p>
                  <p className="text-sm text-gray-600">{passport.deviceName}</p>
                </div>
                <span className="badge-info">{passport.status.replace(/_/g, ' ')}</span>
              </Link>
            ))}
            {(!passports?.data || passports.data.length === 0) && (
              <p className="p-4 text-gray-500 text-center">{t('dashboard.noPassportsYet')}</p>
            )}
          </div>
        </div>

        {/* Recent Service Orders */}
        <div className="card">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t('dashboard.recentOrders')}</h2>
            <Link to="/service-orders" className="text-sm text-primary-600 hover:text-primary-500">
              {t('dashboard.viewAll')}
            </Link>
          </div>
          <div className="divide-y">
            {serviceOrders?.data?.slice(0, 5).map((order: {
              id: string;
              orderNumber: string;
              title: string;
              status: ServiceOrderStatus;
            }) => (
              <Link
                key={order.id}
                to={`/service-orders/${order.id}`}
                className="p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{order.title}</p>
                </div>
                <span className="badge-warning">{order.status}</span>
              </Link>
            ))}
            {(!serviceOrders?.data || serviceOrders.data.length === 0) && (
              <p className="p-4 text-gray-500 text-center">{t('dashboard.noOrdersYet')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
