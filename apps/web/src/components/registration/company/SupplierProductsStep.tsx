import { useState } from 'react';
import { useRegistrationStore } from '../../../store/registration.store';
import ProductCard, { ProductForm } from '../common/ProductCard';
import { PlusIcon } from '@heroicons/react/24/outline';
import type { ProductData } from '../../../store/registration.store';

export default function SupplierProductsStep() {
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Supplier Products</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add the products your company supplies. You can add more products after registration.
        </p>
      </div>

      {isEditing ? (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            {editingIndex !== null ? 'Edit Product' : 'Add New Product'}
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
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>

          {companyData.products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No products added yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Click "Add Product" to add your first product
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

      <div className="bg-amber-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-amber-900">Tip</h4>
        <p className="mt-1 text-sm text-amber-700">
          Adding detailed product information helps buyers find your products more easily.
          Include HS codes for international trade compliance.
        </p>
      </div>
    </div>
  );
}
