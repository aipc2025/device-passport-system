import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Package } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { passportApi } from '../../services/api';
import { ProductLine, OriginCode } from '@device-passport/shared';
import toast from 'react-hot-toast';

interface CreatePassportForm {
  productLine: ProductLine;
  originCode: OriginCode;
  deviceName: string;
  deviceModel: string;
  manufacturer: string;
  manufacturerPartNumber?: string;
  serialNumber?: string;
  manufactureDate?: string;
  warrantyExpiryDate?: string;
  currentLocation?: string;
}

const productLines = Object.values(ProductLine);
const originCodes = Object.values(OriginCode);

export default function PassportCreate() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePassportForm>();

  const createMutation = useMutation({
    mutationFn: (data: CreatePassportForm) => passportApi.create(data as unknown as Record<string, unknown>),
    onSuccess: (data) => {
      toast.success('Device passport created successfully!');
      navigate(`/passports/${data.id}`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create passport');
    },
  });

  const onSubmit = (data: CreatePassportForm) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/passports"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Passports
      </Link>

      <div className="card">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Create Device Passport</h1>
              <p className="text-gray-600">Enter device information to generate a new passport</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Product Classification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Product Line *</label>
                <select
                  className="input"
                  {...register('productLine', { required: 'Required' })}
                >
                  <option value="">Select product line</option>
                  {productLines.map((pl) => (
                    <option key={pl} value={pl}>
                      {pl}
                    </option>
                  ))}
                </select>
                {errors.productLine && (
                  <p className="mt-1 text-sm text-red-600">{errors.productLine.message}</p>
                )}
              </div>
              <div>
                <label className="label">Origin Country *</label>
                <select
                  className="input"
                  {...register('originCode', { required: 'Required' })}
                >
                  <option value="">Select origin</option>
                  {originCodes.map((oc) => (
                    <option key={oc} value={oc}>
                      {oc}
                    </option>
                  ))}
                </select>
                {errors.originCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.originCode.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Device Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Device Information</h2>
            <div>
              <label className="label">Device Name *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Siemens S7-1500 PLC"
                {...register('deviceName', { required: 'Required' })}
              />
              {errors.deviceName && (
                <p className="mt-1 text-sm text-red-600">{errors.deviceName.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Device Model *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., S7-1500"
                  {...register('deviceModel', { required: 'Required' })}
                />
                {errors.deviceModel && (
                  <p className="mt-1 text-sm text-red-600">{errors.deviceModel.message}</p>
                )}
              </div>
              <div>
                <label className="label">Manufacturer *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Siemens"
                  {...register('manufacturer', { required: 'Required' })}
                />
                {errors.manufacturer && (
                  <p className="mt-1 text-sm text-red-600">{errors.manufacturer.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Manufacturer Part Number</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., 6ES7511-1AK02-0AB0"
                  {...register('manufacturerPartNumber')}
                />
              </div>
              <div>
                <label className="label">Serial Number</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., SN-123456789"
                  {...register('serialNumber')}
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Dates & Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Manufacture Date</label>
                <input type="date" className="input" {...register('manufactureDate')} />
              </div>
              <div>
                <label className="label">Warranty Expiry Date</label>
                <input type="date" className="input" {...register('warrantyExpiryDate')} />
              </div>
            </div>
            <div>
              <label className="label">Current Location</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Warehouse A, Shelf 12"
                {...register('currentLocation')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link to="/passports" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Passport'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
