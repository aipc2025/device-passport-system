import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Package,
  Eye,
  Users,
  Send,
  Clock,
} from 'lucide-react';
import { marketplaceRfqApi } from '../../services/api';
import { SaveButton } from '../../components/marketplace';
import {
  PRODUCT_TYPE_NAMES,
  PURCHASE_FREQUENCY_NAMES,
  SavedItemType,
  RFQStatus,
} from '@device-passport/shared';
import { useAuthStore } from '../../store/auth.store';

export default function RFQDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const { data: rfq, isLoading, error } = useQuery({
    queryKey: ['marketplace-rfq', id],
    queryFn: () => marketplaceRfqApi.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !rfq) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600">{t('marketplace.rfqNotFound', 'RFQ not found')}</p>
        <Link to="/marketplace/rfqs" className="text-blue-600 hover:underline mt-2 inline-block">
          {t('marketplace.backToRfqs', 'Back to RFQs')}
        </Link>
      </div>
    );
  }

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

  const handleSubmitQuote = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/marketplace/rfqs/${id}` } });
      return;
    }
    navigate('/inquiries/create', {
      state: {
        rfqId: rfq.id,
        rfqTitle: rfq.title,
        buyerOrgId: rfq.organizationId,
        buyerName: rfq.organization?.name,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        to="/marketplace/rfqs"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('marketplace.backToRfqs', 'Back to RFQs')}
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full mb-2">
                {rfq.status === RFQStatus.OPEN ? t('marketplace.open', 'Open') : rfq.status}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">{rfq.title}</h1>
              {rfq.showCompanyInfo && rfq.organization && (
                <div className="flex items-center gap-2 mt-2 text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>{rfq.organization.name}</span>
                </div>
              )}
            </div>
            {isAuthenticated && (
              <SaveButton itemType={SavedItemType.RFQ} itemId={rfq.id} size="lg" />
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 space-y-6">
          {/* Category and stats */}
          <div className="flex flex-wrap items-center gap-4">
            {rfq.productCategory && (
              <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                <Package className="w-4 h-4 mr-1" />
                {PRODUCT_TYPE_NAMES[rfq.productCategory as keyof typeof PRODUCT_TYPE_NAMES]}
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              {rfq.viewCount || 0} {t('marketplace.views', 'views')}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              {rfq.quoteCount || 0} {t('marketplace.quotes', 'quotes')}
            </span>
          </div>

          {/* Budget */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">{t('marketplace.budget', 'Budget')}</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatBudget(rfq.budgetMin, rfq.budgetMax, rfq.budgetCurrency)}
            </p>
          </div>

          {/* Quantity and frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rfq.quantity && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">{t('marketplace.quantity', 'Quantity')}</p>
                <p className="text-xl font-semibold">
                  {rfq.quantity.toLocaleString()} {rfq.quantityUnit || 'units'}
                </p>
              </div>
            )}
            {rfq.purchaseFrequency && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">{t('marketplace.purchaseFrequency', 'Purchase Frequency')}</p>
                <p className="text-xl font-semibold">
                  {PURCHASE_FREQUENCY_NAMES[rfq.purchaseFrequency as keyof typeof PURCHASE_FREQUENCY_NAMES]}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          {rfq.description && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {t('marketplace.requirements', 'Requirements')}
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{rfq.description}</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rfq.preferredRegions && rfq.preferredRegions.length > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('marketplace.preferredRegions', 'Preferred Regions')}</p>
                  <p className="font-medium">{rfq.preferredRegions.join(', ')}</p>
                </div>
              </div>
            )}
            {rfq.deliveryDeadline && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('marketplace.deliveryDeadline', 'Delivery Deadline')}</p>
                  <p className="font-medium">{formatDate(rfq.deliveryDeadline)}</p>
                </div>
              </div>
            )}
            {rfq.validUntil && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t('marketplace.validUntil', 'Valid Until')}</p>
                  <p className="font-medium">{formatDate(rfq.validUntil)}</p>
                </div>
              </div>
            )}
            {rfq.hsCode && (
              <div>
                <p className="text-sm text-gray-500">{t('marketplace.hsCode', 'HS Code')}</p>
                <p className="font-medium font-mono">{rfq.hsCode}</p>
              </div>
            )}
          </div>

          {/* Submit quote button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSubmitQuote}
              className="w-full md:w-auto px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {t('marketplace.submitQuote', 'Submit Quote')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
