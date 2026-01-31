import { Link } from 'react-router-dom';
import { FileText, MapPin, Calendar, Eye, Users, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RFQStatus, PRODUCT_TYPE_NAMES, PURCHASE_FREQUENCY_NAMES } from '@device-passport/shared';

interface RFQCardProps {
  rfq: {
    id: string;
    title: string;
    description?: string;
    productCategory?: string;
    quantity?: number;
    quantityUnit?: string;
    purchaseFrequency?: string;
    budgetMin?: number;
    budgetMax?: number;
    budgetCurrency?: string;
    preferredRegions?: string[];
    deliveryDeadline?: string;
    validUntil?: string;
    viewCount?: number;
    quoteCount?: number;
    status: RFQStatus;
    showCompanyInfo?: boolean;
    organization?: {
      name: string;
      code: string;
    };
    createdAt: string;
  };
  onQuote?: () => void;
  showActions?: boolean;
}

export default function RFQCard({ rfq, onQuote, showActions = true }: RFQCardProps) {
  const { t } = useTranslation();

  const formatBudget = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return t('marketplace.budgetFlexible', 'Flexible');
    if (min && max && min !== max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    return `${currency} ${(min || max)?.toLocaleString()}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString();
  };

  const isExpiringSoon = () => {
    if (!rfq.validUntil) return false;
    const daysLeft = Math.ceil((new Date(rfq.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7 && daysLeft > 0;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {isExpiringSoon() && (
        <div className="bg-orange-400 text-orange-900 text-xs font-medium px-3 py-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {t('marketplace.expiringSoon', 'Expiring soon')}
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <Link
              to={`/marketplace/rfqs/${rfq.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
            >
              {rfq.title}
            </Link>
            {rfq.showCompanyInfo && rfq.organization && (
              <p className="text-sm text-gray-500 mt-1">
                {rfq.organization.name}
              </p>
            )}
          </div>
        </div>

        {/* Category badge */}
        {rfq.productCategory && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-3">
            <FileText className="w-3 h-3 mr-1" />
            {PRODUCT_TYPE_NAMES[rfq.productCategory as keyof typeof PRODUCT_TYPE_NAMES] || rfq.productCategory}
          </span>
        )}

        {/* Description */}
        {rfq.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {rfq.description}
          </p>
        )}

        {/* Quantity and frequency */}
        <div className="flex flex-wrap gap-4 mb-3">
          {rfq.quantity && (
            <div>
              <span className="text-sm text-gray-500">{t('marketplace.quantity', 'Quantity')}: </span>
              <span className="font-medium">
                {rfq.quantity.toLocaleString()} {rfq.quantityUnit || 'units'}
              </span>
            </div>
          )}
          {rfq.purchaseFrequency && (
            <div>
              <span className="text-sm text-gray-500">{t('marketplace.frequency', 'Frequency')}: </span>
              <span className="font-medium">
                {PURCHASE_FREQUENCY_NAMES[rfq.purchaseFrequency as keyof typeof PURCHASE_FREQUENCY_NAMES] || rfq.purchaseFrequency}
              </span>
            </div>
          )}
        </div>

        {/* Budget */}
        <div className="mb-3">
          <span className="text-sm text-gray-500">{t('marketplace.budget', 'Budget')}: </span>
          <span className="text-lg font-bold text-blue-600">
            {formatBudget(rfq.budgetMin, rfq.budgetMax, rfq.budgetCurrency)}
          </span>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
          {rfq.preferredRegions && rfq.preferredRegions.length > 0 && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {rfq.preferredRegions.slice(0, 2).join(', ')}
              {rfq.preferredRegions.length > 2 && ` +${rfq.preferredRegions.length - 2}`}
            </span>
          )}
          {rfq.deliveryDeadline && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {t('marketplace.needBy', 'Need by')}: {formatDate(rfq.deliveryDeadline)}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {rfq.viewCount || 0} {t('marketplace.views', 'views')}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {rfq.quoteCount || 0} {t('marketplace.quotes', 'quotes')}
          </span>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Link
              to={`/marketplace/rfqs/${rfq.id}`}
              className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('marketplace.viewDetails', 'View Details')}
            </Link>
            {onQuote && (
              <button
                onClick={onQuote}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700"
              >
                {t('marketplace.submitQuote', 'Submit Quote')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
