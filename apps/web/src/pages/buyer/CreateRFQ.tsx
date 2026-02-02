import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { marketplaceRfqApi } from '../../services/api';
import {
  ProductLine,
  PRODUCT_TYPE_NAMES,
  PurchaseFrequency,
  PURCHASE_FREQUENCY_NAMES,
  RFQStatus,
  CurrencyCode,
  CURRENCY_NAMES,
} from '@device-passport/shared';
import toast from 'react-hot-toast';

interface RFQFormData {
  title: string;
  description?: string;
  productCategory?: ProductLine;
  hsCode?: string;
  quantity?: number;
  quantityUnit?: string;
  purchaseFrequency?: PurchaseFrequency;
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency: string;
  preferredRegions?: string;
  deliveryDeadline?: string;
  validUntil?: string;
  isPublic: boolean;
  showCompanyInfo: boolean;
  status: RFQStatus;
}

export default function CreateRFQ() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RFQFormData>({
    defaultValues: {
      budgetCurrency: CurrencyCode.CNY,
      isPublic: true,
      showCompanyInfo: true,
      status: RFQStatus.DRAFT,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: RFQFormData) => {
      const payload = {
        ...data,
        preferredRegions: data.preferredRegions
          ? data.preferredRegions.split(',').map((r) => r.trim()).filter(r => r)
          : undefined,
      };
      return marketplaceRfqApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-rfqs'] });
      toast.success(t('buyer.rfqCreated', 'RFQ created successfully'));
      navigate('/buyer/rfqs');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        toast.error(msg.join(', '));
      } else {
        toast.error(msg || t('buyer.rfqCreateFailed', 'Failed to create RFQ'));
      }
    },
  });

  const onSubmit = (data: RFQFormData) => {
    createMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Create RFQ - Device Passport System</title>
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 py-6">
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
          {t('buyer.createRfq', 'Create RFQ')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('buyer.createRfqDesc', 'Post your purchase requirement to receive quotes from suppliers')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('buyer.requirementDetails', 'Requirement Details')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('buyer.title', 'Title')} *
              </label>
              <input
                type="text"
                {...register('title', { required: true, maxLength: 200 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder={t('buyer.titlePlaceholder', 'What are you looking for?')}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{t('common.required', 'This field is required')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('buyer.description', 'Description')}
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder={t('buyer.descriptionPlaceholder', 'Describe your requirements in detail...')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('buyer.category', 'Category')}
                </label>
                <select
                  {...register('productCategory')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">{t('buyer.anyCategory', 'Any category')}</option>
                  {Object.entries(ProductLine).map(([, value]) => (
                    <option key={value} value={value}>
                      {PRODUCT_TYPE_NAMES[value as keyof typeof PRODUCT_TYPE_NAMES]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('buyer.hsCode', 'HS Code')}
                </label>
                <input
                  type="text"
                  {...register('hsCode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 8471.30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quantity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('buyer.quantity', 'Quantity')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('buyer.quantity', 'Quantity')}
              </label>
              <input
                type="number"
                min="1"
                {...register('quantity', { min: 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('buyer.unit', 'Unit')}
              </label>
              <input
                type="text"
                {...register('quantityUnit')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder="units, sets, kg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('buyer.purchaseFrequency', 'Purchase Frequency')}
              </label>
              <select
                {...register('purchaseFrequency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              >
                <option value="">{t('buyer.selectFrequency', 'Select frequency')}</option>
                {Object.entries(PurchaseFrequency).map(([, value]) => (
                  <option key={value} value={value}>
                    {PURCHASE_FREQUENCY_NAMES[value as keyof typeof PURCHASE_FREQUENCY_NAMES]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('buyer.budget', 'Budget')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('buyer.minBudget', 'Min Budget')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('budgetMin', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('buyer.maxBudget', 'Max Budget')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('budgetMax', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('buyer.currency', 'Currency')}
              </label>
              <select
                {...register('budgetCurrency')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              >
                {Object.values(CurrencyCode).map((currency) => (
                  <option key={currency} value={currency}>
                    {currency} ({CURRENCY_NAMES[currency]?.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('buyer.preferences', 'Preferences')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('buyer.preferredRegions', 'Preferred Regions')}
              </label>
              <input
                type="text"
                {...register('preferredRegions')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                placeholder={t('buyer.regionsPlaceholder', 'China, Vietnam (comma separated)')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('buyer.deliveryDeadline', 'Delivery Deadline')}
              </label>
              <input
                type="date"
                {...register('deliveryDeadline')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('buyer.validUntil', 'RFQ Valid Until')}
              </label>
              <input
                type="date"
                {...register('validUntil')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('buyer.visibility', 'Visibility')}
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isPublic')}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{t('buyer.makePublic', 'Make this RFQ public')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('showCompanyInfo')}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{t('buyer.showCompanyInfo', 'Show company information')}</span>
            </label>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">{t('buyer.publishStatus', 'Publish Status')}</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value={RFQStatus.DRAFT}
                  {...register('status')}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{t('buyer.saveAsDraft', 'Save as Draft')}</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value={RFQStatus.OPEN}
                  {...register('status')}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">{t('buyer.publishNow', 'Publish Now')}</span>
              </label>
            </div>
          </div>
        </div>

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
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {createMutation.isPending ? t('common.saving', 'Saving...') : t('buyer.createRfq', 'Create RFQ')}
          </button>
        </div>
      </form>
      </div>
    </>
  );
}
