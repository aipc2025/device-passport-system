import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductLine, PRODUCT_TYPE_NAMES } from '@device-passport/shared';
import { useMarketplaceStore } from '../../store/marketplace.store';

interface SearchFiltersProps {
  onSearch: () => void;
  showCategoryFilter?: boolean;
  showPriceFilter?: boolean;
  showRegionFilter?: boolean;
}

export default function SearchFilters({
  onSearch,
  showCategoryFilter = true,
  showPriceFilter = true,
  showRegionFilter = true,
}: SearchFiltersProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { filters, setFilters, resetFilters, sortBy, setSortBy, sortOrder, setSortOrder } = useMarketplaceStore();

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ keyword: e.target.value || undefined });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  const handleReset = () => {
    resetFilters();
    onSearch();
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Main search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.keyword || ''}
            onChange={handleKeywordChange}
            placeholder={t('marketplace.searchPlaceholder', 'Search products or requirements...')}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          {t('marketplace.search', 'Search')}
        </button>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </form>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            {showCategoryFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('marketplace.category', 'Category')}
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ category: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('marketplace.allCategories', 'All Categories')}</option>
                  {Object.entries(ProductLine).map(([, value]) => (
                    <option key={value} value={value}>
                      {PRODUCT_TYPE_NAMES[value as keyof typeof PRODUCT_TYPE_NAMES]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Price range */}
            {showPriceFilter && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('marketplace.minPrice', 'Min Price')}
                  </label>
                  <input
                    type="number"
                    value={filters.priceMin || ''}
                    onChange={(e) => setFilters({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('marketplace.maxPrice', 'Max Price')}
                  </label>
                  <input
                    type="number"
                    value={filters.priceMax || ''}
                    onChange={(e) => setFilters({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="No limit"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* Region */}
            {showRegionFilter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('marketplace.region', 'Region')}
                </label>
                <input
                  type="text"
                  value={filters.region || ''}
                  onChange={(e) => setFilters({ region: e.target.value || undefined })}
                  placeholder={t('marketplace.anyRegion', 'Any region')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Sort options */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                {t('marketplace.sortBy', 'Sort by')}:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">{t('marketplace.newest', 'Newest')}</option>
                <option value="price">{t('marketplace.price', 'Price')}</option>
                <option value="viewCount">{t('marketplace.popularity', 'Popularity')}</option>
                <option value="distance">{t('marketplace.distance', 'Distance')}</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                {sortOrder === 'ASC' ? '↑' : '↓'}
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
                {t('marketplace.clearFilters', 'Clear filters')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
