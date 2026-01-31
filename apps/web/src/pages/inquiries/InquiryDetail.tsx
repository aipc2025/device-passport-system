import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, Package, FileText } from 'lucide-react';
import { inquiryApi } from '../../services/api';
import { MessageThread, QuoteForm, InquiryStatusBadge } from '../../components/inquiry';
import { useAuthStore } from '../../store/auth.store';
import { InquiryStatus, InquiryMessageType } from '@device-passport/shared';
import toast from 'react-hot-toast';

export default function InquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: inquiry, isLoading, error } = useQuery({
    queryKey: ['inquiry', id],
    queryFn: () => inquiryApi.getById(id!),
    enabled: !!id,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => inquiryApi.sendMessage(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiry', id] });
      toast.success(t('inquiry.messageSent', 'Message sent'));
    },
    onError: () => {
      toast.error(t('inquiry.sendFailed', 'Failed to send message'));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { status: InquiryStatus; closeReason?: string }) =>
      inquiryApi.updateStatus(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiry', id] });
      toast.success(t('inquiry.statusUpdated', 'Status updated'));
    },
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

  if (error || !inquiry) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600">{t('inquiry.notFound', 'Inquiry not found')}</p>
        <Link to="/inquiries" className="text-blue-600 hover:underline mt-2 inline-block">
          {t('inquiry.backToList', 'Back to inquiries')}
        </Link>
      </div>
    );
  }

  const currentOrgId = user?.organizationId || '';
  const isBuyer = inquiry.buyerOrgId === currentOrgId;
  const isSupplier = inquiry.supplierOrgId === currentOrgId;
  const counterparty = isBuyer ? inquiry.supplierOrg : inquiry.buyerOrg;
  const isClosed = [InquiryStatus.ACCEPTED, InquiryStatus.REJECTED, InquiryStatus.EXPIRED].includes(
    inquiry.status
  );

  const handleSendMessage = async (
    data: { content?: string; quotePrice?: number; quoteCurrency?: string; quoteValidUntil?: string; quotedLeadTimeDays?: number },
    messageType: InquiryMessageType
  ) => {
    await sendMessageMutation.mutateAsync({
      messageType,
      ...data,
    });
  };

  const handleAccept = () => {
    updateStatusMutation.mutate({ status: InquiryStatus.ACCEPTED });
  };

  const handleReject = () => {
    const reason = prompt(t('inquiry.rejectReason', 'Please provide a reason (optional):'));
    updateStatusMutation.mutate({ status: InquiryStatus.REJECTED, closeReason: reason || undefined });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        to="/inquiries"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('inquiry.backToList', 'Back to inquiries')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - Messages */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs text-gray-500 font-mono">{inquiry.inquiryCode}</span>
                <h1 className="text-xl font-bold text-gray-900">{inquiry.subject}</h1>
              </div>
              <InquiryStatusBadge status={inquiry.status} />
            </div>

            {inquiry.message && (
              <p className="text-gray-700 mb-4">{inquiry.message}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {inquiry.quantity && (
                <span>{t('inquiry.qty', 'Qty')}: {inquiry.quantity}</span>
              )}
              {inquiry.targetPrice && (
                <span>
                  {t('inquiry.target', 'Target')}: {inquiry.targetCurrency || 'USD'}{' '}
                  {inquiry.targetPrice.toLocaleString()}
                </span>
              )}
              {inquiry.requiredDeliveryDate && (
                <span>
                  {t('inquiry.needBy', 'Need by')}: {new Date(inquiry.requiredDeliveryDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('inquiry.conversation', 'Conversation')}
            </h2>
            <MessageThread
              messages={inquiry.messages || []}
              currentOrgId={currentOrgId}
            />
          </div>

          {/* Reply form */}
          {!isClosed && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('inquiry.reply', 'Reply')}
              </h2>
              <QuoteForm
                onSubmit={handleSendMessage}
                isSubmitting={sendMessageMutation.isPending}
                showQuoteFields={isSupplier}
                defaultCurrency={inquiry.targetCurrency || 'USD'}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Counterparty info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3">
              {isBuyer ? t('inquiry.supplier', 'Supplier') : t('inquiry.buyer', 'Buyer')}
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{counterparty?.name}</p>
              </div>
            </div>
          </div>

          {/* Related item */}
          {(inquiry.marketplaceProduct || inquiry.buyerRequirement) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-sm font-medium text-gray-500 mb-3">
                {inquiry.marketplaceProduct ? t('inquiry.relatedProduct', 'Related Product') : t('inquiry.relatedRfq', 'Related RFQ')}
              </h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                  {inquiry.marketplaceProduct ? (
                    <Package className="w-5 h-5 text-blue-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 line-clamp-2">
                    {inquiry.marketplaceProduct?.listingTitle || inquiry.buyerRequirement?.title}
                  </p>
                  {inquiry.marketplaceProduct && (
                    <Link
                      to={`/marketplace/products/${inquiry.marketplaceProductId}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {t('inquiry.viewProduct', 'View product')}
                    </Link>
                  )}
                  {inquiry.buyerRequirement && (
                    <Link
                      to={`/marketplace/rfqs/${inquiry.buyerRequirementId}`}
                      className="text-sm text-purple-600 hover:underline"
                    >
                      {t('inquiry.viewRfq', 'View RFQ')}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {!isClosed && inquiry.status === InquiryStatus.NEGOTIATING && isBuyer && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-sm font-medium text-gray-500 mb-3">
                {t('inquiry.actions', 'Actions')}
              </h2>
              <div className="space-y-2">
                <button
                  onClick={handleAccept}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  {t('inquiry.accept', 'Accept Offer')}
                </button>
                <button
                  onClick={handleReject}
                  className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm font-medium hover:bg-red-50"
                >
                  {t('inquiry.reject', 'Reject')}
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3">
              {t('inquiry.timeline', 'Timeline')}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('inquiry.created', 'Created')}</span>
                <span className="text-gray-900">
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </span>
              </div>
              {inquiry.respondedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('inquiry.responded', 'Responded')}</span>
                  <span className="text-gray-900">
                    {new Date(inquiry.respondedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {inquiry.closedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('inquiry.closed', 'Closed')}</span>
                  <span className="text-gray-900">
                    {new Date(inquiry.closedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
