import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegistrationStore } from '../../../store/registration.store';
import { registrationApi } from '../../../services/api';
import FileUploader from '../common/FileUploader';
import MapPicker from '../../common/MapPicker';
import { CompanyType, FileCategory } from '@device-passport/shared';
import { CheckCircleIcon, XCircleIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function BusinessLicenseStep() {
  const { t } = useTranslation();
  const { companyData, updateCompanyData } = useRegistrationStore();
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [showBusinessAddressMap, setShowBusinessAddressMap] = useState(false);

  // Check code availability with debounce
  useEffect(() => {
    if (companyData.organizationCode.length !== 3) {
      setCodeStatus('idle');
      return;
    }

    const timeout = setTimeout(async () => {
      setCodeStatus('checking');
      try {
        const result = await registrationApi.checkCodeAvailability(companyData.organizationCode);
        setCodeStatus(result.available ? 'available' : 'taken');
      } catch {
        setCodeStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [companyData.organizationCode]);

  const handleBusinessAddressSelect = (location: { lat: number; lng: number; address: string }) => {
    updateCompanyData({
      businessAddress: {
        ...companyData.businessAddress,
        street: location.address,
        latitude: location.lat,
        longitude: location.lng,
      },
    });
    setShowBusinessAddressMap(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{t('registration.businessLicense.title', 'Business License Information')}</h2>
        <p className="mt-2 text-sm text-gray-500">
          {t('registration.businessLicense.subtitle', 'Provide your company details and upload your business license.')}
        </p>
      </div>

      {/* Account Information */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">{t('registration.account.title', 'Account Information')}</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="label">{t('registration.account.email', 'Email')} *</label>
            <input
              type="email"
              required
              value={companyData.email}
              onChange={(e) => updateCompanyData({ email: e.target.value })}
              className="input"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="label">{t('registration.account.name', 'Your Name')} *</label>
            <input
              type="text"
              required
              value={companyData.userName}
              onChange={(e) => updateCompanyData({ userName: e.target.value })}
              className="input"
              placeholder={t('registration.account.namePlaceholder', 'Enter your full name')}
            />
          </div>

          <div>
            <label className="label">{t('registration.account.password', 'Password')} *</label>
            <input
              type="password"
              required
              minLength={8}
              value={companyData.password}
              onChange={(e) => updateCompanyData({ password: e.target.value })}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="label">{t('registration.account.confirmPassword', 'Confirm Password')} *</label>
            <input
              type="password"
              required
              value={companyData.confirmPassword}
              onChange={(e) => updateCompanyData({ confirmPassword: e.target.value })}
              className="input"
              placeholder="••••••••"
            />
            {companyData.password && companyData.confirmPassword &&
             companyData.password !== companyData.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">{t('registration.account.passwordMismatch', 'Passwords do not match')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">{t('registration.company.title', 'Company Information')}</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="label">{t('registration.company.name', 'Company Name')} *</label>
            <input
              type="text"
              required
              value={companyData.organizationName}
              onChange={(e) => updateCompanyData({ organizationName: e.target.value })}
              className="input"
              placeholder={t('registration.company.namePlaceholder', 'Enter company name')}
            />
          </div>

          <div>
            <label className="label">
              {t('registration.company.code', 'Organization Code')} * ({t('registration.company.codeHint', '3 letters')})
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={3}
                pattern="[A-Z]{3}"
                value={companyData.organizationCode}
                onChange={(e) =>
                  updateCompanyData({ organizationCode: e.target.value.toUpperCase() })
                }
                className={`input uppercase pr-10 ${
                  codeStatus === 'taken'
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                    : codeStatus === 'available'
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                      : ''
                }`}
                placeholder="ABC"
              />
              {codeStatus === 'checking' && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              )}
              {codeStatus === 'available' && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
              )}
              {codeStatus === 'taken' && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {codeStatus === 'taken' && (
              <p className="mt-2 text-sm text-red-600">{t('registration.company.codeTaken', 'This code is already taken')}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              {t('registration.company.codeUsage', 'Used in device passport codes (e.g., DP-ABC-2025-...)')}
            </p>
          </div>

          <div>
            <label className="label">{t('registration.company.type', 'Company Type')}</label>
            <select
              value={companyData.companyType || ''}
              onChange={(e) =>
                updateCompanyData({ companyType: e.target.value as CompanyType || undefined })
              }
              className="select"
            >
              <option value="">{t('common.select', 'Select...')}</option>
              <option value={CompanyType.LLC}>{t('companyType.llc', 'LLC')}</option>
              <option value={CompanyType.CORPORATION}>{t('companyType.corporation', 'Corporation')}</option>
              <option value={CompanyType.PARTNERSHIP}>{t('companyType.partnership', 'Partnership')}</option>
              <option value={CompanyType.SOLE_PROPRIETORSHIP}>{t('companyType.soleProprietorship', 'Sole Proprietorship')}</option>
              <option value={CompanyType.OTHER}>{t('companyType.other', 'Other')}</option>
            </select>
          </div>

          <div>
            <label className="label">{t('registration.company.legalRep', 'Legal Representative')}</label>
            <input
              type="text"
              value={companyData.legalRepresentative || ''}
              onChange={(e) => updateCompanyData({ legalRepresentative: e.target.value })}
              className="input"
              placeholder={t('registration.company.legalRepPlaceholder', 'Enter legal representative name')}
            />
          </div>

          <div>
            <label className="label">{t('registration.company.capital', 'Registered Capital')}</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={companyData.registeredCapital || ''}
                onChange={(e) =>
                  updateCompanyData({ registeredCapital: parseFloat(e.target.value) || undefined })
                }
                className="input flex-1"
                placeholder="0.00"
              />
              <select
                value={companyData.capitalCurrency || 'USD'}
                onChange={(e) => updateCompanyData({ capitalCurrency: e.target.value })}
                className="select w-24"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CNY">CNY</option>
                <option value="VND">VND</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="KRW">KRW</option>
                <option value="THB">THB</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">{t('registration.company.establishmentDate', 'Establishment Date')}</label>
            <input
              type="date"
              value={companyData.establishmentDate || ''}
              onChange={(e) => updateCompanyData({ establishmentDate: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">{t('registration.company.businessScope', 'Business Scope')}</label>
          <textarea
            rows={3}
            value={companyData.businessScope || ''}
            onChange={(e) => updateCompanyData({ businessScope: e.target.value })}
            className="textarea"
            placeholder={t('registration.company.businessScopePlaceholder', 'Describe your company\'s main business activities...')}
          />
        </div>
      </div>

      {/* Registered Address */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">{t('registration.address.registered', 'Registered Address')}</h3>
        <div>
          <label className="label">{t('registration.address.fullAddress', 'Full Address')}</label>
          <textarea
            rows={2}
            value={companyData.registeredAddress?.street || ''}
            onChange={(e) =>
              updateCompanyData({
                registeredAddress: { ...companyData.registeredAddress, street: e.target.value },
              })
            }
            className="textarea"
            placeholder={t('registration.address.fullAddressPlaceholder', 'Enter complete registered address including street, city, state/province, postal code, and country')}
          />
        </div>
      </div>

      {/* Business Address */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">{t('registration.address.business', 'Business Address')}</h3>
        <div>
          <label className="label">{t('registration.address.businessAddress', 'Actual Business Location')}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={companyData.businessAddress?.street || ''}
              onChange={(e) =>
                updateCompanyData({
                  businessAddress: { ...companyData.businessAddress, street: e.target.value },
                })
              }
              className="input flex-1"
              placeholder={t('registration.address.businessAddressPlaceholder', 'Enter business address or select on map')}
            />
            <button
              type="button"
              onClick={() => setShowBusinessAddressMap(true)}
              className="btn-secondary px-4"
            >
              <MapPinIcon className="h-5 w-5" />
            </button>
          </div>
          {companyData.businessAddress?.latitude && companyData.businessAddress?.longitude && (
            <p className="mt-2 text-xs text-gray-500">
              {t('registration.address.coordinates', 'Coordinates')}: {companyData.businessAddress.latitude.toFixed(6)}, {companyData.businessAddress.longitude.toFixed(6)}
            </p>
          )}
        </div>

        {showBusinessAddressMap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h4 className="text-lg font-medium">{t('registration.address.selectLocation', 'Select Business Location')}</h4>
                <button
                  type="button"
                  onClick={() => setShowBusinessAddressMap(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <MapPicker
                  value={
                    companyData.businessAddress?.latitude && companyData.businessAddress?.longitude
                      ? { lat: companyData.businessAddress.latitude, lng: companyData.businessAddress.longitude }
                      : undefined
                  }
                  onChange={(location) => {
                    if (location) {
                      handleBusinessAddressSelect(location as { lat: number; lng: number; address: string });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Business License Upload */}
      <div className="bg-gray-50 rounded-xl p-6">
        <FileUploader
          label={t('registration.documents.businessLicense', 'Business License Document')}
          accept=".pdf,.jpg,.jpeg,.png"
          fileCategory={FileCategory.BUSINESS_LICENSE}
          value={companyData.businessLicenseFileId}
          onChange={(fileId) =>
            updateCompanyData({ businessLicenseFileId: fileId as string | undefined })
          }
          helperText={t('registration.documents.businessLicenseHint', 'Upload your business license (PDF or image, max 10MB)')}
        />
      </div>
    </div>
  );
}
