import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegistrationStore, Gender } from '../../../store/registration.store';
import MapPicker from '../../common/MapPicker';
import { MapPinIcon } from '@heroicons/react/24/outline';

// Countries with ISO 3166-1 Alpha-2 codes for passport code generation
const COUNTRIES = [
  { code: 'CN', name: { en: 'China', zh: '中国' } },
  { code: 'US', name: { en: 'United States', zh: '美国' } },
  { code: 'DE', name: { en: 'Germany', zh: '德国' } },
  { code: 'JP', name: { en: 'Japan', zh: '日本' } },
  { code: 'KR', name: { en: 'South Korea', zh: '韩国' } },
  { code: 'TW', name: { en: 'Taiwan', zh: '中国台湾' } },
  { code: 'HK', name: { en: 'Hong Kong', zh: '中国香港' } },
  { code: 'SG', name: { en: 'Singapore', zh: '新加坡' } },
  { code: 'MY', name: { en: 'Malaysia', zh: '马来西亚' } },
  { code: 'TH', name: { en: 'Thailand', zh: '泰国' } },
  { code: 'VN', name: { en: 'Vietnam', zh: '越南' } },
  { code: 'IN', name: { en: 'India', zh: '印度' } },
  { code: 'GB', name: { en: 'United Kingdom', zh: '英国' } },
  { code: 'FR', name: { en: 'France', zh: '法国' } },
  { code: 'IT', name: { en: 'Italy', zh: '意大利' } },
  { code: 'CH', name: { en: 'Switzerland', zh: '瑞士' } },
  { code: 'AT', name: { en: 'Austria', zh: '奥地利' } },
  { code: 'SE', name: { en: 'Sweden', zh: '瑞典' } },
  { code: 'DK', name: { en: 'Denmark', zh: '丹麦' } },
  { code: 'NL', name: { en: 'Netherlands', zh: '荷兰' } },
  { code: 'BE', name: { en: 'Belgium', zh: '比利时' } },
  { code: 'AU', name: { en: 'Australia', zh: '澳大利亚' } },
  { code: 'CA', name: { en: 'Canada', zh: '加拿大' } },
  { code: 'BR', name: { en: 'Brazil', zh: '巴西' } },
  { code: 'MX', name: { en: 'Mexico', zh: '墨西哥' } },
  { code: 'RU', name: { en: 'Russia', zh: '俄罗斯' } },
  { code: 'SA', name: { en: 'Saudi Arabia', zh: '沙特阿拉伯' } },
  { code: 'AE', name: { en: 'United Arab Emirates', zh: '阿联酋' } },
  { code: 'ID', name: { en: 'Indonesia', zh: '印度尼西亚' } },
  { code: 'PH', name: { en: 'Philippines', zh: '菲律宾' } },
  { code: 'PL', name: { en: 'Poland', zh: '波兰' } },
  { code: 'TR', name: { en: 'Turkey', zh: '土耳其' } },
  { code: 'ZA', name: { en: 'South Africa', zh: '南非' } },
  { code: 'EG', name: { en: 'Egypt', zh: '埃及' } },
  { code: 'NG', name: { en: 'Nigeria', zh: '尼日利亚' } },
  { code: 'XX', name: { en: 'Other', zh: '其他' } },
];

