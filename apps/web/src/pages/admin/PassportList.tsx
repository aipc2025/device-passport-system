import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { passportApi } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { UserRole, DeviceStatus, ProductLine, PassportListItem } from '@device-passport/shared';
import { format } from 'date-fns';
import clsx from 'clsx';

const statusColors: Record<string, string> = {
  CREATED: 'badge-gray',
  PROCURED: 'badge-info',
  IN_QC: 'badge-warning',
  QC_PASSED: 'badge-success',
  QC_FAILED: 'badge-danger',
  IN_ASSEMBLY: 'badge-info',
  IN_TESTING: 'badge-warning',
  TEST_PASSED: 'badge-success',
  TEST_FAILED: 'badge-danger',
  PACKAGED: 'badge-info',
  IN_TRANSIT: 'badge-warning',
  DELIVERED: 'badge-success',
  IN_SERVICE: 'badge-success',
  MAINTENANCE: 'badge-warning',
  RETIRED: 'badge-gray',
};

export default function PassportList() {
  const { t } = useTranslation();
  const { hasRole } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const page = parseInt(searchParams.get('page') || '1');
  const status = searchParams.get('status') || '';
  const productLine = searchParams.get('productLine') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['passports', { page, search, status, productLine }],
    queryFn: () =>
      passportApi.getAll({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
        productLine: productLine || undefined,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('passport.title')}</h1>
          <p className="text-gray-600">{t('passport.description')}</p>
        </div>
        {hasRole([UserRole.OPERATOR]) && (
          <Link to="/passports/create" className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            {t('passport.create')}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-4">
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.search') + '...'}
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
            <option value="">{t('common.allStatus')}</option>
            {Object.values(DeviceStatus).map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select
            className="input w-auto"
            value={productLine}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              if (e.target.value) {
                params.set('productLine', e.target.value);
              } else {
                params.delete('productLine');
              }
              params.set('page', '1');
              setSearchParams(params);
            }}
          >
            <option value="">{t('common.allProductTypes')}</option>
            {Object.values(ProductLine).map((pl) => (
              <option key={pl} value={pl}>
                {pl} - {t(`productTypes.${pl}`)}
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
                  {t('passport.passportCode')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('passport.device')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('passport.productType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('passport.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('passport.location')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('passport.createdAt')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {t('passport.noPassports')}
                  </td>
                </tr>
              ) : (
                data?.data?.map((passport: PassportListItem) => (
                  <tr key={passport.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/passports/${passport.id}`}
                        className="text-primary-600 hover:text-primary-900 font-mono"
                      >
                        {passport.passportCode}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{passport.deviceName}</div>
                      <div className="text-sm text-gray-500">{passport.deviceModel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge-gray">{passport.productLine}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx('badge', statusColors[passport.status])}>
                        {passport.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {passport.currentLocation || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(passport.createdAt), 'MMM d, yyyy')}
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
              {t('common.showing')} {(page - 1) * 10 + 1} {t('common.to')} {Math.min(page * 10, data.meta.total)} {t('common.of')}{' '}
              {data.meta.total} {t('common.results')}
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
  );
}
