import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Wrench, CheckCircle, Upload, X, Paperclip } from 'lucide-react';
import { serviceOrderApi, uploadApi } from '../services/api';
import { ServiceType } from '@device-passport/shared';
import toast from 'react-hot-toast';
import MapPicker from '../components/common/MapPicker';

interface UploadedFile {
  id: string;
  originalName: string;
  size: number;
}

interface ServiceRequestForm {
  passportCode: string;
  serviceType: ServiceType;
  title: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  serviceAddress: string;
  preferredDate: string;
  locationLat?: number;
  locationLng?: number;
  attachmentFileIds?: string[];
  isUrgent?: boolean;
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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [noPassportCode, setNoPassportCode] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ServiceRequestForm>({
    defaultValues: {
      passportCode: searchParams.get('code') || '',
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Get passport code for file naming (use 'None' if checkbox is checked or empty)
      const passportCodeValue = noPassportCode ? undefined : watch('passportCode');

      for (const file of Array.from(files)) {
        const result = await uploadApi.uploadFile(file, 'SERVICE_ATTACHMENT', passportCodeValue);
        // API returns { success, data, timestamp }, so access result.data
        const fileData = result.data || result;
        setUploadedFiles((prev) => [...prev, {
          id: fileData.id,
          originalName: fileData.originalName,
          size: fileData.size,
        }]);
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const removeFile = async (fileId: string) => {
    try {
      await uploadApi.deleteFile(fileId);
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const onSubmit = async (data: ServiceRequestForm) => {
    setIsLoading(true);
    try {
      const submitData = {
        ...data,
        passportCode: noPassportCode ? undefined : data.passportCode || undefined,
        attachmentFileIds: uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.id) : undefined,
        isUrgent,
      };
      await serviceOrderApi.createPublic(submitData as unknown as Record<string, unknown>);
      setIsSubmitted(true);
      toast.success('Service request submitted successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const msg = error.response?.data?.message;
      if (Array.isArray(msg)) {
        toast.error(msg.join(', '));
      } else {
        toast.error(msg || 'Failed to submit request');
      }
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

          {/* No Passport Code Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="noPassportCode"
              checked={noPassportCode}
              onChange={(e) => {
                setNoPassportCode(e.target.checked);
                if (e.target.checked) {
                  setValue('passportCode', '');
                }
              }}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="noPassportCode" className="ml-2 text-sm text-gray-700">
              I don't have a Device Passport Code
            </label>
          </div>

          {!noPassportCode && (
            <div>
              <label className="label">Passport Code</label>
              <input
                type="text"
                className="input uppercase"
                placeholder="DP-MED-2025-PLC-DE-000001-A7"
                {...register('passportCode')}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter your device passport code, or check the box above if you don't have one.
              </p>
              {errors.passportCode && (
                <p className="mt-1 text-sm text-red-600">{errors.passportCode.message}</p>
              )}
            </div>
          )}

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

          {/* File Attachments */}
          <div>
            <label className="label">Attachments (Optional)</label>
            <p className="text-xs text-gray-500 mb-2">
              Upload photos or documents to help describe the issue (max 10MB each)
            </p>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Files'}
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <ul className="mt-3 space-y-2">
                {uploadedFiles.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 truncate max-w-[200px]">
                        {file.originalName}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Urgent Service Option */}
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <input
              type="checkbox"
              id="isUrgent"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="isUrgent" className="ml-3">
              <span className="text-sm font-medium text-red-800">Need Urgent Service</span>
              <p className="text-xs text-red-600">
                Check this box if this is an emergency and requires immediate attention
              </p>
            </label>
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

          {/* Map Picker */}
          <div>
            <label className="label">Select Location on Map (Optional)</label>
            <p className="text-xs text-gray-500 mb-2">
              Click on the map to select your service location for precise positioning
            </p>
            <Controller
              name="locationLat"
              control={control}
              render={({ field: latField }) => (
                <Controller
                  name="locationLng"
                  control={control}
                  render={({ field: lngField }) => (
                    <MapPicker
                      value={
                        latField.value && lngField.value
                          ? { lat: latField.value, lng: lngField.value }
                          : undefined
                      }
                      onChange={(location) => {
                        if (location) {
                          latField.onChange(location.lat);
                          lngField.onChange(location.lng);
                          if (location.address) {
                            setValue('serviceAddress', location.address);
                          }
                        } else {
                          latField.onChange(undefined);
                          lngField.onChange(undefined);
                        }
                      }}
                      placeholder="Click to select location on map"
                    />
                  )}
                />
              )}
            />
          </div>

          <div>
            <label className="label">Address *</label>
            <input
              type="text"
              className="input"
              {...register('serviceAddress', { required: 'Required' })}
            />
            <p className="text-xs text-gray-500 mt-1">
              You can also select a location on the map above to auto-fill this field
            </p>
            {errors.serviceAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.serviceAddress.message}</p>
            )}
          </div>
          <div>
            <label className="label">Preferred Date</label>
            <input type="date" className="input" {...register('preferredDate')} />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
          {isLoading ? 'Submitting...' : 'Submit Service Request'}
        </button>
      </form>
    </div>
  );
}
