import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { marketplaceProductApi } from '../../services/api';
import { ProductLine, PRODUCT_TYPE_NAMES, MarketplaceListingStatus, CurrencyCode, CURRENCY_NAMES } from '@device-passport/shared';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

interface ProductFormData {
  listingTitle: string;
  description?: string;
  productCategory?: ProductLine;
  hsCode?: string;
  showPrice: boolean;
  minPrice?: number;
  maxPrice?: number;
  priceCurrency: string;
  priceUnit?: string;
  minOrderQuantity?: number;
  supplyRegion?: string;
  leadTimeDays?: number;
  status: MarketplaceListingStatus;
}

export default function EditProduct() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['marketplace-product', id],
    queryFn: () => marketplaceProductApi.getById(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      showPrice: true,
      priceCurrency: CurrencyCode.CNY,
      status: MarketplaceListingStatus.DRAFT,
    },
  });

  // Load product data into form
  useEffect(() => {
    if (product) {
      reset({
        listingTitle: product.listingTitle || '',
        description: product.description || '',
        productCategory: product.productCategory || '',
        hsCode: product.hsCode || '',
        showPrice: product.showPrice ?? true,
        minPrice: product.minPrice || undefined,
        maxPrice: product.maxPrice || undefined,
        priceCurrency: product.priceCurrency || CurrencyCode.CNY,
        priceUnit: product.priceUnit || '',
        minOrderQuantity: product.minOrderQuantity || undefined,
        supplyRegion: product.supplyRegion || '',
        leadTimeDays: product.leadTimeDays || undefined,
        status: product.status || MarketplaceListingStatus.DRAFT,
      });
    }
  }, [product, reset]);

  const showPrice = watch('showPrice');

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) => marketplaceProductApi.update(id!, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-marketplace-products'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-product', id] });
      toast.success(t('supplier.productUpdated', 'Product updated successfully'));
      navigate('/supplier/products');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string | string[] } } };
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        toast.error(msg.join(', '));
      } else {
        toast.error(msg || t('supplier.productUpdateFailed', 'Failed to update product'));
      }
    },
  });

  const onSubmit = (data: ProductFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoadingProduct) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-gray-500">{t('supplier.productNotFound', 'Product not found')}</p>
          <button
            onClick={() => navigate('/supplier/products')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('common.back', 'Back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit Product - Device Passport System</title>
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
          {t('supplier.editProduct', 'Edit Product')}
        </h1>
        <p className="text-gray-600 mt-1">
          {t('supplier.editProductDesc', 'Update your product listing')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('supplier.basicInfo', 'Basic Information')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('supplier.listingTitle', 'Listing Title')} *
              </label>
              <input
                type="text"
                {...register('listingTitle', { required: true, maxLength: 200 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={t('supplier.titlePlaceholder', 'Enter product title')}
              />
              {errors.listingTitle && (
                <p className="mt-1 text-sm text-red-600">{t('common.required', 'This field is required')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('supplier.description', 'Description')}
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={t('supplier.descriptionPlaceholder', 'Describe your product...')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('supplier.category', 'Category')}
                </label>
                <select
                  {...register('productCategory')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('supplier.selectCategory', 'Select category')}</option>
                  {Object.entries(ProductLine).map(([, value]) => (
                    <option key={value} value={value}>
                      {PRODUCT_TYPE_NAMES[value as keyof typeof PRODUCT_TYPE_NAMES]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('supplier.hsCode', 'HS Code')}
                </label>
                <input
                  type="text"
                  {...register('hsCode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 8471.30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('supplier.pricing', 'Pricing')}
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPrice"
                {...register('showPrice')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="showPrice" className="text-sm text-gray-700">
                {t('supplier.showPricePublicly', 'Show price publicly')}
              </label>
            </div>

            {showPrice && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('supplier.minPrice', 'Min Price')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('minPrice', { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('supplier.maxPrice', 'Max Price')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('maxPrice', { min: 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('supplier.currency', 'Currency')}
                  </label>
                  <select
                    {...register('priceCurrency')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(CurrencyCode).map((currency) => (
                      <option key={currency} value={currency}>
                        {currency} ({CURRENCY_NAMES[currency]?.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('supplier.priceUnit', 'Price Unit')}
                  </label>
                  <input
                    type="text"
                    {...register('priceUnit')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="per unit"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('supplier.moq', 'Minimum Order Quantity')}
              </label>
              <input
                type="number"
                min="1"
                {...register('minOrderQuantity', { min: 1 })}
                className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Supply Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('supplier.supplyInfo', 'Supply Information')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('supplier.supplyRegion', 'Supply Region')}
              </label>
              <input
                type="text"
                {...register('supplyRegion')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={t('supplier.regionPlaceholder', 'e.g., China, Vietnam')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('supplier.leadTime', 'Lead Time (days)')}
              </label>
              <input
                type="number"
                min="0"
                {...register('leadTimeDays', { min: 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('supplier.publishStatus', 'Publish Status')}
          </h2>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value={MarketplaceListingStatus.DRAFT}
                {...register('status')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('supplier.saveAsDraft', 'Save as Draft')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value={MarketplaceListingStatus.ACTIVE}
                {...register('status')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('supplier.publishNow', 'Publish Now')}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value={MarketplaceListingStatus.PAUSED}
                {...register('status')}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('supplier.paused', 'Paused')}</span>
            </label>
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
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {updateMutation.isPending ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
          </button>
        </div>
      </form>
      </div>
    </>
  );
}
