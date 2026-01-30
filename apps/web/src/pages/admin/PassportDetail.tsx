import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  QrCode,
  RefreshCw,
} from 'lucide-react';
import { passportApi } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import {
  UserRole,
  DeviceStatus,
  VALID_STATUS_TRANSITIONS,
  PRODUCT_LINE_NAMES,
  DevicePassport,
  LifecycleTimelineItem,
} from '@device-passport/shared';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function PassportDetail() {
  const { id } = useParams<{ id: string }>();
  const { hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DeviceStatus | null>(null);
  const [statusNote, setStatusNote] = useState('');

  const { data: passport, isLoading } = useQuery<DevicePassport>({
    queryKey: ['passport', id],
    queryFn: () => passportApi.getById(id!),
    enabled: !!id,
  });

  const { data: lifecycle } = useQuery<{ data: LifecycleTimelineItem[] }>({
    queryKey: ['passport-lifecycle', id],
    queryFn: () => passportApi.getLifecycle(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, note }: { status: DeviceStatus; note?: string }) =>
      passportApi.updateStatus(id!, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passport', id] });
      queryClient.invalidateQueries({ queryKey: ['passport-lifecycle', id] });
      setShowStatusModal(false);
      setSelectedStatus(null);
      setStatusNote('');
      toast.success('Status updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Device passport not found</p>
        <Link to="/passports" className="btn-primary mt-4">
          Back to List
        </Link>
      </div>
    );
  }

  const validTransitions = VALID_STATUS_TRANSITIONS[passport.status] || [];
  const isUnderWarranty = passport.warrantyExpiryDate
    ? new Date(passport.warrantyExpiryDate) > new Date()
    : false;

  return (
    <div className="space-y-6">
      <Link
        to="/passports"
        className="inline-flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Passports
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="h-6 w-6 text-primary-600" />
              <span className="font-mono text-lg font-semibold">{passport.passportCode}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{passport.deviceName}</h1>
            <p className="text-gray-600">{passport.deviceModel}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="badge-info text-sm">{passport.status.replace(/_/g, ' ')}</span>
            {hasRole([UserRole.QC_INSPECTOR]) && validTransitions.length > 0 && (
              <button
                onClick={() => setShowStatusModal(true)}
                className="btn-secondary"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Status
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Manufacturer</dt>
                <dd className="font-medium">{passport.manufacturer}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Product Line</dt>
                <dd className="font-medium">
                  {PRODUCT_LINE_NAMES[passport.productLine]} ({passport.productLine})
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Origin</dt>
                <dd className="font-medium">{passport.originCode}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Serial Number</dt>
                <dd className="font-medium">{passport.serialNumber || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Part Number</dt>
                <dd className="font-medium">{passport.manufacturerPartNumber || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Current Location</dt>
                <dd className="font-medium">{passport.currentLocation || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Manufacture Date</dt>
                <dd className="font-medium">
                  {passport.manufactureDate
                    ? format(new Date(passport.manufactureDate), 'MMM d, yyyy')
                    : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Warranty Status</dt>
                <dd>
                  <span
                    className={clsx(
                      'badge',
                      isUnderWarranty ? 'badge-success' : 'badge-gray'
                    )}
                  >
                    {isUnderWarranty ? 'Under Warranty' : 'Expired'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Lifecycle Timeline */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lifecycle Timeline</h2>
            {lifecycle?.data && lifecycle.data.length > 0 ? (
              <div className="space-y-4">
                {lifecycle.data.map((event: LifecycleTimelineItem, index: number) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary-600"></div>
                      {index < lifecycle.data.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          {event.newStatus?.replace(/_/g, ' ') || event.eventType.replace(/_/g, ' ')}
                        </p>
                        <span className="text-sm text-gray-500">
                          {format(new Date(event.occurredAt), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">by {event.performedByName}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No lifecycle events yet</p>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="space-y-6">
          <div className="card p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Device QR Code</h2>
            <div className="bg-white p-4 inline-block rounded-lg shadow-sm border">
              <QRCodeSVG
                value={`${window.location.origin}/scan/${passport.passportCode}`}
                size={200}
                level="H"
              />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Scan to view public device information
            </p>
          </div>

          {/* Specifications */}
          {passport.specifications && Object.keys(passport.specifications).length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
              <dl className="space-y-2">
                {Object.entries(passport.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-sm text-gray-500 capitalize">
                      {key.replace(/_/g, ' ')}
                    </dt>
                    <dd className="text-sm font-medium">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Device Status</h2>
            <div className="space-y-4">
              <div>
                <label className="label">New Status</label>
                <select
                  className="input"
                  value={selectedStatus || ''}
                  onChange={(e) => setSelectedStatus(e.target.value as DeviceStatus)}
                >
                  <option value="">Select new status</option>
                  {validTransitions.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Note (optional)</label>
                <textarea
                  className="input"
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add a note about this status change"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedStatus(null);
                  setStatusNote('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedStatus) {
                    updateStatusMutation.mutate({
                      status: selectedStatus,
                      note: statusNote || undefined,
                    });
                  }
                }}
                disabled={!selectedStatus || updateStatusMutation.isPending}
                className="btn-primary"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
