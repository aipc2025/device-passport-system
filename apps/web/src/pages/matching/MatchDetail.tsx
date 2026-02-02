import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, MessageSquare, X, Package, FileText, Building2 } from 'lucide-react';
import { matchingApi } from '../../services/api';
import { MatchScoreBar } from '../../components/marketplace';
import { MatchStatus, PRODUCT_TYPE_NAMES } from '@device-passport/shared';
import toast from 'react-hot-toast';

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = searchParams.get('role') || 'buyer';

  const { data: match, isLoading, error } = useQuery({
    queryKey: ['match', id, role],
    queryFn: () => matchingApi.getMatchById(id!, role as 'supplier' | 'buyer'),
    enabled: !!id,
  });

  const dismissMutation = useMutation({
    mutationFn: () => matchingApi.dismissMatch(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      toast.success(t('matching.dismissed', 'Match dismissed'));
      navigate(-1);
    },
  });

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Match Details - Device Passport System</title>
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

  if (error || !match) {
    return (
      <>
        <Helmet>
          <title>Match Not Found - Device Passport System</title>
        </Helmet>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600">{t('matching.notFound', 'Match not found')}</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mt-2">
          {t('common.back', 'Back')}
        </button>
        </div>
      </>
    );
  }

  const isBuyer = role === 'buyer';
  const product = match.marketplaceProduct;
  const rfq = match.buyerRequirement;
  const counterparty = isBuyer ? match.supplierOrg : match.buyerOrg;

  return (
    <>
      <Helmet>
        <title>Match Details - Device Passport System</title>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('common.back', 'Back')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Match score */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('matching.matchScore', 'Match Score')}
            </h2>
            <MatchScoreBar
              totalScore={match.totalScore}
              breakdown={match.scoreBreakdown}
              distanceKm={match.distanceKm}
              showBreakdown={true}
            />
          </div>

          {/* Product details (for buyer) */}
          {isBuyer && product && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{product.listingTitle}</h2>
                  {product.productCategory && (
                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                      {PRODUCT_TYPE_NAMES[product.productCategory as keyof typeof PRODUCT_TYPE_NAMES]}
                    </span>
                  )}
                </div>
              </div>

              {product.description && (
                <p className="text-gray-700 mb-4">{product.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.showPrice && product.minPrice && (
                  <div>
                    <span className="text-gray-500">{t('marketplace.priceRange', 'Price')}:</span>
                    <span className="ml-2 font-medium">
                      {product.priceCurrency || 'USD'} {Number(product.minPrice).toLocaleString()}
                      {product.maxPrice && ` - ${Number(product.maxPrice).toLocaleString()}`}
                    </span>
                  </div>
                )}
                {product.minOrderQuantity && (
                  <div>
                    <span className="text-gray-500">{t('marketplace.moq', 'MOQ')}:</span>
                    <span className="ml-2 font-medium">{product.minOrderQuantity}</span>
                  </div>
                )}
                {product.leadTimeDays && (
                  <div>
                    <span className="text-gray-500">{t('marketplace.leadTime', 'Lead Time')}:</span>
                    <span className="ml-2 font-medium">{product.leadTimeDays} {t('marketplace.days', 'days')}</span>
                  </div>
                )}
                {product.supplyRegion && (
                  <div>
                    <span className="text-gray-500">{t('marketplace.supplyRegion', 'Region')}:</span>
                    <span className="ml-2 font-medium">{product.supplyRegion}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  to={`/marketplace/products/${match.marketplaceProductId}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  {t('inquiry.viewProduct', 'View full product details')}
                </Link>
              </div>
            </div>
          )}

          {/* RFQ details (for supplier) */}
          {!isBuyer && rfq && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{rfq.title}</h2>
                  {rfq.productCategory && (
                    <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full mt-1">
                      {PRODUCT_TYPE_NAMES[rfq.productCategory as keyof typeof PRODUCT_TYPE_NAMES]}
                    </span>
                  )}
                </div>
              </div>

              {rfq.description && (
                <p className="text-gray-700 mb-4">{rfq.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {rfq.quantity && (
                  <div>
                    <span className="text-gray-500">{t('buyer.quantity', 'Quantity')}:</span>
                    <span className="ml-2 font-medium">{rfq.quantity} {rfq.quantityUnit || ''}</span>
                  </div>
                )}
                {(rfq.budgetMin || rfq.budgetMax) && (
                  <div>
                    <span className="text-gray-500">{t('buyer.budget', 'Budget')}:</span>
                    <span className="ml-2 font-medium">
                      {rfq.budgetCurrency || 'USD'} {rfq.budgetMin?.toLocaleString() || '0'}
                      {rfq.budgetMax && ` - ${rfq.budgetMax.toLocaleString()}`}
                    </span>
                  </div>
                )}
                {rfq.deliveryDeadline && (
                  <div>
                    <span className="text-gray-500">{t('buyer.deliveryDeadline', 'Deadline')}:</span>
                    <span className="ml-2 font-medium">{new Date(rfq.deliveryDeadline).toLocaleDateString()}</span>
                  </div>
                )}
                {rfq.preferredRegions && rfq.preferredRegions.length > 0 && (
                  <div>
                    <span className="text-gray-500">{t('buyer.preferredRegions', 'Regions')}:</span>
                    <span className="ml-2 font-medium">{rfq.preferredRegions.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  to={`/marketplace/rfqs/${match.buyerRequirementId}`}
                  className="text-purple-600 hover:underline text-sm"
                >
                  {t('inquiry.viewRfq', 'View full RFQ details')}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Counterparty */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3">
              {isBuyer ? t('inquiry.supplier', 'Supplier') : t('inquiry.buyer', 'Buyer')}
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{counterparty?.name || t('matching.anonymous', 'Anonymous')}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {match.status !== MatchStatus.DISMISSED && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-sm font-medium text-gray-500 mb-3">
                {t('inquiry.actions', 'Actions')}
              </h2>
              <div className="space-y-2">
                <Link
                  to="/inquiries/create"
                  state={{
                    productId: isBuyer ? match.marketplaceProductId : undefined,
                    productTitle: isBuyer ? product?.listingTitle : undefined,
                    rfqId: !isBuyer ? match.buyerRequirementId : undefined,
                    rfqTitle: !isBuyer ? rfq?.title : undefined,
                    supplierOrgId: isBuyer ? match.supplierOrgId : undefined,
                    supplierName: isBuyer ? counterparty?.name : undefined,
                    buyerOrgId: !isBuyer ? match.buyerOrgId : undefined,
                    buyerName: !isBuyer ? counterparty?.name : undefined,
                    matchId: match.id,
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  <MessageSquare className="w-4 h-4" />
                  {isBuyer
                    ? t('matching.contact', 'Contact Supplier')
                    : t('marketplace.sendQuote', 'Send Quote')
                  }
                </Link>
                <button
                  onClick={() => dismissMutation.mutate()}
                  disabled={dismissMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  <X className="w-4 h-4" />
                  {t('matching.dismiss', 'Dismiss')}
                </button>
              </div>
            </div>
          )}

          {/* Distance info */}
          {match.distanceKm && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-sm font-medium text-gray-500 mb-3">
                {t('marketplace.distance', 'Distance')}
              </h2>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(match.distanceKm)} {t('marketplace.km', 'km')}
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