export default function PersonalInfoStep() {
  const { t, i18n } = useTranslation();
  const { expertData, updateExpertData } = useRegistrationStore();
  const [showLocationMap, setShowLocationMap] = useState(false);
  const lang = i18n.language.startsWith('zh') ? 'zh' : 'en';

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    updateExpertData({
      currentLocation: location.address,
      locationLat: location.lat,
      locationLng: location.lng,
    });
    setShowLocationMap(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('expertPersonal.title', 'Personal Information')}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {t('expertPersonal.subtitle', 'Provide your personal and emergency contact information.')}
        </p>
      </div>

      {/* Account Information */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">
          {t('expertPersonal.accountInfo', 'Account Information')}
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="label">{t('expertPersonal.email', 'Email')} *</label>
            <input
              type="email"
              required
              value={expertData.email}
              onChange={(e) => updateExpertData({ email: e.target.value })}
              className="input"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="label">{t('expertPersonal.fullName', 'Full Name')} *</label>
            <input
              type="text"
              required
              value={expertData.personalName}
              onChange={(e) => updateExpertData({ personalName: e.target.value })}
              className="input"
              placeholder={t('expertPersonal.fullNamePlaceholder', 'Enter your full name')}
            />
          </div>

          <div>
            <label className="label">{t('expertPersonal.password', 'Password')} *</label>
            <input
              type="password"
              required
              minLength={8}
              value={expertData.password}
              onChange={(e) => updateExpertData({ password: e.target.value })}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="label">{t('expertPersonal.confirmPassword', 'Confirm Password')} *</label>
            <input
              type="password"
              required
              value={expertData.confirmPassword}
              onChange={(e) => updateExpertData({ confirmPassword: e.target.value })}
              className="input"
              placeholder="••••••••"
            />
            {expertData.password && expertData.confirmPassword &&
             expertData.password !== expertData.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {t('expertPersonal.passwordMismatch', 'Passwords do not match')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">
          {t('expertPersonal.personalDetails', 'Personal Details')}
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label">{t('expertPersonal.gender', 'Gender')}</label>
            <select
              value={expertData.gender || ''}
              onChange={(e) => updateExpertData({ gender: e.target.value as Gender || undefined })}
              className="select"
            >
              <option value="">{t('common.select', 'Select...')}</option>
              <option value={Gender.MALE}>{t('gender.male', 'Male')}</option>
              <option value={Gender.FEMALE}>{t('gender.female', 'Female')}</option>
              <option value={Gender.OTHER}>{t('gender.other', 'Other')}</option>
            </select>
          </div>

          <div>
            <label className="label">{t('expertPersonal.dateOfBirth', 'Date of Birth')} *</label>
            <input
              type="date"
              required
              value={expertData.dateOfBirth || ''}
              onChange={(e) => updateExpertData({ dateOfBirth: e.target.value })}
              className="input"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('expertPersonal.dobNote', 'Birth year/month will be encoded in your passport')}
            </p>
          </div>

          <div>
            <label className="label">{t('expertPersonal.phone', 'Phone Number')}</label>
            <input
              type="tel"
              value={expertData.phone || ''}
              onChange={(e) => updateExpertData({ phone: e.target.value })}
              className="input"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label className="label">{t('expertPersonal.nationality', 'Nationality')} *</label>
            <select
              required
              value={expertData.nationality || ''}
              onChange={(e) => updateExpertData({ nationality: e.target.value })}
              className="select"
            >
              <option value="">{t('common.select', 'Select...')}</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name[lang]} ({country.code})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {t('expertPersonal.nationalityNote', 'This will be used in your expert passport code')}
            </p>
          </div>

          <div>
            <label className="label">{t('expertPersonal.idNumber', 'ID Number')}</label>
            <input
              type="text"
              value={expertData.idNumber || ''}
              onChange={(e) => updateExpertData({ idNumber: e.target.value })}
              className="input"
              placeholder={t('expertPersonal.idNumberPlaceholder', 'National ID number')}
            />
          </div>

          <div>
            <label className="label">{t('expertPersonal.passportNumber', 'Passport Number')}</label>
            <input
              type="text"
              value={expertData.passportNumber || ''}
              onChange={(e) => updateExpertData({ passportNumber: e.target.value })}
              className="input"
              placeholder={t('expertPersonal.passportPlaceholder', 'e.g., AB1234567')}
            />
          </div>
        </div>

        <div>
          <label className="label">{t('expertPersonal.currentLocation', 'Current Location')}</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={expertData.currentLocation || ''}
              onChange={(e) => updateExpertData({ currentLocation: e.target.value })}
              className="input flex-1"
              placeholder={t('expertPersonal.locationPlaceholder', 'City, Country')}
            />
            <button
              type="button"
              onClick={() => setShowLocationMap(true)}
              className="btn-secondary px-4"
            >
              <MapPinIcon className="h-5 w-5" />
            </button>
          </div>
          {expertData.locationLat && expertData.locationLng && (
            <p className="mt-2 text-xs text-gray-500">
              {t('expertPersonal.coordinates', 'Coordinates')}: {expertData.locationLat.toFixed(6)}, {expertData.locationLng.toFixed(6)}
            </p>
          )}
        </div>

        {showLocationMap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h4 className="text-lg font-medium">
                  {t('expertPersonal.selectLocation', 'Select Your Location')}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowLocationMap(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <MapPicker
                  value={
                    expertData.locationLat && expertData.locationLng
                      ? { lat: expertData.locationLat, lng: expertData.locationLng }
                      : undefined
                  }
                  onChange={(location) => {
                    if (location) {
                      handleLocationSelect(location as { lat: number; lng: number; address: string });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contact */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-medium text-gray-900">
          {t('expertPersonal.emergencyContact', 'Emergency Contact')}
        </h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className="label">{t('expertPersonal.contactName', 'Contact Name')}</label>
            <input
              type="text"
              value={expertData.emergencyContactName || ''}
              onChange={(e) => updateExpertData({ emergencyContactName: e.target.value })}
              className="input"
              placeholder={t('expertPersonal.contactNamePlaceholder', 'Full name')}
            />
          </div>

          <div>
            <label className="label">{t('expertPersonal.contactPhone', 'Contact Phone')}</label>
            <input
              type="tel"
              value={expertData.emergencyContactPhone || ''}
              onChange={(e) => updateExpertData({ emergencyContactPhone: e.target.value })}
              className="input"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label className="label">{t('expertPersonal.relationship', 'Relationship')}</label>
            <input
              type="text"
              value={expertData.emergencyContactRelationship || ''}
              onChange={(e) => updateExpertData({ emergencyContactRelationship: e.target.value })}
              className="input"
              placeholder={t('expertPersonal.relationshipPlaceholder', 'e.g., Spouse, Parent')}
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4">
        <h4 className="text-sm font-medium text-blue-900">
          {t('expertPersonal.privacyNote', 'Privacy Note')}
        </h4>
        <p className="mt-1 text-sm text-blue-700">
          {t('expertPersonal.privacyText', 'Your personal information is securely stored and only shared with clients when you accept a service assignment. Emergency contact details are kept strictly confidential.')}
        </p>
      </div>
    </div>
  );
}
