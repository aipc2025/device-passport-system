import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Package, FileText, ArrowRight, Users } from 'lucide-react';
import { marketplaceProductApi, marketplaceRfqApi } from '../../services/api';
import { ProductCard, RFQCard } from '../../components/marketplace';

export default function MarketplaceHome() {
  const { t } = useTranslation();

  const { data: featuredProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['marketplace-featured-products'],
    queryFn: () => marketplaceProductApi.getFeatured(8),
  });

  const { data: recentRfqs, isLoading: loadingRfqs } = useQuery({
    queryKey: ['marketplace-recent-rfqs'],
    queryFn: () => marketplaceRfqApi.getRecent(6),
  });

  return (
    <>
      <Helmet>
        <title>Marketplace - Device Passport System</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {t('marketplace.title', 'B2B Marketplace')}
        </h1>
        <p className="text-lg text-blue-100 mb-6 max-w-2xl">
          {t('marketplace.subtitle', 'Connect with verified suppliers and buyers. Find the best matches for your business needs.')}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/marketplace/products"
            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            <Package className="w-5 h-5 mr-2" />
            {t('marketplace.browseProducts', 'Browse Products')}
          </Link>
          <Link
            to="/marketplace/rfqs"
            className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-400 transition-colors"
          >
            <FileText className="w-5 h-5 mr-2" />
            {t('marketplace.viewRfqs', 'View RFQs')}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{featuredProducts?.length || 0}+</p>
            <p className="text-sm text-gray-500">{t('marketplace.activeProducts', 'Active Products')}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{recentRfqs?.length || 0}+</p>
            <p className="text-sm text-gray-500">{t('marketplace.openRfqs', 'Open RFQs')}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">100+</p>
            <p className="text-sm text-gray-500">{t('marketplace.verifiedCompanies', 'Verified Companies')}</p>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {t('marketplace.featuredProducts', 'Featured Products')}
          </h2>
          <Link
            to="/marketplace/products"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
          >
            {t('marketplace.viewAll', 'View All')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loadingProducts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        ) : featuredProducts && featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 8).map((product: any) => (
              <ProductCard key={product.id} product={product} showActions={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t('marketplace.noFeaturedProducts', 'No featured products yet')}
          </div>
        )}
      </section>

      {/* Recent RFQs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {t('marketplace.recentRfqs', 'Recent RFQs')}
          </h2>
          <Link
            to="/marketplace/rfqs"
            className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm font-medium"
          >
            {t('marketplace.viewAll', 'View All')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loadingRfqs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : recentRfqs && recentRfqs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentRfqs.slice(0, 6).map((rfq: any) => (
              <RFQCard key={rfq.id} rfq={rfq} showActions={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t('marketplace.noRfqs', 'No RFQs yet')}
          </div>
        )}
      </section>
      </div>
    </>
  );
}
