import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Package,
  Eye,
  MessageSquare,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Edit,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { marketplaceProductApi } from '../../services/api';
import { MarketplaceListingStatus, MARKETPLACE_LISTING_STATUS_NAMES } from '@device-passport/shared';
import toast from 'react-hot-toast';
import clsx from 'clsx';

// Hook to determine if dropdown should open upward
function useDropdownPosition(isOpen: boolean) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [openUpward, setOpenUpward] = useState(false);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 200px below, open upward
      setOpenUpward(spaceBelow < 200);
    }
  }, [isOpen]);

  return { buttonRef, openUpward };
}

// Product Action Menu with smart positioning
interface ProductActionMenuProps {
  product: any;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onPause: () => void;
  onActivate: () => void;
  onDelete: () => void;
  t: (key: string, fallback: string) => string;
}

function ProductActionMenu({
  product,
  isOpen,
  onToggle,
  onClose,
  onPause,
  onActivate,
  onDelete,
  t,
}: ProductActionMenuProps) {
  const { buttonRef, openUpward } = useDropdownPosition(isOpen);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onToggle}
        className="p-2 hover:bg-gray-100 rounded-md"
      >
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </button>
      {isOpen && (
        <div
          className={clsx(
            'absolute right-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50',
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          <Link
            to={`/supplier/products/${product.id}/edit`}
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
            {t('common.edit', 'Edit')}
          </Link>
          {product.status === MarketplaceListingStatus.ACTIVE ? (
            <button
              onClick={() => {
                onPause();
                onClose();
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
            >
              <Pause className="w-4 h-4" />
              {t('supplier.pause', 'Pause')}
            </button>
          ) : (
            <button
              onClick={() => {
                onActivate();
                onClose();
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
            >
              <Play className="w-4 h-4" />
              {t('supplier.activate', 'Activate')}
            </button>
          )}
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            {t('common.delete', 'Delete')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function MyProducts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['my-marketplace-products'],
    queryFn: () => marketplaceProductApi.getMyProducts(),
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => marketplaceProductApi.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-marketplace-products'] });
      toast.success(t('supplier.productPaused', 'Product paused'));
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => marketplaceProductApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-marketplace-products'] });
      toast.success(t('supplier.productActivated', 'Product activated'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => marketplaceProductApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-marketplace-products'] });
      toast.success(t('supplier.productRemoved', 'Product removed'));
    },
  });

  const getStatusColor = (status: MarketplaceListingStatus) => {
    switch (status) {
      case MarketplaceListingStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case MarketplaceListingStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case MarketplaceListingStatus.PAUSED:
        return 'bg-yellow-100 text-yellow-800';
      case MarketplaceListingStatus.PENDING_REVIEW:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Helmet>
        <title>My Products - Device Passport System</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('supplier.myProducts', 'My Products')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('supplier.manageProductListings', 'Manage your marketplace product listings')}
          </p>
        </div>
        <Link
          to="/supplier/products/publish"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('supplier.publishProduct', 'Publish Product')}
        </Link>
      </div>

      {/* Products list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-visible">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('supplier.product', 'Product')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('supplier.price', 'Price')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('supplier.status', 'Status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('supplier.stats', 'Stats')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('supplier.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-3">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {product.listingTitle}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.productCategory || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.showPrice && product.minPrice ? (
                      <span className="text-sm font-medium text-gray-900">
                        {product.priceCurrency} {Number(product.minPrice).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">On request</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getStatusColor(product.status)
                      )}
                    >
                      {MARKETPLACE_LISTING_STATUS_NAMES[product.status as MarketplaceListingStatus]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {product.viewCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {product.inquiryCount || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ProductActionMenu
                      product={product}
                      isOpen={openMenu === product.id}
                      onToggle={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                      onClose={() => setOpenMenu(null)}
                      onPause={() => pauseMutation.mutate(product.id)}
                      onActivate={() => activateMutation.mutate(product.id)}
                      onDelete={() => {
                        if (confirm(t('supplier.confirmDelete', 'Are you sure you want to remove this product?'))) {
                          deleteMutation.mutate(product.id);
                        }
                      }}
                      t={t}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{t('supplier.noProducts', "You haven't published any products yet")}</p>
          <Link
            to="/supplier/products/publish"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('supplier.publishFirst', 'Publish Your First Product')}
          </Link>
        </div>
      )}
      </div>
    </>
  );
}
