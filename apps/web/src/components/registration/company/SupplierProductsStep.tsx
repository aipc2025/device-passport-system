import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegistrationStore } from '../../../store/registration.store';
import ProductCard, { ProductForm } from '../common/ProductCard';
import { PlusIcon, CubeIcon } from '@heroicons/react/24/outline';
import type { ProductData } from '../../../store/registration.store';

export default function SupplierProductsStep() {
  const { t } = useTranslation();
  const { companyData, addProduct, updateProduct, removeProduct } = useRegistrationStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddProduct = () => {
    setEditingIndex(null);
    setIsEditing(true);
  };

  const handleEditProduct = (index: number) => {
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleSaveProduct = (product: ProductData) => {
    if (editingIndex !== null) {
      updateProduct(editingIndex, product);
    } else {
      addProduct(product);
    }
    setIsEditing(false);
    setEditingIndex(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('supplier.title', 'Supplier Products')}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {t('supplier.subtitle', 'Add the products your company supplies. You can add more products after registration.')}
        </p>
      </div>

      {isEditing ? (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-base font-medium text-gray-900 mb-4">
            {editingIndex !== null
              ? t('supplier.editProduct', 'Edit Product')
              : t('supplier.addNewProduct', 'Add New Product')}
          </h3>
          <ProductForm
            product={editingIndex !== null ? companyData.products[editingIndex] : undefined}
            onSave={handleSaveProduct}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddProduct}
              className="btn-primary"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('supplier.addProduct', 'Add Product')}
            </button>
          </div>

          {companyData.products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <CubeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">{t('supplier.noProducts', 'No products added yet')}</p>
              <p className="text-sm text-gray-400 mt-1">
                {t('supplier.noProductsHint', 'Click "Add Product" to add your first product')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {companyData.products.map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                  onEdit={() => handleEditProduct(index)}
                  onDelete={() => removeProduct(index)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <div className="bg-amber-50 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-amber-900">
          {t('supplier.tipTitle', 'Tip')}
        </h4>
        <p className="mt-2 text-sm text-amber-700">
          {t('supplier.tipText', 'Adding detailed product information helps buyers find your products more easily. Include HS codes for international trade compliance.')}
        </p>
      </div>
    </div>
  );
}
