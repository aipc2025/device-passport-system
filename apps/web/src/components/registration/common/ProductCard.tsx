import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PencilIcon, TrashIcon, CubeIcon } from '@heroicons/react/24/outline';
import { PackagingType, PACKAGING_TYPE_NAMES } from '@device-passport/shared';
import type { ProductData } from '../../../store/registration.store';

interface ProductCardProps {
  product: ProductData;
  onEdit: (product: ProductData) => void;
  onDelete: () => void;
}

// Common currency options (including VND for Vietnam)
const CURRENCIES = ['USD', 'EUR', 'CNY', 'VND', 'JPY', 'GBP', 'KRW', 'TWD', 'HKD', 'SGD', 'AUD', 'THB', 'MYR'];

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { t } = useTranslation();

  const formatPrice = (price?: number, currency = 'USD') => {
    if (!price) return '-';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).format(price);
    } catch {
      return `${currency} ${price.toFixed(2)}`;
    }
  };

  const getDisplayCurrency = () => {
    if (product.priceCurrency === 'OTHER' && product.customCurrency) {
      return product.customCurrency;
    }
    return product.priceCurrency || 'USD';
  };

  const getDisplayPackaging = () => {
    if (product.packagingType === PackagingType.OTHER && product.customPackaging) {
      return product.customPackaging;
    }
    if (product.packagingType) {
      return PACKAGING_TYPE_NAMES[product.packagingType] || product.packagingType.replace(/_/g, ' ');
    }
    return '-';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <CubeIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
            {product.model && (
              <p className="text-xs text-gray-500">{t('product.model', 'Model')}: {product.model}</p>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {product.brand && (
          <p>
            <span className="text-gray-500">{t('product.brand', 'Brand')}:</span> {product.brand}
          </p>
        )}
        {product.hsCode && (
          <p>
            <span className="text-gray-500">{t('product.hsCode', 'HS Code')}:</span> {product.hsCode}
          </p>
        )}
        {product.sellingPrice && (
          <p>
            <span className="text-gray-500">{t('product.price', 'Price')}:</span>{' '}
            {formatPrice(product.sellingPrice, getDisplayCurrency())}
          </p>
        )}
        {product.packagingType && (
          <p>
            <span className="text-gray-500">{t('product.packaging', 'Packaging')}:</span>{' '}
            {getDisplayPackaging()}
          </p>
        )}
      </div>

      {product.description && (
        <p className="mt-2 text-xs text-gray-600 line-clamp-2">{product.description}</p>
      )}
    </div>
  );
}

interface ProductFormProps {
  product?: ProductData;
  onSave: (product: ProductData) => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ProductData>(
    product || {
      name: '',
      priceCurrency: 'USD',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCurrencyChange = (value: string) => {
    if (value === 'OTHER') {
      setFormData({ ...formData, priceCurrency: 'OTHER', customCurrency: '' });
    } else {
      setFormData({ ...formData, priceCurrency: value, customCurrency: undefined });
    }
  };

  const handlePackagingChange = (value: string) => {
    if (value === PackagingType.OTHER) {
      setFormData({ ...formData, packagingType: PackagingType.OTHER, customPackaging: '' });
    } else {
      setFormData({ ...formData, packagingType: value as PackagingType || undefined, customPackaging: undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="label">{t('product.name', 'Product Name')} *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            placeholder={t('product.namePlaceholder', 'Enter product name')}
          />
        </div>

        <div>
          <label className="label">{t('product.model', 'Model')}</label>
          <input
            type="text"
            value={formData.model || ''}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="input"
            placeholder={t('product.modelPlaceholder', 'e.g., XYZ-1000')}
          />
        </div>

        <div>
          <label className="label">{t('product.brand', 'Brand')}</label>
          <input
            type="text"
            value={formData.brand || ''}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="input"
            placeholder={t('product.brandPlaceholder', 'Enter brand name')}
          />
        </div>

        <div>
          <label className="label">{t('product.hsCode', 'HS Code')}</label>
          <input
            type="text"
            value={formData.hsCode || ''}
            onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
            className="input"
            placeholder="e.g., 8479.89"
          />
        </div>

        <div>
          <label className="label">{t('product.costPrice', 'Cost Price')}</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.costPrice || ''}
            onChange={(e) =>
              setFormData({ ...formData, costPrice: parseFloat(e.target.value) || undefined })
            }
            className="input"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="label">{t('product.sellingPrice', 'Selling Price')}</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.sellingPrice || ''}
            onChange={(e) =>
              setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || undefined })
            }
            className="input"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="label">{t('product.currency', 'Currency')}</label>
          <select
            value={formData.priceCurrency === 'OTHER' ? 'OTHER' : (formData.priceCurrency || 'USD')}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="select"
          >
            {CURRENCIES.map((curr) => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
            <option value="OTHER">{t('common.other', 'Other')}</option>
          </select>
          {formData.priceCurrency === 'OTHER' && (
            <input
              type="text"
              value={formData.customCurrency || ''}
              onChange={(e) => setFormData({ ...formData, customCurrency: e.target.value.toUpperCase() })}
              className="input mt-2"
              placeholder={t('product.customCurrencyPlaceholder', 'Enter currency code (e.g., INR)')}
              maxLength={5}
            />
          )}
        </div>

        <div>
          <label className="label">{t('product.packagingType', 'Packaging Type')}</label>
          <select
            value={formData.packagingType || ''}
            onChange={(e) => handlePackagingChange(e.target.value)}
            className="select"
          >
            <option value="">{t('common.select', 'Select...')}</option>
            {Object.entries(PackagingType).map(([key, value]) => (
              <option key={key} value={value}>
                {PACKAGING_TYPE_NAMES[value] || key.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          {formData.packagingType === PackagingType.OTHER && (
            <input
              type="text"
              value={formData.customPackaging || ''}
              onChange={(e) => setFormData({ ...formData, customPackaging: e.target.value })}
              className="input mt-2"
              placeholder={t('product.customPackagingPlaceholder', 'Describe packaging type')}
            />
          )}
        </div>
      </div>

      <div className="border-t pt-5">
        <h4 className="text-sm font-medium text-gray-900 mb-4">{t('product.dimensions', 'Dimensions & Weight')}</h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('product.length', 'Length (cm)')}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.length || ''}
              onChange={(e) =>
                setFormData({ ...formData, length: parseFloat(e.target.value) || undefined })
              }
              className="input-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('product.width', 'Width (cm)')}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.width || ''}
              onChange={(e) =>
                setFormData({ ...formData, width: parseFloat(e.target.value) || undefined })
              }
              className="input-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('product.height', 'Height (cm)')}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.height || ''}
              onChange={(e) =>
                setFormData({ ...formData, height: parseFloat(e.target.value) || undefined })
              }
              className="input-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('product.netWeight', 'Net Weight (kg)')}</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={formData.netWeight || ''}
              onChange={(e) =>
                setFormData({ ...formData, netWeight: parseFloat(e.target.value) || undefined })
              }
              className="input-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{t('product.grossWeight', 'Gross Weight (kg)')}</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={formData.grossWeight || ''}
              onChange={(e) =>
                setFormData({ ...formData, grossWeight: parseFloat(e.target.value) || undefined })
              }
              className="input-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="label">{t('product.description', 'Description')}</label>
        <textarea
          rows={3}
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="textarea"
          placeholder={t('product.descriptionPlaceholder', 'Enter product description...')}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          {t('common.cancel', 'Cancel')}
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {product ? t('common.update', 'Update') : t('common.add', 'Add')}
        </button>
      </div>
    </form>
  );
}
