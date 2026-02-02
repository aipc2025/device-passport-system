import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import {
  Plus,
  FileText,
  Eye,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  XCircle,
} from 'lucide-react';
import { marketplaceRfqApi } from '../../services/api';
import { RFQStatus, RFQ_STATUS_NAMES } from '@device-passport/shared';
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

// RFQ Action Menu with smart positioning
interface RFQActionMenuProps {
  rfq: any;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onOpen: () => void;
  onCloseRfq: () => void;
  onDelete: () => void;
  t: (key: string, fallback: string) => string;
}

function RFQActionMenu({
  rfq,
  isOpen,
  onToggle,
  onClose,
  onOpen,
  onCloseRfq,
  onDelete,
  t,
}: RFQActionMenuProps) {
  const { buttonRef, openUpward } = useDropdownPosition(isOpen);

  // Determine which actions are available based on status
  const canEdit = [RFQStatus.DRAFT, RFQStatus.OPEN].includes(rfq.status);
  const canOpen = [RFQStatus.DRAFT, RFQStatus.CLOSED].includes(rfq.status);
  const canClose = rfq.status === RFQStatus.OPEN;
  const canDelete = [RFQStatus.DRAFT, RFQStatus.OPEN, RFQStatus.CLOSED].includes(rfq.status);

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
          {canEdit && (
            <Link
              to={`/buyer/rfqs/${rfq.id}/edit`}
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" />
              {t('common.edit', 'Edit')}
            </Link>
          )}
          {canOpen && (
            <button
              onClick={() => {
                onOpen();
                onClose();
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
            >
              <Play className="w-4 h-4" />
              {t('buyer.openRfq', 'Open')}
            </button>
          )}
          {canClose && (
            <button
              onClick={() => {
                onCloseRfq();
                onClose();
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
            >
              <XCircle className="w-4 h-4" />
              {t('buyer.closeRfq', 'Close')}
            </button>
          )}
          {canDelete && (
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
          )}
        </div>
      )}
    </div>
  );
}

export default function MyRFQs() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: rfqs, isLoading } = useQuery({
    queryKey: ['my-rfqs'],
    queryFn: () => marketplaceRfqApi.getMyRfqs(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RFQStatus }) =>
      marketplaceRfqApi.update(id, { status }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['my-rfqs'] });
      if (status === RFQStatus.OPEN) {
        toast.success(t('buyer.rfqOpened', 'RFQ opened successfully'));
      } else if (status === RFQStatus.CLOSED) {
        toast.success(t('buyer.rfqClosed', 'RFQ closed'));
      }
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t('buyer.updateFailed', 'Failed to update RFQ'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => marketplaceRfqApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-rfqs'] });
      toast.success(t('buyer.rfqCancelled', 'RFQ cancelled'));
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t('buyer.deleteFailed', 'Failed to delete RFQ'));
    },
  });

  const getStatusColor = (status: RFQStatus) => {
    switch (status) {
      case RFQStatus.OPEN:
        return 'bg-green-100 text-green-800';
      case RFQStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case RFQStatus.CLOSED:
        return 'bg-blue-100 text-blue-800';
      case RFQStatus.FULFILLED:
        return 'bg-purple-100 text-purple-800';
      case RFQStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case RFQStatus.EXPIRED:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter out cancelled RFQs
  const visibleRfqs = rfqs?.filter(
    (rfq: any) => rfq.status !== RFQStatus.CANCELLED
  );

  return (
    <>
      <Helmet>
        <title>My RFQs - Device Passport System</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('buyer.myRfqs', 'My RFQs')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('buyer.manageRfqs', 'Manage your purchase requirements')}
          </p>
        </div>
        <Link
          to="/buyer/rfqs/create"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('buyer.createRfq', 'Create RFQ')}
        </Link>
      </div>

      {/* RFQs list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-24 animate-pulse" />
          ))}
        </div>
      ) : visibleRfqs && visibleRfqs.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-visible">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('buyer.rfq', 'RFQ')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('buyer.budget', 'Budget')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('buyer.status', 'Status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('buyer.responses', 'Responses')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('buyer.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleRfqs.map((rfq: any) => (
                <tr key={rfq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center mr-3">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {rfq.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {rfq.productCategory || 'Any category'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {rfq.budgetMax ? (
                      <span className="text-sm font-medium text-gray-900">
                        {rfq.budgetCurrency} {Number(rfq.budgetMax).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Flexible</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        getStatusColor(rfq.status)
                      )}
                    >
                      {RFQ_STATUS_NAMES[rfq.status as RFQStatus]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {rfq.viewCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {rfq.quoteCount || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <RFQActionMenu
                      rfq={rfq}
                      isOpen={openMenu === rfq.id}
                      onToggle={() => setOpenMenu(openMenu === rfq.id ? null : rfq.id)}
                      onClose={() => setOpenMenu(null)}
                      onOpen={() => updateStatusMutation.mutate({ id: rfq.id, status: RFQStatus.OPEN })}
                      onCloseRfq={() => updateStatusMutation.mutate({ id: rfq.id, status: RFQStatus.CLOSED })}
                      onDelete={() => {
                        if (confirm(t('buyer.confirmCancel', 'Are you sure you want to cancel this RFQ?'))) {
                          deleteMutation.mutate(rfq.id);
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
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">{t('buyer.noRfqs', "You haven't created any RFQs yet")}</p>
          <Link
            to="/buyer/rfqs/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('buyer.createFirst', 'Create Your First RFQ')}
          </Link>
        </div>
      )}
      </div>
    </>
  );
}
