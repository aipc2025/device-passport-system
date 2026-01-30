import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  QrCode,
  CheckCircle,
  XCircle,
  MapPin,
  Factory,
  Calendar,
  Shield,
  Wrench,
  ArrowLeft,
} from 'lucide-react';
import { scanApi } from '../services/api';
import { DeviceStatus, PRODUCT_LINE_NAMES, PublicDeviceInfo } from '@device-passport/shared';
import { format } from 'date-fns';
import clsx from 'clsx';

const statusColors: Record<DeviceStatus, string> = {
  [DeviceStatus.CREATED]: 'badge-gray',
  [DeviceStatus.PROCURED]: 'badge-info',
  [DeviceStatus.IN_QC]: 'badge-warning',
  [DeviceStatus.QC_PASSED]: 'badge-success',
  [DeviceStatus.QC_FAILED]: 'badge-danger',
  [DeviceStatus.IN_ASSEMBLY]: 'badge-info',
  [DeviceStatus.IN_TESTING]: 'badge-warning',
  [DeviceStatus.TEST_PASSED]: 'badge-success',
  [DeviceStatus.TEST_FAILED]: 'badge-danger',
  [DeviceStatus.PACKAGED]: 'badge-info',
  [DeviceStatus.IN_TRANSIT]: 'badge-warning',
  [DeviceStatus.DELIVERED]: 'badge-success',
  [DeviceStatus.IN_SERVICE]: 'badge-success',
  [DeviceStatus.MAINTENANCE]: 'badge-warning',
  [DeviceStatus.RETIRED]: 'badge-gray',
};

export default function DevicePublic() {
  const { code } = useParams<{ code: string }>();

  const { data: device, isLoading, error } = useQuery<PublicDeviceInfo>({
    queryKey: ['device-public', code],
    queryFn: () => scanApi.getPublicInfo(code!),
    enabled: !!code,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading device information...</p>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Device Not Found</h1>
        <p className="text-gray-600 mb-6">
          The device passport code could not be found or is invalid.
        </p>
        <Link to="/scan" className="btn-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Try Another Code
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        to="/scan"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Scan
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="h-6 w-6 text-primary-600" />
              <span className="font-mono text-lg font-semibold">{device.passportCode}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{device.deviceName}</h1>
            <p className="text-gray-600">{device.deviceModel}</p>
          </div>
          <span className={clsx('badge text-sm', statusColors[device.status])}>
            {device.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Verification Status */}
      <div className="card p-6 mb-6 bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="font-semibold text-green-900">Verified Authentic</h2>
            <p className="text-green-700 text-sm">
              This device has been verified in our system
            </p>
          </div>
        </div>
      </div>

      {/* Device Details */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
        <dl className="space-y-4">
          <div className="flex items-start gap-3">
            <Factory className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <dt className="text-sm text-gray-500">Manufacturer</dt>
              <dd className="font-medium">{device.manufacturer}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <QrCode className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <dt className="text-sm text-gray-500">Product Line</dt>
              <dd className="font-medium">
                {PRODUCT_LINE_NAMES[device.productLine]} ({device.productLine})
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <dt className="text-sm text-gray-500">Origin</dt>
              <dd className="font-medium">{device.originCode}</dd>
            </div>
          </div>
          {device.manufactureDate && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm text-gray-500">Manufacture Date</dt>
                <dd className="font-medium">
                  {format(new Date(device.manufactureDate), 'MMMM d, yyyy')}
                </dd>
              </div>
            </div>
          )}
        </dl>
      </div>

      {/* Warranty Status */}
      <div
        className={clsx(
          'card p-6 mb-6',
          device.isUnderWarranty ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
        )}
      >
        <div className="flex items-center gap-3">
          <Shield
            className={clsx(
              'h-6 w-6',
              device.isUnderWarranty ? 'text-blue-600' : 'text-gray-400'
            )}
          />
          <div>
            <h2 className="font-semibold">
              {device.isUnderWarranty ? 'Under Warranty' : 'Warranty Expired'}
            </h2>
            {device.warrantyExpiryDate && (
              <p className="text-sm text-gray-600">
                {device.isUnderWarranty ? 'Expires' : 'Expired'} on{' '}
                {format(new Date(device.warrantyExpiryDate), 'MMMM d, yyyy')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Service Request CTA */}
      <div className="card p-6 text-center">
        <Wrench className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Need Service?</h2>
        <p className="text-gray-600 mb-4">
          Submit a service request for this device
        </p>
        <Link
          to={`/service-request?code=${device.passportCode}`}
          className="btn-primary"
        >
          Request Service
        </Link>
      </div>
    </div>
  );
}
