import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Grid, List, Loader2 } from 'lucide-react';
import { marketplaceRfqApi } from '../../services/api';
import { useMarketplaceStore } from '../../store/marketplace.store';
import { RFQCard, SearchFilters } from '../../components/marketplace';
import clsx from 'clsx';

export default function RFQList() {
  const { t } = useTranslation();
  const { filters, sortBy, sortOrder, viewMode, setViewMode } = useMarketplaceStore();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['marketplace-rfqs', filters, sortBy, sortOrder, page],
    queryFn: () =>
      marketplaceRfqApi.search({
        ...filters,
        sortBy,
        sortOrder,
        page,
        limit,
      }),
  });

  const rfqs = data?.items || [];
  const meta = data?.meta || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {t('marketplace.rfqs', 'Buyer Requirements (RFQs)')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('marketplace.browseRfqs', 'Browse active buyer requirements and submit your quotes')}
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-6">
        <SearchFilters onSearch={() => refetch()} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {meta.total} {t('marketplace.rfqsFound', 'RFQs found')}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'p-2 rounded-md',
              viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:bg-gray-100'
            )}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'p-2 rounded-md',
              viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:bg-gray-100'
            )}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* RFQ grid/list */}
      {!isLoading && rfqs.length > 0 && (
        <div
          className={clsx(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          )}
        >
          {rfqs.map((rfq: any) => (
            <RFQCard key={rfq.id} rfq={rfq} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && rfqs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('marketplace.noRfqs', 'No RFQs found')}</p>
          <p className="text-sm text-gray-400 mt-1">
            {t('marketplace.tryDifferentFilters', 'Try adjusting your search filters')}
          </p>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
          >
            {t('common.previous', 'Previous')}
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            {page} / {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
          >
            {t('common.next', 'Next')}
          </button>
        </div>
      )}
    </div>
  );
}
