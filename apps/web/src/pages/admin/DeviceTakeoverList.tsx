import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Package,
  Search,
  Check,
  X,
  Clock,
  UserCheck,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../../services/api';
import { TakeoverStatus } from '@device-passport/shared';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface TakeoverRequest {
  id: string;
  requestCode: string;
  deviceName: string;
  deviceModel?: string;
  manufacturer?: string;
  serialNumber?: string;
  takeoverReason: string;
  reasonDescription?: string;
  status: TakeoverStatus;
  estimatedValue?: number;
  valueCurrency: string;
  deviceLocation?: string;
  industry?: string;
  inspectionRequired: boolean;
  inspectionExpertId?: string;
  inspectionReport?: {
    overallCondition: string;
    functionalStatus: string;
    notes: string;
    inspectedAt: string;
  };
  generatedPassportCode?: string;
  customerUser?: {
    name: string;
    email: string;
  };
  reviewNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<TakeoverStatus, { color: string; icon: any; label: string }> = {
  [TakeoverStatus.PENDING]: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
  [TakeoverStatus.INSPECTING]: { color: 'bg-blue-100 text-blue-800', icon: UserCheck, label: 'Inspecting' },
  [TakeoverStatus.REVIEWING]: { color: 'bg-purple-100 text-purple-800', icon: FileText, label: 'Reviewing' },
  [TakeoverStatus.APPROVED]: { color: 'bg-green-100 text-green-800', icon: Check, label: 'Approved' },
  [TakeoverStatus.REJECTED]: { color: 'bg-red-100 text-red-800', icon: X, label: 'Rejected' },
};

// API functions
const takeoverApi = {
  getAll: async (params?: { status?: TakeoverStatus; page?: number; limit?: number }): Promise<{
    data: { requests: TakeoverRequest[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
  }> => {
    const response = await api.get('/admin/device-takeover', { params });
    return response.data;
  },
  approve: async (id: string, notes?: string): Promise<{ data: TakeoverRequest }> => {
    const response = await api.post(`/admin/device-takeover/${id}/approve`, { notes });
    return response.data;
  },
  reject: async (id: string, reason: string): Promise<{ data: TakeoverRequest }> => {
    const response = await api.post(`/admin/device-takeover/${id}/reject`, { reason });
    return response.data;
  },
  assignExpert: async (id: string, expertId: string): Promise<{ data: TakeoverRequest }> => {
    const response = await api.post(`/admin/device-takeover/${id}/assign-expert`, { expertId });
    return response.data;
  },
};

export default function DeviceTakeoverList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [approveNotes, setApproveNotes] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const getStatusLabel = (status: TakeoverStatus) => t(`takeoverStatus.${status}`, STATUS_CONFIG[status]?.label || status);

  // Fetch takeover requests
  const { data, isLoading } = useQuery({
    queryKey: ['admin-device-takeover', statusFilter, page],
    queryFn: () => takeoverApi.getAll({
      status: statusFilter as TakeoverStatus || undefined,
      page,
      limit: 20,
    }),
  });

  const requests = data?.data?.requests || [];
  const pagination = data?.data?.pagination;

  // Filter by search
  const filteredRequests = requests.filter((req) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      req.requestCode.toLowerCase().includes(searchLower) ||
      req.deviceName.toLowerCase().includes(searchLower) ||
      (req.manufacturer || '').toLowerCase().includes(searchLower) ||
      (req.customerUser?.name || '').toLowerCase().includes(searchLower)
    );
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => takeoverApi.approve(id, notes),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-device-takeover'] });
      toast.success(t('deviceTakeover.approved', 'Request approved! Passport: ') + result.data.generatedPassportCode);
      setApprovingId(null);
      setApproveNotes('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('deviceTakeover.approveFailed', 'Failed to approve request'));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => takeoverApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-device-takeover'] });
      toast.success(t('deviceTakeover.rejected', 'Request rejected'));
      setRejectingId(null);
      setRejectReason('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('deviceTakeover.rejectFailed', 'Failed to reject request'));
    },
  });

  // Stats
  const pendingCount = requests.filter((r) => r.status === TakeoverStatus.PENDING).length;
  const inspectingCount = requests.filter((r) => r.status === TakeoverStatus.INSPECTING).length;
  const reviewingCount = requests.filter((r) => r.status === TakeoverStatus.REVIEWING).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6" />
            {t('deviceTakeover.title', 'Device Takeover Requests')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('deviceTakeover.description', 'Manage third-party device takeover requests and passport generation')}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('deviceTakeover.totalRequests', 'Total Requests')}</div>
              <div className="text-xl font-semibold">{pagination?.total || 0}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('deviceTakeover.pending', 'Pending')}</div>
              <div className="text-xl font-semibold">{pendingCount}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('deviceTakeover.inspecting', 'Inspecting')}</div>
              <div className="text-xl font-semibold">{inspectingCount}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('deviceTakeover.reviewing', 'Reviewing')}</div>
              <div className="text-xl font-semibold">{reviewingCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('deviceTakeover.searchRequests', 'Search by code, device, or customer...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('deviceTakeover.allStatuses', 'All Statuses')}</option>
              {Object.values(TakeoverStatus).map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{t('common.loading', 'Loading...')}</div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>{t('deviceTakeover.noRequests', 'No takeover requests found')}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('deviceTakeover.requestCode', 'Request Code')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('deviceTakeover.device', 'Device')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('deviceTakeover.customer', 'Customer')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('deviceTakeover.status', 'Status')}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('deviceTakeover.value', 'Value')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('deviceTakeover.actions', 'Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => {
                const statusConfig = STATUS_CONFIG[request.status];
                const StatusIcon = statusConfig?.icon || Clock;
                const isExpanded = expandedRow === request.id;

                return (
                  <>
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-mono text-sm text-blue-600">{request.requestCode}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{request.deviceName}</div>
                          <div className="text-xs text-gray-500">
                            {request.manufacturer || 'Unknown'} {request.deviceModel && `- ${request.deviceModel}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{request.customerUser?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{request.customerUser?.email}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={clsx(
                            'px-2 py-1 text-xs rounded-full inline-flex items-center gap-1',
                            statusConfig?.color
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm">
                        {request.estimatedValue
                          ? `${request.valueCurrency} ${request.estimatedValue.toLocaleString()}`
                          : '-'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setExpandedRow(isExpanded ? null : request.id)}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title={t('deviceTakeover.viewDetails', 'View Details')}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          {(request.status === TakeoverStatus.PENDING ||
                            request.status === TakeoverStatus.REVIEWING) && (
                            <>
                              <button
                                onClick={() => setApprovingId(request.id)}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title={t('deviceTakeover.approve', 'Approve')}
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setRejectingId(request.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title={t('deviceTakeover.reject', 'Reject')}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${request.id}-details`}>
                        <td colSpan={6} className="px-4 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">{t('deviceTakeover.deviceInfo', 'Device Information')}</h4>
                              <div className="space-y-1 text-gray-600">
                                <div><span className="text-gray-500">{t('deviceTakeover.serialNumber', 'Serial')}:</span> {request.serialNumber || 'N/A'}</div>
                                <div><span className="text-gray-500">{t('deviceTakeover.location', 'Location')}:</span> {request.deviceLocation || 'N/A'}</div>
                                <div><span className="text-gray-500">{t('deviceTakeover.industry', 'Industry')}:</span> {request.industry || 'N/A'}</div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">{t('deviceTakeover.takeoverInfo', 'Takeover Information')}</h4>
                              <div className="space-y-1 text-gray-600">
                                <div><span className="text-gray-500">{t('deviceTakeover.reason', 'Reason')}:</span> {request.takeoverReason}</div>
                                {request.reasonDescription && (
                                  <div><span className="text-gray-500">{t('deviceTakeover.details', 'Details')}:</span> {request.reasonDescription}</div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">{t('deviceTakeover.result', 'Result')}</h4>
                              <div className="space-y-1 text-gray-600">
                                {request.generatedPassportCode && (
                                  <div><span className="text-gray-500">{t('deviceTakeover.passport', 'Passport')}:</span> <span className="font-mono text-green-600">{request.generatedPassportCode}</span></div>
                                )}
                                {request.rejectionReason && (
                                  <div><span className="text-gray-500">{t('deviceTakeover.rejectionReason', 'Rejection')}:</span> <span className="text-red-600">{request.rejectionReason}</span></div>
                                )}
                                {request.inspectionReport && (
                                  <div><span className="text-gray-500">{t('deviceTakeover.condition', 'Condition')}:</span> {request.inspectionReport.overallCondition}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {t('common.showing', 'Showing')} {(page - 1) * 20 + 1} - {Math.min(page * 20, pagination.total)} {t('common.of', 'of')} {pagination.total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                {t('common.previous', 'Previous')}
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                {t('common.next', 'Next')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {approvingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('deviceTakeover.approveTitle', 'Approve Request')}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('deviceTakeover.approveConfirm', 'This will generate a device passport for the customer.')}
            </p>
            <textarea
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              placeholder={t('deviceTakeover.approveNotesPlaceholder', 'Add notes (optional)...')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setApprovingId(null);
                  setApproveNotes('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => approveMutation.mutate({ id: approvingId, notes: approveNotes })}
                disabled={approveMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {approveMutation.isPending ? t('common.processing', 'Processing...') : t('deviceTakeover.approve', 'Approve')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('deviceTakeover.rejectTitle', 'Reject Request')}</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('deviceTakeover.rejectReasonPlaceholder', 'Enter rejection reason...')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              rows={3}
              required
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => {
                  if (!rejectReason.trim()) {
                    toast.error(t('deviceTakeover.rejectReasonRequired', 'Rejection reason is required'));
                    return;
                  }
                  rejectMutation.mutate({ id: rejectingId, reason: rejectReason });
                }}
                disabled={rejectMutation.isPending || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {rejectMutation.isPending ? t('common.processing', 'Processing...') : t('deviceTakeover.reject', 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
