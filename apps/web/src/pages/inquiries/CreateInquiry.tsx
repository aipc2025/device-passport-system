import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send } from 'lucide-react';
import { inquiryApi } from '../../services/api';
import toast from 'react-hot-toast';

interface LocationState {
  productId?: string;
  productTitle?: string;
  rfqId?: string;
  rfqTitle?: string;
  supplierOrgId?: string;
  supplierName?: string;
  buyerOrgId?: string;
  buyerName?: string;
  matchId?: string;
}

interface InquiryFormData {
  subject: string;
  message?: string;
  quantity?: number;
  targetPrice?: number;
  targetCurrency: string;
  requiredDeliveryDate?: string;
}

export default function CreateInquiry() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InquiryFormData>({
    defaultValues: {
      subject: state?.productTitle
        ? `Inquiry about: ${state.productTitle}`
        : state?.rfqTitle
        ? `Quote for: ${state.rfqTitle}`
        : '',
      targetCurrency: 'USD',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InquiryFormData) => {
      const payload: Record<string, unknown> = {
        ...data,
        supplierOrgId: state?.supplierOrgId || state?.buyerOrgId,
        marketplaceProductId: state?.productId,
        buyerRequirementId: state?.rfqId,
        matchResultId: state?.matchId,
      };
      return inquiryApi.create(payload);
    },
    onSuccess: (data) => {
      toast.success(t('inquiry.created', 'Inquiry sent successfully'));
      navigate(`/inquiries/${data.id}`);
    },
    onError: () => {
      toast.error(t('inquiry.createFailed', 'Failed to send inquiry'));
    },
  });

  const onSubmit = (data: InquiryFormData) => {
    createMutation.mutate(data);
  };

  const recipientName = state?.supplierName || state?.buyerName;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back', 'Back')}
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('inquiry.createInquiry', 'Send Inquiry')}
        </h1>
        {recipientName && (
          <p className="text-gray-600 mt-1">
            {t('inquiry.to', 'To')}: <span className="font-medium">{recipientName}</span>
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('inquiry.subject', 'Subject')} *
            </label>
            <input
              type="text"
              {...register('subject', { required: true, maxLength: 200 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder={t('inquiry.subjectPlaceholder', 'What is this inquiry about?')}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600">{t('common.required', 'This field is required')}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('inquiry.message', 'Message')}
            </label>
            <textarea
              {...register('message')}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder={t('inquiry.messagePlaceholder', 'Describe your requirements, ask questions, or request a quote...')}
            />
          </div>

          {/* Quantity and Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('inquiry.quantity', 'Quantity')}
              </label>
              <input
                type="number"
                min="1"
                {...register('quantity', { min: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('inquiry.targetPrice', 'Target Price')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('targetPrice', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('inquiry.currency', 'Currency')}
              </label>
              <select
                {...register('targetCurrency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CNY">CNY</option>
                <option value="VND">VND</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>

          {/* Delivery date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('inquiry.requiredDeliveryDate', 'Required Delivery Date')}
            </label>
            <input
              type="date"
              {...register('requiredDeliveryDate')}
              className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Context info */}
        {(state?.productTitle || state?.rfqTitle) && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600">
              {state?.productTitle ? (
                <>
                  {t('inquiry.regardingProduct', 'Regarding product')}: <span className="font-medium">{state.productTitle}</span>
                </>
              ) : (
                <>
                  {t('inquiry.regardingRfq', 'Regarding RFQ')}: <span className="font-medium">{state?.rfqTitle}</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
            {createMutation.isPending ? t('inquiry.sending', 'Sending...') : t('inquiry.send', 'Send Inquiry')}
          </button>
        </div>
      </form>
    </div>
  );
}
