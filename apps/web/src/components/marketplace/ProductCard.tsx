import { Link } from 'react-router-dom';
import { Package, MapPin, Clock, Eye, MessageSquare, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MarketplaceListingStatus, PRODUCT_TYPE_NAMES } from '@device-passport/shared';

interface ProductCardProps {
  product: {
    id: string;
    listingTitle: string;
    description?: string;
    productCategory?: string;
    minPrice?: number;
    maxPrice?: number;
    priceCurrency?: string;
    priceUnit?: string;
    showPrice?: boolean;
    supplyRegion?: string;
    leadTimeDays?: number;
    isFeatured?: boolean;
    viewCount?: number;
    inquiryCount?: number;
    status: MarketplaceListingStatus;
    organization?: {
      name: string;
      code: string;
    };
  };
  onContact?: () => void;
  showActions?: boolean;
}

export default function ProductCard({ product, onContact, showActions = true }: ProductCardProps) {
  const { t } = useTranslation();

  const formatPrice = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return t('marketplace.priceOnRequest', 'Price on request');
    if (min && max && min !== max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    return `${currency} ${(min || max)?.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {product.isFeatured && (
        <div className="bg-yellow-400 text-yellow-900 text-xs font-medium px-3 py-1 flex items-center gap-1">
          <Star className="w-3 h-3" />
          {t('marketplace.featured', 'Featured')}
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <Link
              to={`/marketplace/products/${product.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
            >
              {product.listingTitle}
            </Link>
            {product.organization && (
              <p className="text-sm text-gray-500 mt-1">
                {product.organization.name}
              </p>
            )}
          </div>
        </div>

        {/* Category badge */}
        {product.productCategory && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-3">
            <Package className="w-3 h-3 mr-1" />
            {PRODUCT_TYPE_NAMES[product.productCategory as keyof typeof PRODUCT_TYPE_NAMES] || product.productCategory}
          </span>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mb-3">
          {product.showPrice ? (
            <div className="text-xl font-bold text-green-600">
              {formatPrice(product.minPrice, product.maxPrice, product.priceCurrency)}
              {product.priceUnit && (
                <span className="text-sm font-normal text-gray-500 ml-1">
                  / {product.priceUnit}
                </span>
              )}
            </div>
          ) : (
            <div className="text-lg font-medium text-gray-500">
              {t('marketplace.priceOnRequest', 'Price on request')}
            </div>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
          {product.supplyRegion && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {product.supplyRegion}
            </span>
          )}
          {product.leadTimeDays && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {product.leadTimeDays} {t('marketplace.days', 'days')}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {product.viewCount || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {product.inquiryCount || 0}
          </span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Link
              to={`/marketplace/products/${product.id}`}
              className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('marketplace.viewDetails', 'View Details')}
            </Link>
            {onContact && (
              <button
                onClick={onContact}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                {t('marketplace.contact', 'Contact')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
