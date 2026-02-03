import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Package,
  Upload,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  Camera,
  FileText,
  Info,
} from 'lucide-react';
import { deviceTakeoverApi, uploadApi } from '../../services/api';
import { TakeoverReason, TAKEOVER_REASON_NAMES, CurrencyCode, CURRENCY_NAMES, FileCategory } from '@device-passport/shared';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import MapPicker from '../../components/common/MapPicker';

interface DeviceTakeoverForm {
  deviceName: string;
  deviceModel: string;
  manufacturer: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  takeoverReason: TakeoverReason;
  reasonDescription: string;
  estimatedValue: number;
  valueCurrency: string;
  deviceLocation: string;
  locationLat?: number;
  locationLng?: number;
  industry: string;
  customerNotes: string;
}

interface UploadedFile {
  id: string;
  originalName: string;
  url?: string;
}

export default function DeviceTakeoverApply() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devicePhotos, setDevicePhotos] = useState<UploadedFile[]>([]);
  const [nameplatePhotos, setNameplatePhotos] = useState<UploadedFile[]>([]);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const lang = i18n.language.startsWith('zh') ? 'zh' : i18n.language.startsWith('vi') ? 'vi' : 'en';

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<DeviceTakeoverForm>({
    defaultValues: {
      takeoverReason: TakeoverReason.NEW_PURCHASE,
      valueCurrency: 'CNY',
    },
  });

  const takeoverReason = watch('takeoverReason');

  const submitMutation = useMutation({
    mutationFn: (data: DeviceTakeoverForm) =>
      deviceTakeoverApi.create({
        ...data,
        locationLat: data.locationLat,
        locationLng: data.locationLng,
        photos: devicePhotos.map((f) => f.id),
        nameplatePhotos: nameplatePhotos.map((f) => f.id),
        documents: documents.map((f) => f.id),
      }),
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success(t('deviceTakeover.submitSuccess', 'Device registration request submitted successfully!'));
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t('deviceTakeover.submitError', 'Failed to submit request'));
    },
  });

  const handleFileUpload = async (
    files: FileList | null,
    type: 'photo' | 'nameplate' | 'document',
  ) => {
    if (!files || files.length === 0) return;

    // Map type to FileCategory
    const categoryMap: Record<string, FileCategory> = {
      photo: FileCategory.DEVICE_PHOTO,
      nameplate: FileCategory.NAMEPLATE_PHOTO,
      document: FileCategory.DEVICE_TAKEOVER,
    };

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const result = await uploadApi.uploadFile(file, categoryMap[type]);
        const fileData = result.data || result;
        const uploadedFile: UploadedFile = {
          id: fileData.id,
          originalName: fileData.originalName,
          url: fileData.url,
        };

        if (type === 'photo') {
          setDevicePhotos((prev) => [...prev, uploadedFile]);
        } else if (type === 'nameplate') {
          setNameplatePhotos((prev) => [...prev, uploadedFile]);
        } else {
          setDocuments((prev) => [...prev, uploadedFile]);
        }
      }
    } catch (err) {
      toast.error(t('common.uploadFailed', 'Failed to upload file'));
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (id: string, type: 'photo' | 'nameplate' | 'document') => {
    if (type === 'photo') {
      setDevicePhotos((prev) => prev.filter((f) => f.id !== id));
    } else if (type === 'nameplate') {
      setNameplatePhotos((prev) => prev.filter((f) => f.id !== id));
    } else {
      setDocuments((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const onSubmit = (data: DeviceTakeoverForm) => {
    if (devicePhotos.length === 0) {
      toast.error(t('deviceTakeover.photoRequired', 'Please upload at least one device photo'));
      return;
    }
    if (nameplatePhotos.length === 0) {
      toast.error(t('deviceTakeover.nameplateRequired', 'Please upload at least one nameplate photo'));
      return;
    }
    submitMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <>
        <Helmet>
          <title>Device Registration - Device Passport System</title>
        </Helmet>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('deviceTakeover.submitted', 'Registration Request Submitted!')}
        </h1>
        <p className="text-gray-600 mb-6">
          {t(
            'deviceTakeover.submittedMessage',
            'Your device registration request has been submitted. Our team will review the information and contact you within 2-3 business days.'
          )}
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/')} className="btn-secondary">
            {t('common.returnHome', 'Return to Home')}
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            {t('common.goToDashboard', 'Go to Dashboard')}
          </button>
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Device Registration - Device Passport System</title>
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('deviceTakeover.title', 'Register Device')}
        </h1>
        <p className="text-gray-600">
          {t('deviceTakeover.subtitle', 'Register your existing device to get a digital passport')}
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">{t('deviceTakeover.infoTitle', 'What is Device Registration?')}</p>
            <p>
              {t(
                'deviceTakeover.infoText',
                'Device registration allows you to add your existing equipment to our platform. After review and approval, we will generate a digital passport with a unique QR code for your device, enabling full lifecycle tracking and service management.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step}
            </div>
            {step < 3 && <div className={`w-16 h-1 ${currentStep > step ? 'bg-primary-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Basic Device Info */}
        {currentStep === 1 && (
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary-500" />
              {t('deviceTakeover.step1', 'Step 1: Device Information')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('deviceTakeover.deviceName', 'Device Name')} *</label>
                <input
                  type="text"
                  className="input"
                  placeholder={t('deviceTakeover.deviceNamePlaceholder', 'e.g., Siemens S7-1500 PLC')}
                  {...register('deviceName', { required: t('common.required', 'Required') })}
                />
                {errors.deviceName && <p className="mt-1 text-sm text-red-600">{errors.deviceName.message}</p>}
              </div>

              <div>
                <label className="label">{t('deviceTakeover.manufacturer', 'Manufacturer')} *</label>
                <input
                  type="text"
                  className="input"
                  placeholder={t('deviceTakeover.manufacturerPlaceholder', 'e.g., Siemens')}
                  {...register('manufacturer', { required: t('common.required', 'Required') })}
                />
                {errors.manufacturer && <p className="mt-1 text-sm text-red-600">{errors.manufacturer.message}</p>}
              </div>

              <div>
                <label className="label">{t('deviceTakeover.model', 'Model')} *</label>
                <input
                  type="text"
                  className="input"
                  placeholder={t('deviceTakeover.modelPlaceholder', 'e.g., 6ES7515-2AM02-0AB0')}
                  {...register('deviceModel', { required: t('common.required', 'Required') })}
                />
                {errors.deviceModel && <p className="mt-1 text-sm text-red-600">{errors.deviceModel.message}</p>}
              </div>

              <div>
                <label className="label">{t('deviceTakeover.serialNumber', 'Serial Number')}</label>
                <input
                  type="text"
                  className="input"
                  placeholder={t('deviceTakeover.serialNumberPlaceholder', 'Found on device nameplate')}
                  {...register('serialNumber')}
                />
              </div>

              <div>
                <label className="label">{t('deviceTakeover.purchaseDate', 'Purchase Date')}</label>
                <input type="date" className="input" {...register('purchaseDate')} />
              </div>

              <div>
                <label className="label">{t('deviceTakeover.warrantyExpiry', 'Warranty Expiry')}</label>
                <input type="date" className="input" {...register('warrantyExpiry')} />
              </div>
            </div>

            <div>
              <label className="label">{t('deviceTakeover.deviceLocation', 'Device Location')}</label>
              <Controller
                name="locationLat"
                control={control}
                render={({ field: latField }) => (
                  <Controller
                    name="locationLng"
                    control={control}
                    render={({ field: lngField }) => (
                      <MapPicker
                        value={latField.value && lngField.value ? { lat: latField.value, lng: lngField.value, address: watch('deviceLocation') } : undefined}
                        onChange={(location) => {
                          if (location) {
                            latField.onChange(location.lat);
                            lngField.onChange(location.lng);
                            if (location.address) {
                              setValue('deviceLocation', location.address);
                            }
                          } else {
                            latField.onChange(undefined);
                            lngField.onChange(undefined);
                            setValue('deviceLocation', '');
                          }
                        }}
                        placeholder={t('deviceTakeover.deviceLocationPlaceholder', 'Click to select device location on map')}
                      />
                    )}
                  />
                )}
              />
              <input
                type="text"
                className="input mt-2"
                placeholder={t('deviceTakeover.addressPlaceholder', 'Or enter address manually')}
                {...register('deviceLocation')}
              />
            </div>

            <div>
              <label className="label">{t('deviceTakeover.industry', 'Industry')}</label>
              <select className="input" {...register('industry')}>
                <option value="">{t('common.select', 'Select...')}</option>
                <option value="Manufacturing">{t('industry.manufacturing', 'Manufacturing')}</option>
                <option value="Energy">{t('industry.energy', 'Energy')}</option>
                <option value="Automotive">{t('industry.automotive', 'Automotive')}</option>
                <option value="Food & Beverage">{t('industry.food', 'Food & Beverage')}</option>
                <option value="Pharmaceutical">{t('industry.pharmaceutical', 'Pharmaceutical')}</option>
                <option value="Logistics">{t('industry.logistics', 'Logistics')}</option>
                <option value="Other">{t('industry.other', 'Other')}</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => setCurrentStep(2)} className="btn-primary">
                {t('common.next', 'Next')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Photos & Documents */}
        {currentStep === 2 && (
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary-500" />
              {t('deviceTakeover.step2', 'Step 2: Photos & Documents')}
            </h2>

            {/* Device Photos */}
            <div>
              <label className="label flex items-center gap-2">
                <Camera className="h-4 w-4" />
                {t('deviceTakeover.devicePhotos', 'Device Photos')} *
              </label>
              <p className="text-sm text-gray-500 mb-2">
                {t('deviceTakeover.devicePhotosHint', 'Upload clear photos showing the entire device from multiple angles')}
              </p>
              <div className="flex flex-wrap gap-3">
                {devicePhotos.map((photo) => (
                  <div key={photo.id} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                    <img
                      src={photo.url || `/api/uploads/${photo.id}`}
                      alt={photo.originalName}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(photo.id, 'photo')}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">{t('common.upload', 'Upload')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'photo')}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Nameplate Photos */}
            <div>
              <label className="label flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('deviceTakeover.nameplatePhotos', 'Nameplate Photos')} *
              </label>
              <p className="text-sm text-gray-500 mb-2">
                {t('deviceTakeover.nameplatePhotosHint', 'Upload clear photos of the device nameplate showing model and serial number')}
              </p>
              <div className="flex flex-wrap gap-3">
                {nameplatePhotos.map((photo) => (
                  <div key={photo.id} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                    <img
                      src={photo.url || `/api/uploads/${photo.id}`}
                      alt={photo.originalName}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(photo.id, 'nameplate')}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">{t('common.upload', 'Upload')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'nameplate')}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Supporting Documents */}
            <div>
              <label className="label flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('deviceTakeover.documents', 'Supporting Documents')} ({t('common.optional', 'Optional')})
              </label>
              <p className="text-sm text-gray-500 mb-2">
                {t('deviceTakeover.documentsHint', 'Upload purchase receipts, manuals, or other supporting documents')}
              </p>
              <div className="flex flex-wrap gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="relative px-3 py-2 border rounded-lg flex items-center gap-2 bg-gray-50"
                  >
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700 max-w-[120px] truncate">{doc.originalName}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(doc.id, 'document')}
                      className="text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <label className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg flex items-center gap-2 cursor-pointer hover:border-primary-500">
                  <Upload className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{t('common.uploadFiles', 'Upload Files')}</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, 'document')}
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setCurrentStep(1)} className="btn-secondary">
                {t('common.back', 'Back')}
              </button>
              <button type="button" onClick={() => setCurrentStep(3)} className="btn-primary">
                {t('common.next', 'Next')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Reason & Submit */}
        {currentStep === 3 && (
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary-500" />
              {t('deviceTakeover.step3', 'Step 3: Registration Reason')}
            </h2>

            <div>
              <label className="label">{t('deviceTakeover.reason', 'Registration Reason')} *</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(TakeoverReason).map((reason) => (
                  <label
                    key={reason}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      takeoverReason === reason
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={reason}
                      {...register('takeoverReason', { required: true })}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {TAKEOVER_REASON_NAMES[reason]?.[lang] || reason}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">{t('deviceTakeover.reasonDescription', 'Additional Details')}</label>
              <textarea
                rows={3}
                className="input"
                placeholder={t('deviceTakeover.reasonDescriptionPlaceholder', 'Provide any additional information about why you want to register this device...')}
                {...register('reasonDescription')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">{t('deviceTakeover.estimatedValue', 'Estimated Value')}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    className="input flex-1"
                    placeholder="0"
                    {...register('estimatedValue', { valueAsNumber: true })}
                  />
                  <select className="input w-28" {...register('valueCurrency')}>
                    {Object.values(CurrencyCode).map((currency) => (
                      <option key={currency} value={currency}>
                        {currency} ({CURRENCY_NAMES[currency]?.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="label">{t('deviceTakeover.notes', 'Additional Notes')}</label>
              <textarea
                rows={2}
                className="input"
                placeholder={t('deviceTakeover.notesPlaceholder', 'Any other information you want to share...')}
                {...register('customerNotes')}
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">{t('deviceTakeover.summary', 'Summary')}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="text-gray-500">{t('deviceTakeover.devicePhotos', 'Device Photos')}:</span>{' '}
                  {devicePhotos.length}
                </p>
                <p>
                  <span className="text-gray-500">{t('deviceTakeover.nameplatePhotos', 'Nameplate Photos')}:</span>{' '}
                  {nameplatePhotos.length}
                </p>
                <p>
                  <span className="text-gray-500">{t('deviceTakeover.documents', 'Documents')}:</span> {documents.length}
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setCurrentStep(2)} className="btn-secondary">
                {t('common.back', 'Back')}
              </button>
              <button type="submit" disabled={submitMutation.isPending} className="btn-primary">
                {submitMutation.isPending
                  ? t('common.submitting', 'Submitting...')
                  : t('deviceTakeover.submit', 'Submit Registration Request')}
              </button>
            </div>
          </div>
        )}
      </form>
      </div>
    </>
  );
}
