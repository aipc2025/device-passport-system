import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { registrationApi } from '../../services/api';
import {
  RegistrationType,
  RegistrationStatus,
  ExpertType,
  REGISTRATION_STATUS_NAMES,
  INDUSTRY_CODE_NAMES,
  SKILL_CODE_NAMES,
  IndustryCode,
  SkillCode,
} from '@device-passport/shared';
import FilePreview from '../../components/common/FilePreview';

// Local mappings for ExpertType display names
const EXPERT_TYPE_DISPLAY: Record<ExpertType, { en: string; zh: string; vi: string }> = {
  [ExpertType.TECHNICAL]: { en: 'Technical', zh: '技术类', vi: 'Kỹ thuật' },
  [ExpertType.BUSINESS]: { en: 'Business', zh: '商务类', vi: 'Kinh doanh' },
};
import {
  BuildingOfficeIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  BanknotesIcon,
  IdentificationIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CubeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface PendingRegistration {
  id: string;
  registrationType: RegistrationType;
  name: string;
  email: string;
  status: RegistrationStatus;
  submittedAt: string;
  companyCode?: string;
  isSupplier?: boolean;
  isBuyer?: boolean;
  expertTypes?: ExpertType[];
}

interface AddressJson {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface UploadedFileInfo {
  id: string;
  originalName: string;
  size: number;
  publicUrl: string;
  mimeType: string;
  fileCategory: string;
}

interface CompanyDetails {
  profile: {
    id: string;
    isSupplier: boolean;
    isBuyer: boolean;
    registeredCapital?: number;
    capitalCurrency?: string;
    companyType?: string;
    establishmentDate?: string;
    legalRepresentative?: string;
    businessScope?: string;
    registeredAddress?: AddressJson;
    businessAddress?: AddressJson;
    taxNumber?: string;
    bankName?: string;
    bankAccountNumber?: string;
    invoicePhone?: string;
    invoiceAddress?: string;
    buyerProductDescription?: string;
    purchaseFrequency?: string;
    purchaseVolume?: string;
    preferredPaymentTerms?: string;
  };
  organization: {
    id: string;
    name: string;
    code: string;
    type: string;
  };
  contacts: Array<{
    id: string;
    contactName: string;
    department?: string;
    position?: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
  }>;
  products: Array<{
    id: string;
    productName: string;
    productCategory?: string;
    specifications?: string;
    monthlyCapacity?: string;
    minOrderQuantity?: string;
    unitPrice?: number;
    priceCurrency?: string;
  }>;
  files: UploadedFileInfo[];
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

interface ExpertDetails {
  expert: {
    id: string;
    expertTypes: ExpertType[];
    industries: IndustryCode[];
    skills: SkillCode[];
    nationality?: string;
    personalName: string;
    idNumber?: string;
    phone?: string;
    dateOfBirth?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    professionalField?: string;
    servicesOffered?: string;
    yearsOfExperience?: number;
    certifications?: string[];
    currentLocation?: string;
    locationLat?: number;
    locationLng?: number;
    isProfilePublic?: boolean;
    bio?: string;
    workHistories?: Array<{
      id: string;
      companyName: string;
      position?: string;
      description?: string;
      startDate: string;
      endDate?: string;
      isCurrent?: boolean;
    }>;
  };
  user: {
    id: string;
    email: string;
    name: string;
  };
  files: UploadedFileInfo[];
}

export default function PendingRegistrations() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.startsWith('zh') ? 'zh' : i18n.language.startsWith('vi') ? 'vi' : 'en';

  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<PendingRegistration | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [expertDetails, setExpertDetails] = useState<ExpertDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await registrationApi.getPending();
      setRegistrations(data);
    } catch (err) {
      setError(t('admin.failedToLoad', 'Failed to load pending registrations'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleViewDetails = async (reg: PendingRegistration) => {
    setSelectedRegistration(reg);
    setDetailsLoading(true);
    setAdminNotes('');
    setCompanyDetails(null);
    setExpertDetails(null);

    try {
      if (reg.registrationType === RegistrationType.COMPANY) {
        const data = await registrationApi.getCompanyDetails(reg.id);
        setCompanyDetails(data);
      } else {
        const data = await registrationApi.getExpertDetails(reg.id);
        setExpertDetails(data);
      }
    } catch (err) {
      console.error('Failed to load details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: RegistrationStatus) => {
    if (!selectedRegistration) return;

    setActionLoading(true);

    try {
      await registrationApi.updateStatus(
        selectedRegistration.id,
        selectedRegistration.registrationType,
        {
          status: newStatus,
          adminNotes: adminNotes || undefined,
        }
      );

      await fetchRegistrations();
      setSelectedRegistration(null);
      setCompanyDetails(null);
      setExpertDetails(null);
      setAdminNotes('');
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (addr?: AddressJson) => {
    if (!addr) return 'N/A';
    const parts = [addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
      <Icon className="h-5 w-5 text-gray-500" />
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    </div>
  );

  const InfoRow = ({ label, value, className = '' }: { label: string; value?: string | number | null; className?: string }) => (
    <div className={`py-1.5 ${className}`}>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5">{value || 'N/A'}</dd>
    </div>
  );

  const renderFileList = (files: UploadedFileInfo[]) => {
    return <FilePreview files={files} />;
  };

  const renderCompanyDetails = () => {
    if (!companyDetails) return null;
    const { profile, organization, contacts, products, files, user } = companyDetails;

    return (
      <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {/* Account Info */}
        <div>
          <SectionTitle icon={UserCircleIcon} title={t('admin.accountInfo', 'Account Information')} />
          <div className="grid grid-cols-2 gap-x-4">
            <InfoRow label={t('admin.email', 'Email')} value={user?.email} />
            <InfoRow label={t('admin.userName', 'User Name')} value={user?.name} />
          </div>
        </div>

        {/* Organization Info */}
        <div>
          <SectionTitle icon={BuildingOfficeIcon} title={t('admin.companyInfo', 'Company Information')} />
          <div className="grid grid-cols-2 gap-x-4">
            <InfoRow label={t('admin.companyName', 'Company Name')} value={organization.name} />
            <InfoRow label={t('admin.companyCode', 'Company Code')} value={organization.code} />
            <InfoRow label={t('admin.companyType', 'Company Type')} value={profile.companyType} />
            <InfoRow label={t('admin.legalRep', 'Legal Representative')} value={profile.legalRepresentative} />
            <InfoRow
              label={t('admin.registeredCapital', 'Registered Capital')}
              value={profile.registeredCapital ? `${profile.capitalCurrency || ''} ${profile.registeredCapital.toLocaleString()}` : undefined}
            />
            <InfoRow label={t('admin.establishmentDate', 'Establishment Date')} value={formatDate(profile.establishmentDate || '')} />
          </div>
          <div className="mt-2">
            <InfoRow label={t('admin.businessScope', 'Business Scope')} value={profile.businessScope} className="col-span-2" />
          </div>
          <div className="mt-3 flex gap-2">
            {profile.isSupplier && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {t('admin.supplier', 'Supplier')}
              </span>
            )}
            {profile.isBuyer && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {t('admin.buyer', 'Buyer')}
              </span>
            )}
          </div>
        </div>

        {/* Addresses */}
        <div>
          <SectionTitle icon={MapPinIcon} title={t('admin.addresses', 'Addresses')} />
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t('admin.registeredAddress', 'Registered Address')}</p>
              <p className="text-sm text-gray-900">{formatAddress(profile.registeredAddress)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t('admin.businessAddress', 'Business Address')}</p>
              <p className="text-sm text-gray-900">{formatAddress(profile.businessAddress)}</p>
              {profile.businessAddress?.latitude && profile.businessAddress?.longitude && (
                <p className="text-xs text-gray-400 mt-1">
                  📍 {profile.businessAddress.latitude.toFixed(6)}, {profile.businessAddress.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Info */}
        {(profile.taxNumber || profile.bankName) && (
          <div>
            <SectionTitle icon={BanknotesIcon} title={t('admin.invoiceInfo', 'Invoice Information')} />
            <div className="grid grid-cols-2 gap-x-4">
              <InfoRow label={t('admin.taxNumber', 'Tax Number')} value={profile.taxNumber} />
              <InfoRow label={t('admin.bankName', 'Bank Name')} value={profile.bankName} />
              <InfoRow label={t('admin.bankAccount', 'Bank Account')} value={profile.bankAccountNumber} />
              <InfoRow label={t('admin.invoicePhone', 'Invoice Phone')} value={profile.invoicePhone} />
            </div>
            <InfoRow label={t('admin.invoiceAddress', 'Invoice Address')} value={profile.invoiceAddress} />
          </div>
        )}

        {/* Buyer Requirements */}
        {profile.isBuyer && (
          <div>
            <SectionTitle icon={CubeIcon} title={t('admin.buyerRequirements', 'Buyer Requirements')} />
            <div className="grid grid-cols-2 gap-x-4">
              <InfoRow label={t('admin.purchaseFrequency', 'Purchase Frequency')} value={profile.purchaseFrequency} />
              <InfoRow label={t('admin.purchaseVolume', 'Purchase Volume')} value={profile.purchaseVolume} />
            </div>
            <InfoRow label={t('admin.paymentTerms', 'Preferred Payment Terms')} value={profile.preferredPaymentTerms} />
            <InfoRow label={t('admin.productDescription', 'Product Requirements')} value={profile.buyerProductDescription} />
          </div>
        )}

        {/* Contacts */}
        <div>
          <SectionTitle icon={UserGroupIcon} title={t('admin.contacts', `Contacts (${contacts.length})`)} />
          {contacts.length === 0 ? (
            <p className="text-sm text-gray-500">{t('admin.noContacts', 'No contacts added')}</p>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact, idx) => (
                <div key={contact.id || idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{contact.contactName}</span>
                    {contact.isPrimary && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        {t('admin.primary', 'Primary')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    {contact.position && <p>{contact.position}{contact.department ? ` - ${contact.department}` : ''}</p>}
                    {contact.email && <p className="flex items-center gap-1"><EnvelopeIcon className="h-3.5 w-3.5" /> {contact.email}</p>}
                    {contact.phone && <p className="flex items-center gap-1"><PhoneIcon className="h-3.5 w-3.5" /> {contact.phone}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products (Supplier) */}
        {profile.isSupplier && (
          <div>
            <SectionTitle icon={CubeIcon} title={t('admin.products', `Products (${products.length})`)} />
            {products.length === 0 ? (
              <p className="text-sm text-gray-500">{t('admin.noProducts', 'No products added')}</p>
            ) : (
              <div className="space-y-3">
                {products.map((product, idx) => (
                  <div key={product.id || idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900 mb-1">{product.productName}</div>
                    <div className="text-sm text-gray-600 grid grid-cols-2 gap-1">
                      {product.productCategory && <p>{t('admin.category', 'Category')}: {product.productCategory}</p>}
                      {product.monthlyCapacity && <p>{t('admin.capacity', 'Capacity')}: {product.monthlyCapacity}</p>}
                      {product.minOrderQuantity && <p>{t('admin.moq', 'MOQ')}: {product.minOrderQuantity}</p>}
                      {product.unitPrice && (
                        <p>{t('admin.price', 'Price')}: {product.priceCurrency} {product.unitPrice}</p>
                      )}
                    </div>
                    {product.specifications && (
                      <p className="text-sm text-gray-500 mt-1">{product.specifications}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Uploaded Files */}
        <div>
          <SectionTitle icon={DocumentTextIcon} title={t('admin.uploadedFiles', 'Uploaded Files')} />
          {renderFileList(files)}
        </div>
      </div>
    );
  };

  const renderExpertDetails = () => {
    if (!expertDetails) return null;
    const { expert, user, files } = expertDetails;

    return (
      <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {/* Account Info */}
        <div>
          <SectionTitle icon={UserCircleIcon} title={t('admin.accountInfo', 'Account Information')} />
          <div className="grid grid-cols-2 gap-x-4">
            <InfoRow label={t('admin.email', 'Email')} value={user?.email} />
            <InfoRow label={t('admin.userName', 'User Name')} value={user?.name} />
          </div>
        </div>

        {/* Personal Info */}
        <div>
          <SectionTitle icon={IdentificationIcon} title={t('admin.personalInfo', 'Personal Information')} />
          <div className="grid grid-cols-2 gap-x-4">
            <InfoRow label={t('admin.fullName', 'Full Name')} value={expert.personalName} />
            <InfoRow label={t('admin.idNumber', 'ID Number')} value={expert.idNumber} />
            <InfoRow label={t('admin.phone', 'Phone')} value={expert.phone} />
            <InfoRow label={t('admin.dateOfBirth', 'Date of Birth')} value={formatDate(expert.dateOfBirth || '')} />
            <InfoRow label={t('admin.nationality', 'Nationality')} value={expert.nationality} />
            <InfoRow label={t('admin.profilePublic', 'Profile Public')} value={expert.isProfilePublic ? 'Yes' : 'No'} />
          </div>
        </div>

        {/* Expert Types */}
        <div>
          <SectionTitle icon={BriefcaseIcon} title={t('admin.expertTypes', 'Expert Types')} />
          <div className="flex flex-wrap gap-2">
            {expert.expertTypes?.map((type) => (
              <span key={type} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {EXPERT_TYPE_DISPLAY[type]?.[lang] || type}
              </span>
            ))}
          </div>
        </div>

        {/* Industries & Skills */}
        {(expert.industries?.length > 0 || expert.skills?.length > 0) && (
          <div>
            <SectionTitle icon={GlobeAltIcon} title={t('admin.industriesSkills', 'Industries & Skills')} />
            {expert.industries?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">{t('admin.industries', 'Industries')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {expert.industries.map((ind) => (
                    <span key={ind} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                      {INDUSTRY_CODE_NAMES[ind]?.[lang] || ind}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {expert.skills?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">{t('admin.skills', 'Skills')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {expert.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-50 text-green-700">
                      {SKILL_CODE_NAMES[skill]?.[lang] || skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Professional Info */}
        <div>
          <SectionTitle icon={AcademicCapIcon} title={t('admin.professionalInfo', 'Professional Information')} />
          <div className="grid grid-cols-2 gap-x-4">
            <InfoRow label={t('admin.professionalField', 'Professional Field')} value={expert.professionalField} />
            <InfoRow label={t('admin.yearsExperience', 'Years of Experience')} value={expert.yearsOfExperience?.toString()} />
          </div>
          <InfoRow label={t('admin.servicesOffered', 'Services Offered')} value={expert.servicesOffered} />
          {expert.certifications && expert.certifications.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">{t('admin.certifications', 'Certifications')}</p>
              <ul className="list-disc list-inside text-sm text-gray-900">
                {expert.certifications.map((cert, idx) => (
                  <li key={idx}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
          {expert.bio && <InfoRow label={t('admin.bio', 'Bio')} value={expert.bio} />}
        </div>

        {/* Emergency Contact */}
        {expert.emergencyContactName && (
          <div>
            <SectionTitle icon={PhoneIcon} title={t('admin.emergencyContact', 'Emergency Contact')} />
            <div className="grid grid-cols-2 gap-x-4">
              <InfoRow label={t('admin.contactName', 'Name')} value={expert.emergencyContactName} />
              <InfoRow label={t('admin.relationship', 'Relationship')} value={expert.emergencyContactRelationship} />
              <InfoRow label={t('admin.phone', 'Phone')} value={expert.emergencyContactPhone} />
            </div>
          </div>
        )}

        {/* Location */}
        <div>
          <SectionTitle icon={MapPinIcon} title={t('admin.location', 'Location')} />
          <InfoRow label={t('admin.currentLocation', 'Current Location')} value={expert.currentLocation} />
          {expert.locationLat && expert.locationLng && (
            <p className="text-xs text-gray-400 mt-1">
              📍 {expert.locationLat.toFixed(6)}, {expert.locationLng.toFixed(6)}
            </p>
          )}
        </div>

        {/* Work History */}
        {expert.workHistories && expert.workHistories.length > 0 && (
          <div>
            <SectionTitle icon={BriefcaseIcon} title={t('admin.workHistory', `Work History (${expert.workHistories.length})`)} />
            <div className="space-y-3">
              {expert.workHistories.map((wh, idx) => (
                <div key={wh.id || idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{wh.companyName}</span>
                    {wh.isCurrent && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        {t('admin.current', 'Current')}
                      </span>
                    )}
                  </div>
                  {wh.position && <p className="text-sm text-gray-700">{wh.position}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(wh.startDate)} - {wh.isCurrent ? t('admin.present', 'Present') : formatDate(wh.endDate || '')}
                  </p>
                  {wh.description && <p className="text-sm text-gray-600 mt-1">{wh.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Files */}
        <div>
          <SectionTitle icon={DocumentTextIcon} title={t('admin.uploadedFiles', 'Uploaded Files')} />
          {renderFileList(files)}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchRegistrations}
          className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {t('common.tryAgain', 'Try Again')}
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pending Registrations - Device Passport System</title>
      </Helmet>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.pendingRegistrations', 'Pending Registrations')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('admin.pendingRegistrationsDesc', 'Review and approve new company and expert registrations')}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="h-5 w-5" />
          <span>{registrations.length} {t('admin.pending', 'pending')}</span>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('admin.allCaughtUp', 'All caught up!')}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('admin.noPending', 'No pending registrations to review.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Registration List */}
          <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {registrations.map((reg) => (
              <div
                key={reg.id}
                className={`bg-white border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRegistration?.id === reg.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleViewDetails(reg)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        reg.registrationType === RegistrationType.COMPANY
                          ? 'bg-blue-100'
                          : 'bg-green-100'
                      }`}
                    >
                      {reg.registrationType === RegistrationType.COMPANY ? (
                        <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                      ) : (
                        <UserCircleIcon className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{reg.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{reg.email}</p>
                    </div>
                  </div>

                  <span
                    className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      reg.status === RegistrationStatus.PENDING
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {REGISTRATION_STATUS_NAMES[reg.status]}
                  </span>
                </div>

                <div className="mt-3 flex items-center flex-wrap gap-2 text-xs text-gray-500">
                  <span>{formatDateTime(reg.submittedAt)}</span>
                  {reg.companyCode && (
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {reg.companyCode}
                    </span>
                  )}
                  {reg.isSupplier && (
                    <span className="text-green-600">{t('admin.supplier', 'Supplier')}</span>
                  )}
                  {reg.isBuyer && <span className="text-blue-600">{t('admin.buyer', 'Buyer')}</span>}
                  {reg.expertTypes && reg.expertTypes.length > 0 && (
                    <span className="text-purple-600">
                      {reg.expertTypes.map((t) => EXPERT_TYPE_DISPLAY[t]?.[lang] || t).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
            {selectedRegistration ? (
              detailsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : companyDetails || expertDetails ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedRegistration.registrationType === RegistrationType.COMPANY
                        ? t('admin.companyRegistration', 'Company Registration')
                        : t('admin.expertRegistration', 'Expert Registration')}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedRegistration.status === RegistrationStatus.PENDING
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {REGISTRATION_STATUS_NAMES[selectedRegistration.status]}
                    </span>
                  </div>

                  {/* Details Content */}
                  {companyDetails && renderCompanyDetails()}
                  {expertDetails && renderExpertDetails()}

                  {/* Admin Notes */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.adminNotes', 'Admin Notes')}
                    </label>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder={t('admin.adminNotesPlaceholder', 'Add notes (visible to applicant if rejected)')}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => handleUpdateStatus(RegistrationStatus.APPROVED)}
                      disabled={actionLoading}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      {t('admin.approve', 'Approve')}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(RegistrationStatus.REJECTED)}
                      disabled={actionLoading}
                      className="flex-1 inline-flex justify-center items-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      {t('admin.reject', 'Reject')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>{t('admin.failedToLoadDetails', 'Failed to load details')}</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <EyeIcon className="h-12 w-12 text-gray-300" />
                <p className="mt-2">{t('admin.selectRegistration', 'Select a registration to view details')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
