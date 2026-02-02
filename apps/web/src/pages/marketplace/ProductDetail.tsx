import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Package,
  Eye,
  MessageSquare,
  Star,
  Send,
} from 'lucide-react';
import { marketplaceProductApi } from '../../services/api';
import { SaveButton } from '../../components/marketplace';
import { PRODUCT_TYPE_NAMES, SavedItemType } from '@device-passport/shared';
import { useAuthStore } from '../../store/auth.store';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['marketplace-product', id],
    queryFn: () => marketplaceProductApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Loading... - Products - Device Passport System</title>
        </Helmet>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Helmet>
          <title>Product Not Found - Device Passport System</title>
        </Helmet>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-red-600">{t('marketplace.productNotFound', 'Product not found')}</p>
          <Link to="/marketplace/products" className="text-blue-600 hover:underline mt-2 inline-block">
            {t('marketplace.backToProducts', 'Back to products')}
          </Link>
        </div>
      </>
    );
  }

  const formatPrice = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return t('marketplace.priceOnRequest', 'Price on request');
    if (min && max && min !== max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    return `${currency} ${(min || max)?.toLocaleString()}`;
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/marketplace/products/${id}` } });
      return;
    }
    // Navigate to create inquiry with pre-filled data
    navigate('/inquiries/create', {
      state: {
        productId: product.id,
        productTitle: product.listingTitle,
        supplierOrgId: product.organizationId,
        supplierName: product.organization?.name,
      },
    });
  };

  return (
    <>
      <Helmet>
        <title>{product.listingTitle} - Products - Device Passport System</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        to="/marketplace/products"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('marketplace.backToProducts', 'Back to products')}
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {product.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full mb-2">
                  <Star className="w-3 h-3" />
                  {t('marketplace.featured', 'Featured')}
                </span>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{product.listingTitle}</h1>
              {product.organization && (
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{product.organization.name}</span>
                </div>
              )}
            </div>
            {isAuthenticated && (
              <SaveButton itemType={SavedItemType.PRODUCT} itemId={product.id} size="lg" />
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 space-y-6">
          {/* Category and stats */}
          <div className="flex flex-wrap items-center gap-4">
            {product.productCategory && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <Package className="w-4 h-4 mr-1" />
                {PRODUCT_TYPE_NAMES[product.productCategory as keyof typeof PRODUCT_TYPE_NAMES]}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              {product.viewCount || 0} {t('marketplace.views', 'views')}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <MessageSquare className="w-4 h-4" />
              {product.inquiryCount || 0} {t('marketplace.inquiries', 'inquiries')}
            </span>
          </div>

          {/* Price */}
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('marketplace.price', 'Price')}</p>
            {product.showPrice ? (
              <p className="text-3xl font-bold text-green-600">
                {formatPrice(product.minPrice, product.maxPrice, product.priceCurrency)}
                {product.priceUnit && (
                  <span className="text-lg font-normal text-gray-500 ml-2">
                    / {product.priceUnit}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xl font-medium text-gray-600">
                {t('marketplace.priceOnRequest', 'Price on request')}
              </p>
            )}
            {product.minOrderQuantity && (
              <p className="text-sm text-gray-500 mt-2">
                {t('marketplace.moq', 'Min. Order')}: {product.minOrderQuantity} {t('marketplace.units', 'units')}
              </p>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t('marketplace.description', 'Description')}
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.supplyRegion && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('marketplace.supplyRegion', 'Supply Region')}</p>
                  <p className="font-medium">{product.supplyRegion}</p>
                </div>
              </div>
            )}
            {product.leadTimeDays && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('marketplace.leadTime', 'Lead Time')}</p>
                  <p className="font-medium">{product.leadTimeDays} {t('marketplace.days', 'days')}</p>
                </div>
              </div>
            )}
            {product.hsCode && (
              <div>
                <p className="text-sm text-gray-500">{t('marketplace.hsCode', 'HS Code')}</p>
                <p className="font-medium font-mono">{product.hsCode}</p>
              </div>
            )}
          </div>

          {/* Contact button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleContact}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {t('marketplace.contactSupplier', 'Contact Supplier')}
            </button>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
