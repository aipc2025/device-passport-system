import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { serviceOrderApi } from '../../services/api';
import { ServiceOrderStatus, ServicePriority, ServiceOrderListItem } from '@device-passport/shared';
import { format } from 'date-fns';
import clsx from 'clsx';

const statusColors: Record<ServiceOrderStatus, string> = {
  [ServiceOrderStatus.PENDING]: 'badge-warning',
  [ServiceOrderStatus.ASSIGNED]: 'badge-info',
  [ServiceOrderStatus.IN_PROGRESS]: 'badge-info',
  [ServiceOrderStatus.ON_HOLD]: 'badge-warning',
  [ServiceOrderStatus.COMPLETED]: 'badge-success',
  [ServiceOrderStatus.CANCELLED]: 'badge-gray',
};

const priorityColors: Record<ServicePriority, string> = {
  [ServicePriority.LOW]: 'badge-gray',
  [ServicePriority.MEDIUM]: 'badge-info',
  [ServicePriority.HIGH]: 'badge-warning',
  [ServicePriority.URGENT]: 'badge-danger',
};

export default function ServiceOrderList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['service-orders', { page, search, status }],
    queryFn: () =>
      serviceOrderApi.getAll({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
      }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  return (
    <>
      <Helmet>
        <title>Service Orders - Device Passport System</title>
      </Helmet>
      <div className="space-y-6">
        {/* Header */}
        <div>
        <h1 className="text-2xl font-bold text-gray-900">Service Orders</h1>
        <p className="text-gray-600">Manage service requests and work orders</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or title..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
          <select
            className="input w-auto"
            value={status}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              if (e.target.value) {
                params.set('status', e.target.value);
              } else {
                params.delete('status');
              }
              params.set('page', '1');
              setSearchParams(params);
            }}
          >
            <option value="">All Status</option>
            {Object.values(ServiceOrderStatus).map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No service orders found
                  </td>
                </tr>
              ) : (
                data?.data?.map((order: ServiceOrderListItem) => (
                  <tr
                    key={order.id}
                    className={clsx(
                      'hover:bg-gray-50',
                      order.isUrgent && 'bg-red-50 hover:bg-red-100'
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {order.isUrgent && (
                          <span className="flex items-center" title="Urgent Service Request">
                            <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
                          </span>
                        )}
                        <Link
                          to={`/service-orders/${order.id}`}
                          className={clsx(
                            'font-mono',
                            order.isUrgent
                              ? 'text-red-600 hover:text-red-900 font-bold'
                              : 'text-primary-600 hover:text-primary-900'
                          )}
                        >
                          {order.orderNumber}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={clsx(
                        'text-sm font-medium max-w-xs truncate',
                        order.isUrgent ? 'text-red-900' : 'text-gray-900'
                      )}>
                        {order.isUrgent && (
                          <span className="inline-block px-2 py-0.5 mr-2 text-xs font-bold text-white bg-red-600 rounded">
                            URGENT
                          </span>
                        )}
                        {order.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm">{order.passportCode}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{order.serviceType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx('badge', priorityColors[order.priority])}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx('badge', statusColors[order.status])}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.meta.total)} of{' '}
              {data.meta.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="btn-secondary p-2 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= data.meta.totalPages}
                className="btn-secondary p-2 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
