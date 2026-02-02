import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  Wrench,
  CheckCircle,
  Upload,
  X,
  Paperclip,
  HardHat,
  Briefcase,
  QrCode,
  ChevronRight,
  Package,
  User,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  FileText,
} from 'lucide-react';
import { serviceRequestApi, uploadApi, passportApi } from '../services/api';
import {
  ServiceType,
  ServicePrimaryCategory,
  ServiceRequestCategory,
  ServiceUrgency,
  CommonIssueType,
  PreferredTimeOption,
  BudgetRangeOption,
  DEVICE_REQUIRED_CATEGORIES,
  SERVICE_PRIMARY_CATEGORY_NAMES,
  SERVICE_REQUEST_CATEGORY_NAMES,
  SERVICE_URGENCY_NAMES,
  PRIMARY_TO_CATEGORIES,
  CATEGORY_ISSUES,
  COMMON_ISSUE_NAMES,
  PREFERRED_TIME_NAMES,
  BUDGET_RANGE_NAMES,
} from '@device-passport/shared';
import toast from 'react-hot-toast';
import MapPicker from '../components/common/MapPicker';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../store/auth.store';

interface UploadedFile {
  id: string;
  originalName: string;
  size: number;
}

interface DeviceInfo {
  id: string;
  passportCode: string;
  deviceName: string;
  manufacturer?: string;
  model?: string;
  status: string;
  location?: string;
  locationLat?: number;
  locationLng?: number;
  lastMaintenanceDate?: string;
}

interface ServiceRequestForm {
  // Device selection
  hasPassport: boolean;
  deviceSelectionMode: 'list' | 'scan' | 'manual';
  selectedDeviceId?: string;
  passportCode: string;

  // Service type
  serviceMode: 'service' | 'registration'; // 'service' for normal service, 'registration' for device registration
  primaryCategory: ServicePrimaryCategory;
  category: ServiceRequestCategory;
  selectedIssues: CommonIssueType[];
  issueDescription: string;

  // Service requirements
  urgency: ServiceUrgency;
  preferredTime: PreferredTimeOption;
  specificDate?: string;
  budgetRange: BudgetRangeOption;
  customBudgetMin?: number;
  customBudgetMax?: number;

  // Contact info
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  useAccountContact: boolean;

  // Location
  serviceAddress: string;
  locationLat?: number;
  locationLng?: number;
  useDeviceLocation: boolean;
}

// Primary category icons
const primaryCategoryIcons: Record<ServicePrimaryCategory, React.ReactNode> = {
  [ServicePrimaryCategory.DEVICE]: <Wrench className="h-6 w-6 sm:h-8 sm:w-8" />,
  [ServicePrimaryCategory.LABOR]: <HardHat className="h-6 w-6 sm:h-8 sm:w-8" />,
  [ServicePrimaryCategory.CONSULTING]: <Briefcase className="h-6 w-6 sm:h-8 sm:w-8" />,
};

