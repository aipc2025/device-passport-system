import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegistrationStore } from '../../../store/registration.store';
import { PurchaseFrequency, FileCategory, CurrencyCode, CURRENCY_NAMES } from '@device-passport/shared';
import { PlusIcon, TrashIcon, CubeIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import FileUploader from '../common/FileUploader';

interface BuyerProductRequirement {
  productName: string;
  specifications?: string;
  quantity?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency: string;
  purchaseFrequency?: PurchaseFrequency;
  estimatedAnnualVolume?: string;
  attachmentFileIds?: string[];
}


export default function BuyerRequirementsStep() {
  const { t } = useTranslation();
  const { companyData, updateCompanyData } = useRegistrationStore();

  // Parse existing product requirements from buyerProductDescription
  const parseProductRequirements = (): BuyerProductRequirement[] => {
    if (!companyData.buyerProductRequirements) {
      return [];
    }
    try {
      return JSON.parse(companyData.buyerProductRequirements as string);
    } catch {
      return [];
    }
  };

  const [productRequirements, setProductRequirements] = useState<BuyerProductRequirement[]>(
    parseProductRequirements()
  );
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<BuyerProductRequirement>({
    productName: '',
    budgetCurrency: CurrencyCode.CNY,
  });

  const saveProductRequirements = (requirements: BuyerProductRequirement[]) => {
    setProductRequirements(requirements);
    updateCompanyData({
      buyerProductRequirements: JSON.stringify(requirements),
    });
  };

  const handleAddProduct = () => {
    if (!newProduct.productName.trim()) return;

    const updatedRequirements = [...productRequirements, newProduct];
    saveProductRequirements(updatedRequirements);
    setNewProduct({ productName: '', budgetCurrency: CurrencyCode.CNY });
    setIsAddingProduct(false);
  };

  const handleRemoveProduct = (index: number) => {
    const updatedRequirements = productRequirements.filter((_, i) => i !== index);
    saveProductRequirements(updatedRequirements);
  };

  const formatBudget = (product: BuyerProductRequirement) => {
    if (!product.budgetMin && !product.budgetMax) return null;
    const currency = product.budgetCurrency || 'USD';
    if (product.budgetMin && product.budgetMax) {
      return `${currency} ${product.budgetMin.toLocaleString()} - ${product.budgetMax.toLocaleString()}`;
    }
    if (product.budgetMin) {
      return `${currency} ${product.budgetMin.toLocaleString()}+`;
    }
    return `${t('buyer.upTo', 'Up to')} ${currency} ${product.budgetMax?.toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{t('buyer.title', 'Buyer Requirements')}</h2>
        <p className="mt-2 text-sm text-gray-500">
          {t('buyer.subtitle', 'Tell us about your purchasing needs so we can match you with suitable suppliers.')}
        </p>
      </div>

      {/* Product Requirements List */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-medium text-gray-900">
            {t('buyer.productRequirements', 'Product/Equipment Requirements')}
          </h3>
          {!isAddingProduct && (
            <button
              type="button"
              onClick={() => setIsAddingProduct(true)}
              className="btn-secondary text-sm px-3 py-1.5"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              {t('buyer.addProduct', 'Add Product')}
            </button>
          )}
        </div>

        {/* Add New Product Form */}
        {isAddingProduct && (
          <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">{t('buyer.productName', 'Product/Equipment Name')} *</label>
                <input
                  type="text"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                  className="input"
                  placeholder={t('buyer.productNamePlaceholder', 'e.g., PLC Controller, Servo Motor')}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">{t('buyer.specifications', 'Specifications/Requirements')}</label>
                <textarea
                  rows={2}
                  value={newProduct.specifications || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, specifications: e.target.value })}
                  className="textarea"
                  placeholder={t('buyer.specificationsPlaceholder', 'Describe specifications, brand preferences, or other requirements...')}
                />
              </div>

              <div>
                <label className="label">{t('buyer.quantity', 'Estimated Quantity')}</label>
                <input
                  type="text"
                  value={newProduct.quantity || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  className="input"
                  placeholder={t('buyer.quantityPlaceholder', 'e.g., 10 units, 100-200 pcs')}
                />
              </div>

              <div>
                <label className="label">{t('buyer.budgetCurrency', 'Budget Currency')}</label>
                <select
                  value={newProduct.budgetCurrency}
                  onChange={(e) => setNewProduct({ ...newProduct, budgetCurrency: e.target.value })}
                  className="select"
                >
                  {Object.values(CurrencyCode).map((currency) => (
                    <option key={currency} value={currency}>
                      {currency} ({CURRENCY_NAMES[currency]?.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">{t('buyer.budgetMin', 'Min Budget')}</label>
                <input
                  type="number"
                  min="0"
                  value={newProduct.budgetMin || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, budgetMin: parseFloat(e.target.value) || undefined })}
                  className="input"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="label">{t('buyer.budgetMax', 'Max Budget')}</label>
                <input
                  type="number"
                  min="0"
                  value={newProduct.budgetMax || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, budgetMax: parseFloat(e.target.value) || undefined })}
                  className="input"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="label">{t('buyer.purchaseFrequency', 'Purchase Frequency')}</label>
                <select
                  value={newProduct.purchaseFrequency || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, purchaseFrequency: e.target.value as PurchaseFrequency || undefined })}
                  className="select"
                >
                  <option value="">{t('common.select', 'Select...')}</option>
                  <option value={PurchaseFrequency.ONE_TIME}>{t('frequency.oneTime', 'One-time purchase')}</option>
                  <option value={PurchaseFrequency.MONTHLY}>{t('frequency.monthly', 'Monthly')}</option>
                  <option value={PurchaseFrequency.QUARTERLY}>{t('frequency.quarterly', 'Quarterly')}</option>
                  <option value={PurchaseFrequency.YEARLY}>{t('frequency.yearly', 'Yearly')}</option>
                  <option value={PurchaseFrequency.AS_NEEDED}>{t('frequency.asNeeded', 'As needed')}</option>
                </select>
              </div>

              <div>
                <label className="label">{t('buyer.estimatedAnnualVolume', 'Estimated Annual Volume')}</label>
                <input
                  type="text"
                  value={newProduct.estimatedAnnualVolume || ''}
                  onChange={(e) => setNewProduct({ ...newProduct, estimatedAnnualVolume: e.target.value })}
                  className="input"
                  placeholder={t('buyer.estimatedAnnualVolumePlaceholder', 'e.g., $100,000 - $500,000')}
                />
              </div>
            </div>

            {/* File Attachments */}
            <div className="pt-3 border-t border-gray-100">
              <FileUploader
                label={t('buyer.attachments', 'Attachments (Drawings, Specs, etc.)')}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg,.dxf"
                multiple={true}
                maxFiles={5}
                fileCategory={FileCategory.OTHER}
                value={newProduct.attachmentFileIds}
                onChange={(fileIds) => setNewProduct({ ...newProduct, attachmentFileIds: fileIds as string[] | undefined })}
                helperText={t('buyer.attachmentsHelp', 'PDF, Word, Excel, Images, DWG (max 10MB each)')}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setIsAddingProduct(false);
                  setNewProduct({ productName: '', budgetCurrency: CurrencyCode.CNY });
                }}
                className="btn-secondary"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!newProduct.productName.trim()}
                className="btn-primary"
              >
                {t('common.add', 'Add')}
              </button>
            </div>
          </div>
        )}

        {/* Product Requirements List */}
        {productRequirements.length === 0 && !isAddingProduct ? (
          <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
            <CubeIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('buyer.noProducts', 'No product requirements added yet')}</p>
            <p className="text-sm text-gray-400 mt-1">
              {t('buyer.noProductsHint', 'Click "Add Product" to specify what you\'re looking to purchase')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {productRequirements.map((product, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.productName}</h4>
                    {product.specifications && (
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{product.specifications}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      {product.quantity && (
                        <span className="text-gray-500">
                          <span className="font-medium">{t('buyer.qty', 'Qty')}:</span> {product.quantity}
                        </span>
                      )}
                      {formatBudget(product) && (
                        <span className="text-gray-500">
                          <span className="font-medium">{t('buyer.budget', 'Budget')}:</span> {formatBudget(product)}
                        </span>
                      )}
                      {product.purchaseFrequency && (
                        <span className="text-gray-500">
                          <span className="font-medium">{t('buyer.frequency', 'Frequency')}:</span>{' '}
                          {t(`frequency.${product.purchaseFrequency.toLowerCase()}`, product.purchaseFrequency)}
                        </span>
                      )}
                      {product.estimatedAnnualVolume && (
                        <span className="text-gray-500">
                          <span className="font-medium">{t('buyer.volume', 'Volume')}:</span> {product.estimatedAnnualVolume}
                        </span>
                      )}
                    </div>
                    {product.attachmentFileIds && product.attachmentFileIds.length > 0 && (
                      <div className="mt-2 flex items-center text-sm text-blue-600">
                        <PaperClipIcon className="h-4 w-4 mr-1" />
                        {product.attachmentFileIds.length} {t('buyer.filesAttached', 'file(s) attached')}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* General Description */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">
          {t('buyer.additionalInfo', 'Additional Information')}
        </h3>

        <div>
          <label className="label">{t('buyer.generalDescription', 'General Requirements')}</label>
          <textarea
            rows={3}
            value={companyData.buyerProductDescription || ''}
            onChange={(e) => updateCompanyData({ buyerProductDescription: e.target.value })}
            className="textarea"
            placeholder={t('buyer.generalDescriptionPlaceholder', 'Any additional information about your purchasing needs, preferred brands, quality standards, etc.')}
          />
        </div>

        <div>
          <label className="label">{t('buyer.paymentTerms', 'Preferred Payment Terms')}</label>
          <textarea
            rows={2}
            value={companyData.preferredPaymentTerms || ''}
            onChange={(e) => updateCompanyData({ preferredPaymentTerms: e.target.value })}
            className="textarea"
            placeholder={t('buyer.paymentTermsPlaceholder', 'e.g., Net 30, LC at sight, 30% advance + 70% before shipment')}
          />
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-blue-900">{t('buyer.infoTitle', 'How We Use This Information')}</h4>
        <p className="mt-1 text-sm text-blue-700">
          {t('buyer.infoText', 'Your purchasing requirements help us recommend suitable suppliers and products. This information is shared with potential suppliers to facilitate better matches.')}
        </p>
      </div>
    </div>
  );
}
