import { useState } from 'react';
import { PencilIcon, TrashIcon, CubeIcon } from '@heroicons/react/24/outline';
import { PackagingType } from '@device-passport/shared';
import type { ProductData } from '../../../store/registration.store';

interface ProductCardProps {
  product: ProductData;
  onEdit: (product: ProductData) => void;
  onDelete: () => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const formatPrice = (price?: number, currency = 'USD') => {
    if (!price) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <CubeIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
            {product.model && (
              <p className="text-xs text-gray-500">Model: {product.model}</p>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="p-1 text-gray-400 hover:text-blue-600"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {product.brand && (
          <p>
            <span className="text-gray-500">Brand:</span> {product.brand}
          </p>
        )}
        {product.hsCode && (
          <p>
            <span className="text-gray-500">HS Code:</span> {product.hsCode}
          </p>
        )}
        {product.sellingPrice && (
          <p>
            <span className="text-gray-500">Price:</span>{' '}
            {formatPrice(product.sellingPrice, product.priceCurrency)}
          </p>
        )}
        {product.packagingType && (
          <p>
            <span className="text-gray-500">Packaging:</span>{' '}
            {product.packagingType.replace('_', ' ')}
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Model</label>
          <input
            type="text"
            value={formData.model || ''}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <input
            type="text"
            value={formData.brand || ''}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">HS Code</label>
          <input
            type="text"
            value={formData.hsCode || ''}
            onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., 8479.89"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cost Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.costPrice || ''}
            onChange={(e) =>
              setFormData({ ...formData, costPrice: parseFloat(e.target.value) || undefined })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Selling Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.sellingPrice || ''}
            onChange={(e) =>
              setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || undefined })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            value={formData.priceCurrency || 'USD'}
            onChange={(e) => setFormData({ ...formData, priceCurrency: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="CNY">CNY</option>
            <option value="JPY">JPY</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Packaging Type</label>
          <select
            value={formData.packagingType || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                packagingType: e.target.value as PackagingType || undefined,
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Select...</option>
            <option value={PackagingType.WOODEN_BOX}>Wooden Box</option>
            <option value={PackagingType.CARDBOARD_BOX}>Cardboard Box</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Dimensions & Weight</h4>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div>
            <label className="block text-xs text-gray-500">Length (cm)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.length || ''}
              onChange={(e) =>
                setFormData({ ...formData, length: parseFloat(e.target.value) || undefined })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Width (cm)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.width || ''}
              onChange={(e) =>
                setFormData({ ...formData, width: parseFloat(e.target.value) || undefined })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Height (cm)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.height || ''}
              onChange={(e) =>
                setFormData({ ...formData, height: parseFloat(e.target.value) || undefined })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Net Weight (kg)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={formData.netWeight || ''}
              onChange={(e) =>
                setFormData({ ...formData, netWeight: parseFloat(e.target.value) || undefined })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500">Gross Weight (kg)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={formData.grossWeight || ''}
              onChange={(e) =>
                setFormData({ ...formData, grossWeight: parseFloat(e.target.value) || undefined })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={3}
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          {product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}