export default function ServiceRequest() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const lang = i18n.language === 'zh' ? 'zh' : 'en';

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
      hasPassport: !!searchParams.get('code'),
      deviceSelectionMode: isAuthenticated ? 'list' : 'manual',
      serviceMode: 'service',
      primaryCategory: ServicePrimaryCategory.DEVICE,
      category: ServiceRequestCategory.DEVICE_REPAIR,
      selectedIssues: [],
      issueDescription: '',
      urgency: ServiceUrgency.NORMAL,
      preferredTime: PreferredTimeOption.THIS_WEEK,
      budgetRange: BudgetRangeOption.NO_LIMIT,
      useAccountContact: isAuthenticated,
      useDeviceLocation: true,
    },
  });

  const primaryCategory = watch('primaryCategory');
  const category = watch('category');
  const deviceSelectionMode = watch('deviceSelectionMode');
  const preferredTime = watch('preferredTime');
  const budgetRange = watch('budgetRange');
  const selectedIssues = watch('selectedIssues') || [];
  const useAccountContact = watch('useAccountContact');
  const hasPassport = watch('hasPassport');
  const serviceMode = watch('serviceMode');

  // Fetch user's devices if authenticated
  const { data: myDevices } = useQuery({
    queryKey: ['my-devices'],
    queryFn: () => passportApi.getAll({ limit: 100 }),
    enabled: isAuthenticated && hasPassport,
  });

  // Get available sub-categories for selected primary category
  const availableCategories = useMemo(() => {
    return PRIMARY_TO_CATEGORIES[primaryCategory] || [];
  }, [primaryCategory]);

  // Get available issues for selected category
  const availableIssues = useMemo(() => {
    return CATEGORY_ISSUES[category] || [CommonIssueType.OTHER];
  }, [category]);

  // Check if device is required for this category
  const requiresDevice = DEVICE_REQUIRED_CATEGORIES.includes(category);
  const isDeviceService = primaryCategory === ServicePrimaryCategory.DEVICE;

  // Handle primary category change
  const handlePrimaryCategoryChange = (primary: ServicePrimaryCategory) => {
    setValue('primaryCategory', primary);
    const categories = PRIMARY_TO_CATEGORIES[primary];
    if (categories.length > 0) {
      setValue('category', categories[0]);
    }
    setValue('selectedIssues', []);
    setValue('serviceMode', 'service');
  };

  // Handle device selection from list
  const handleDeviceSelect = (device: DeviceInfo) => {
    setSelectedDevice(device);
    setValue('selectedDeviceId', device.id);
    setValue('passportCode', device.passportCode);

    // Auto-fill location from device
    if (device.location) {
      setValue('serviceAddress', device.location);
    }
    if (device.locationLat && device.locationLng) {
      setValue('locationLat', device.locationLat);
      setValue('locationLng', device.locationLng);
    }
  };

  // Auto-fill contact info from user account
  useEffect(() => {
    if (isAuthenticated && user && useAccountContact) {
      setValue('contactName', user.name || '');
      setValue('contactEmail', user.email || '');
    }
  }, [isAuthenticated, user, useAccountContact, setValue]);

  // Handle issue toggle
  const toggleIssue = (issue: CommonIssueType) => {
    const current = selectedIssues;
    if (current.includes(issue)) {
      setValue('selectedIssues', current.filter((i) => i !== issue));
    } else {
      setValue('selectedIssues', [...current, issue]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const result = await uploadApi.uploadFile(file, 'SERVICE_ATTACHMENT', watch('passportCode') || undefined);
        const fileData = result.data || result;
        setUploadedFiles((prev) => [
          ...prev,
          {
            id: fileData.id,
            originalName: fileData.originalName,
            size: fileData.size,
          },
        ]);
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(t('common.uploadFailed', 'Failed to upload file'));
    } finally {
      setUploading(false);
      e.target.value = '';
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

  // Convert budget range to min/max values
  const getBudgetValues = (range: BudgetRangeOption, customMin?: number, customMax?: number) => {
    switch (range) {
      case BudgetRangeOption.UNDER_500:
        return { min: 0, max: 500 };
      case BudgetRangeOption.RANGE_500_2000:
        return { min: 500, max: 2000 };
      case BudgetRangeOption.RANGE_2000_5000:
        return { min: 2000, max: 5000 };
      case BudgetRangeOption.OVER_5000:
        return { min: 5000, max: undefined };
      case BudgetRangeOption.CUSTOM:
        return { min: customMin, max: customMax };
      default:
        return { min: undefined, max: undefined };
    }
  };

  const onSubmit = async (data: ServiceRequestForm) => {
    // Validate device for device services when passport is required
    if (requiresDevice && hasPassport && !data.passportCode && !selectedDevice) {
      toast.error(t('serviceRequest.deviceRequired', 'Please select or enter a device'));
      return;
    }

    setIsLoading(true);
    try {
      const budget = getBudgetValues(data.budgetRange, data.customBudgetMin, data.customBudgetMax);

      // Map old ServiceType from category
      const serviceTypeMap: Record<ServiceRequestCategory, ServiceType> = {
        [ServiceRequestCategory.DEVICE_REPAIR]: ServiceType.REPAIR,
        [ServiceRequestCategory.DEVICE_MAINTENANCE]: ServiceType.MAINTENANCE,
        [ServiceRequestCategory.DEVICE_INSTALLATION]: ServiceType.INSTALLATION,
        [ServiceRequestCategory.DEVICE_INSPECTION]: ServiceType.INSPECTION,
        [ServiceRequestCategory.DEVICE_TAKEOVER]: ServiceType.CONSULTATION,
        [ServiceRequestCategory.LABOR_ELECTRICAL]: ServiceType.INSTALLATION,
        [ServiceRequestCategory.LABOR_MECHANICAL]: ServiceType.INSTALLATION,
        [ServiceRequestCategory.LABOR_PLUMBING]: ServiceType.INSTALLATION,
        [ServiceRequestCategory.LABOR_GENERAL]: ServiceType.MAINTENANCE,
        [ServiceRequestCategory.CONSULTING_TECHNICAL]: ServiceType.CONSULTATION,
        [ServiceRequestCategory.CONSULTING_TRAINING]: ServiceType.CONSULTATION,
        [ServiceRequestCategory.CONSULTING_CERTIFICATION]: ServiceType.CONSULTATION,
      };

      const submitData = {
        title: `${SERVICE_REQUEST_CATEGORY_NAMES[data.category]?.[lang]} - ${data.selectedIssues.map((i) => COMMON_ISSUE_NAMES[i]?.[lang]).join(', ') || t('serviceRequest.generalRequest', 'General Request')}`,
        description: data.issueDescription || data.selectedIssues.map((i) => COMMON_ISSUE_NAMES[i]?.[lang]).join(', '),
        serviceType: serviceTypeMap[data.category],
        category: data.category,
        urgency: data.urgency,
        passportCode: data.hasPassport ? (data.passportCode || selectedDevice?.passportCode || undefined) : undefined,
        serviceLocation: data.serviceAddress,
        locationLat: data.locationLat,
        locationLng: data.locationLng,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        budgetMin: budget.min,
        budgetMax: budget.max,
        budgetCurrency: 'CNY',
        preferredDate: data.preferredTime === PreferredTimeOption.SPECIFIC ? data.specificDate : undefined,
        preferredTimeOption: data.preferredTime,
        selectedIssues: data.selectedIssues,
        attachmentFileIds: uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.id) : undefined,
      };

      await serviceRequestApi.createPublic(submitData);
      setIsSubmitted(true);
      toast.success(t('serviceRequest.submitSuccess', 'Service request submitted successfully!'));
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[] } } };
      const msg = error.response?.data?.message;
      if (Array.isArray(msg)) {
        toast.error(msg.join(', '));
      } else {
        toast.error(msg || t('serviceRequest.submitFailed', 'Failed to submit request'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle "Device Registration" selection - redirect to registration form
  const handleDeviceRegistration = () => {
    navigate('/device-takeover/apply');
  };

  if (isSubmitted) {
    return (
      <>
        <Helmet>
          <title>{t('serviceRequest.successPageTitle', 'Request Submitted - Device Passport System')}</title>
        </Helmet>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('serviceRequest.submitted', 'Request Submitted!')}</h1>
        <p className="text-gray-600 mb-6">
          {t('serviceRequest.submittedMessage', 'We have received your service request. Our experts will contact you shortly.')}
        </p>
        <button onClick={() => navigate('/')} className="btn-primary">
          {t('common.returnHome', 'Return to Home')}
        </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('serviceRequest.pageTitle', 'Request Service - Device Passport System')}</title>
        <meta name="description" content={t('serviceRequest.pageDescription', 'Submit a service request for device repair, maintenance, installation or expert consultation')} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={t('serviceRequest.pageTitle', 'Request Service - Device Passport System')} />
        <meta property="og:description" content={t('serviceRequest.pageDescription', 'Submit a service request for device repair, maintenance, installation or expert consultation')} />
        <meta property="og:image" content="/luna-logo.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={t('serviceRequest.pageTitle', 'Request Service - Device Passport System')} />
        <meta property="twitter:description" content={t('serviceRequest.pageDescription', 'Submit a service request for device repair, maintenance, installation or expert consultation')} />
        <meta property="twitter:image" content="/luna-logo.png" />

        {/* Additional SEO */}
        <meta name="keywords" content="service request, equipment repair, maintenance, equipment installation, device consultation, technical support" />
        <meta name="author" content="LUNA INDUSTRY" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('serviceRequest.title', 'Service Request')}</h1>
        <p className="text-gray-600 text-sm sm:text-base">{t('serviceRequest.subtitle', 'Tell us what you need and we will match you with the right experts')}</p>
      </div>

      {/* Progress Steps - Now 3 steps */}
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
            {step < 3 && <div className={`w-12 sm:w-16 h-1 ${currentStep > step ? 'bg-primary-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Service Selection (Merged Device + Service Type) */}
        {currentStep === 1 && (
          <div className="card p-4 sm:p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary-500" />
              {t('serviceRequest.step1New', 'Step 1: Select Service')}
            </h2>

            {/* Primary Category */}
            <div>
              <label className="label mb-3">{t('serviceRequest.primaryCategory', 'Service Category')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Device Registration Option */}
                <button
                  type="button"
                  onClick={handleDeviceRegistration}
                  className="p-3 sm:p-4 rounded-xl border-2 border-dashed border-green-300 text-center transition-all hover:border-green-500 hover:bg-green-50"
                >
                  <div className="mx-auto mb-2 text-green-500">
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 mx-auto" />
                  </div>
                  <p className="font-medium text-green-700 text-sm">{t('serviceRequest.deviceRegistration', 'Device Registration')}</p>
                  <p className="text-xs text-green-600 mt-1">{t('serviceRequest.freeService', 'Free')}</p>
                </button>

                {/* Regular Service Categories */}
                {Object.values(ServicePrimaryCategory).map((primary) => (
                  <button
                    key={primary}
                    type="button"
                    onClick={() => handlePrimaryCategoryChange(primary)}
                    className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all ${
                      primaryCategory === primary && serviceMode === 'service'
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`mx-auto mb-2 ${primaryCategory === primary && serviceMode === 'service' ? 'text-primary-600' : 'text-gray-400'}`}>
                      {primaryCategoryIcons[primary]}
                    </div>
                    <p className="font-medium text-gray-900 text-sm">{SERVICE_PRIMARY_CATEGORY_NAMES[primary]?.[lang]}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Category */}
            {serviceMode === 'service' && (
              <div>
                <label className="label mb-3">{t('serviceRequest.subCategory', 'Service Type')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setValue('category', cat);
                        setValue('selectedIssues', []);
                      }}
                      className={`p-2 sm:p-3 rounded-lg border-2 text-xs sm:text-sm font-medium transition-colors ${
                        category === cat ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {SERVICE_REQUEST_CATEGORY_NAMES[cat]?.[lang]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Device Passport Checkbox - Only for device services */}
            {isDeviceService && serviceMode === 'service' && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="hasPassport"
                    {...register('hasPassport')}
                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="hasPassport" className="font-medium text-blue-900 cursor-pointer">
                      {t('serviceRequest.hasPassport', 'I have a device passport number')}
                    </label>
                    <p className="text-sm text-blue-700 mt-1">
                      {t('serviceRequest.hasPassportHint', 'If you have a device passport code, we can match your device information automatically')}
                    </p>
                  </div>
                </div>

                {/* Device Selection - Only shown when hasPassport is checked */}
                {hasPassport && (
                  <div className="mt-4 pt-4 border-t border-blue-200 space-y-4">
                    {/* Device selection mode */}
                    {isAuthenticated && (
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setValue('deviceSelectionMode', 'list')}
                          className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-colors ${
                            deviceSelectionMode === 'list' ? 'border-primary-500 bg-white' : 'border-blue-200 hover:border-blue-300 bg-white/50'
                          }`}
                        >
                          <Package className="h-5 w-5 mx-auto mb-1 text-primary-500" />
                          <span className="text-xs font-medium">{t('serviceRequest.fromDeviceList', 'My Devices')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue('deviceSelectionMode', 'scan')}
                          className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-colors ${
                            deviceSelectionMode === 'scan' ? 'border-primary-500 bg-white' : 'border-blue-200 hover:border-blue-300 bg-white/50'
                          }`}
                        >
                          <QrCode className="h-5 w-5 mx-auto mb-1 text-primary-500" />
                          <span className="text-xs font-medium">{t('serviceRequest.scanDevice', 'Scan QR')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue('deviceSelectionMode', 'manual')}
                          className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-colors ${
                            deviceSelectionMode === 'manual' ? 'border-primary-500 bg-white' : 'border-blue-200 hover:border-blue-300 bg-white/50'
                          }`}
                        >
                          <FileText className="h-5 w-5 mx-auto mb-1 text-primary-500" />
                          <span className="text-xs font-medium">{t('serviceRequest.enterCode', 'Enter Code')}</span>
                        </button>
                      </div>
                    )}

                    {/* Device list */}
                    {isAuthenticated && deviceSelectionMode === 'list' && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {myDevices?.items?.length > 0 ? (
                          myDevices.items.map((device: DeviceInfo) => (
                            <div
                              key={device.id}
                              onClick={() => handleDeviceSelect(device)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors bg-white ${
                                selectedDevice?.id === device.id ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{device.passportCode}</p>
                                  <p className="text-xs text-gray-500">{device.deviceName}</p>
                                </div>
                                {selectedDevice?.id === device.id && <CheckCircle className="h-5 w-5 text-primary-500" />}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-4 text-sm">{t('serviceRequest.noDevices', 'No devices found')}</p>
                        )}
                      </div>
                    )}

                    {/* Manual code entry */}
                    {(!isAuthenticated || deviceSelectionMode === 'manual') && (
                      <div>
                        <label className="label text-blue-900">{t('serviceRequest.passportCode', 'Device Passport Code')}</label>
                        <input
                          type="text"
                          className="input uppercase bg-white"
                          placeholder="DP-XXX-XXXX-XX-XX-XXXXXX-XX"
                          {...register('passportCode')}
                        />
                      </div>
                    )}

                    {/* Selected device info */}
                    {selectedDevice && deviceSelectionMode === 'list' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="font-medium text-green-800 text-sm">{t('serviceRequest.selectedDevice', 'Selected Device')}</p>
                        <p className="text-sm text-green-700">{selectedDevice.deviceName} - {selectedDevice.passportCode}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Common Issues (predefined options) */}
            {serviceMode === 'service' && availableIssues.length > 1 && (
              <div>
                <label className="label mb-3">{t('serviceRequest.commonIssues', 'Common Issues (Select all that apply)')}</label>
                <div className="flex flex-wrap gap-2">
                  {availableIssues.map((issue) => (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => toggleIssue(issue)}
                      className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        selectedIssues.includes(issue)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {COMMON_ISSUE_NAMES[issue]?.[lang]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Description */}
            {serviceMode === 'service' && (
              <div>
                <label className="label">{t('serviceRequest.additionalInfo', 'Additional Information')} ({t('common.optional', 'Optional')})</label>
                <textarea
                  rows={3}
                  className="input"
                  placeholder={t('serviceRequest.additionalInfoPlaceholder', 'Any additional details about your service needs...')}
                  {...register('issueDescription')}
                />
              </div>
            )}

            {/* File Attachments */}
            {serviceMode === 'service' && (
              <div>
                <label className="label">{t('serviceRequest.attachments', 'Attachments')} ({t('common.optional', 'Optional')})</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? t('common.uploading', 'Uploading...') : t('common.uploadFiles', 'Upload Files')}
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
                {uploadedFiles.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {uploadedFiles.map((file) => (
                      <li key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <Paperclip className="h-4 w-4 text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-700 truncate">{file.originalName}</span>
                          <span className="text-xs text-gray-500 shrink-0">({formatFileSize(file.size)})</span>
                        </div>
                        <button type="button" onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-red-500 ml-2">
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button type="button" onClick={() => setCurrentStep(2)} className="btn-primary">
                {t('common.next', 'Next')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Service Requirements */}
        {currentStep === 2 && (
          <div className="card p-4 sm:p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-500" />
              {t('serviceRequest.step2New', 'Step 2: Service Requirements')}
            </h2>

            {/* Urgency */}
            <div>
              <label className="label mb-3">{t('serviceRequest.urgency', 'Urgency Level')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.values(ServiceUrgency).map((urg) => (
                  <label
                    key={urg}
                    className={`flex items-center justify-center p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      watch('urgency') === urg
                        ? urg === ServiceUrgency.URGENT
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : urg === ServiceUrgency.HIGH
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input type="radio" value={urg} {...register('urgency')} className="sr-only" />
                    <span className="text-xs sm:text-sm font-medium">{SERVICE_URGENCY_NAMES[urg]?.[lang]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Preferred Time */}
            <div>
              <label className="label mb-3">{t('serviceRequest.preferredTime', 'Preferred Time')}</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.values(PreferredTimeOption).map((time) => (
                  <label
                    key={time}
                    className={`flex items-center justify-center p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      preferredTime === time ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input type="radio" value={time} {...register('preferredTime')} className="sr-only" />
                    <span className="text-xs sm:text-sm font-medium text-center">{PREFERRED_TIME_NAMES[time]?.[lang]}</span>
                  </label>
                ))}
              </div>
              {preferredTime === PreferredTimeOption.SPECIFIC && (
                <div className="mt-3">
                  <input type="date" className="input" {...register('specificDate')} />
                </div>
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="label mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('serviceRequest.budget', 'Budget Range (CNY)')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(BudgetRangeOption).map((range) => (
                  <label
                    key={range}
                    className={`flex items-center justify-center p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      budgetRange === range ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input type="radio" value={range} {...register('budgetRange')} className="sr-only" />
                    <span className="text-xs sm:text-sm font-medium">{BUDGET_RANGE_NAMES[range]?.[lang]}</span>
                  </label>
                ))}
              </div>
              {budgetRange === BudgetRangeOption.CUSTOM && (
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('serviceRequest.budgetMin', 'Min')}</label>
                    <input type="number" min="0" className="input" {...register('customBudgetMin', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <label className="label">{t('serviceRequest.budgetMax', 'Max')}</label>
                    <input type="number" min="0" className="input" {...register('customBudgetMax', { valueAsNumber: true })} />
                  </div>
                </div>
              )}
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

        {/* Step 3: Contact & Location */}
        {currentStep === 3 && (
          <div className="card p-4 sm:p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-primary-500" />
              {t('serviceRequest.step3New', 'Step 3: Contact & Location')}
            </h2>

            {/* Contact Info */}
            <div className="space-y-4">
              {isAuthenticated && (
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="useAccountContact"
                    {...register('useAccountContact')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="useAccountContact" className="ml-2 text-sm text-gray-700">
                    {t('serviceRequest.useAccountContact', 'Use my account contact information')}
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('serviceRequest.contactName', 'Contact Name')} *</label>
                  <input type="text" className="input" {...register('contactName', { required: t('common.required', 'Required') })} />
                  {errors.contactName && <p className="mt-1 text-sm text-red-600">{errors.contactName.message}</p>}
                </div>
                <div>
                  <label className="label">{t('serviceRequest.phone', 'Phone')} *</label>
                  <input type="tel" className="input" {...register('contactPhone', { required: t('common.required', 'Required') })} />
                  {errors.contactPhone && <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>}
                </div>
              </div>
              <div>
                <label className="label">{t('serviceRequest.email', 'Email')} *</label>
                <input
                  type="email"
                  className="input"
                  {...register('contactEmail', {
                    required: t('common.required', 'Required'),
                    pattern: { value: /^\S+@\S+$/i, message: t('common.invalidEmail', 'Invalid email') },
                  })}
                />
                {errors.contactEmail && <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>}
              </div>
            </div>

            {/* Service Location */}
            <div className="space-y-4">
              <label className="label flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('serviceRequest.serviceLocation', 'Service Location')}
              </label>

              {selectedDevice?.location && (
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="useDeviceLocation"
                    {...register('useDeviceLocation')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="useDeviceLocation" className="ml-2 text-sm text-gray-700">
                    {t('serviceRequest.useDeviceLocation', 'Use device location')}: {selectedDevice.location}
                  </label>
                </div>
              )}

              <Controller
                name="locationLat"
                control={control}
                render={({ field: latField }) => (
                  <Controller
                    name="locationLng"
                    control={control}
                    render={({ field: lngField }) => (
                      <MapPicker
                        value={latField.value && lngField.value ? { lat: latField.value, lng: lngField.value } : undefined}
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
                        placeholder={t('serviceRequest.mapPlaceholder', 'Click to select location on map')}
                      />
                    )}
                  />
                )}
              />

              <div>
                <label className="label">{t('serviceRequest.address', 'Address')} *</label>
                <input type="text" className="input" {...register('serviceAddress', { required: t('common.required', 'Required') })} />
                {errors.serviceAddress && <p className="mt-1 text-sm text-red-600">{errors.serviceAddress.message}</p>}
              </div>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setCurrentStep(2)} className="btn-secondary">
                {t('common.back', 'Back')}
              </button>
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? t('common.submitting', 'Submitting...') : t('serviceRequest.submit', 'Submit Request')}
              </button>
            </div>
          </div>
        )}
      </form>
      </div>
    </>
  );
}
