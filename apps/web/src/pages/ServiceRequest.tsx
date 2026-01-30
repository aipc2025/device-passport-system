import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Wrench, CheckCircle } from 'lucide-react';
import { serviceOrderApi } from '../services/api';
import { ServiceType } from '@device-passport/shared';
import toast from 'react-hot-toast';

interface ServiceRequestForm {
  passportCode: string;
  serviceType: ServiceType;
  title: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  serviceAddress: string;
  serviceCity: string;
  preferredDate: string;
}

const serviceTypes = [
  { value: ServiceType.REPAIR, label: 'Repair' },
  { value: ServiceType.MAINTENANCE, label: 'Maintenance' },
  { value: ServiceType.INSPECTION, label: 'Inspection' },
  { value: ServiceType.INSTALLATION, label: 'Installation' },
  { value: ServiceType.UPGRADE, label: 'Upgrade' },
  { value: ServiceType.CONSULTATION, label: 'Consultation' },
];

export default function ServiceRequest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceRequestForm>({
    defaultValues: {
      passportCode: searchParams.get('code') || '',
    },
  });

  const onSubmit = async (data: ServiceRequestForm) => {
    setIsLoading(true);
    try {
      await serviceOrderApi.createPublic(data as unknown as Record<string, unknown>);
      setIsSubmitted(true);
      toast.success('Service request submitted successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h1>
        <p className="text-gray-600 mb-6">
          We have received your service request. Our team will contact you shortly.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-4">
          <Wrench className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Request</h1>
        <p className="text-gray-600">Fill out the form below to request service for your device</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        {/* Device Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Device Information</h2>
          <div>
            <label className="label">Passport Code *</label>
            <input
              type="text"
              className="input uppercase"
              placeholder="DP-MED-2025-PLC-DE-000001-A7"
              {...register('passportCode', { required: 'Passport code is required' })}
            />
            {errors.passportCode && (
              <p className="mt-1 text-sm text-red-600">{errors.passportCode.message}</p>
            )}
          </div>
          <div>
            <label className="label">Service Type *</label>
            <select className="input" {...register('serviceType', { required: 'Required' })}>
              <option value="">Select service type</option>
              {serviceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.serviceType && (
              <p className="mt-1 text-sm text-red-600">{errors.serviceType.message}</p>
            )}
          </div>
        </div>

        {/* Issue Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Issue Details</h2>
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              className="input"
              placeholder="Brief description of the issue"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea
              rows={4}
              className="input"
              placeholder="Detailed description of the issue or service needed"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Name *</label>
              <input
                type="text"
                className="input"
                {...register('contactName', { required: 'Required' })}
              />
              {errors.contactName && (
                <p className="mt-1 text-sm text-red-600">{errors.contactName.message}</p>
              )}
            </div>
            <div>
              <label className="label">Phone *</label>
              <input
                type="tel"
                className="input"
                {...register('contactPhone', { required: 'Required' })}
              />
              {errors.contactPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
              )}
            </div>
          </div>
          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              className="input"
              {...register('contactEmail', {
                required: 'Required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
              })}
            />
            {errors.contactEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
            )}
          </div>
        </div>

        {/* Service Location */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Service Location</h2>
          <div>
            <label className="label">Address *</label>
            <input
              type="text"
              className="input"
              {...register('serviceAddress', { required: 'Required' })}
            />
            {errors.serviceAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.serviceAddress.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input type="text" className="input" {...register('serviceCity')} />
            </div>
            <div>
              <label className="label">Preferred Date</label>
              <input type="date" className="input" {...register('preferredDate')} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
          {isLoading ? 'Submitting...' : 'Submit Service Request'}
        </button>
      </form>
    </div>
  );
}
