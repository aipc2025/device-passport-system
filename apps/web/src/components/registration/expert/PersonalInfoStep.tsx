import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegistrationStore, Gender } from '../../../store/registration.store';
import MapPicker from '../../common/MapPicker';
import { MapPinIcon } from '@heroicons/react/24/outline';

// Common nationalities list
const NATIONALITIES = [
  'Chinese', 'American', 'German', 'Japanese', 'Korean', 'British', 'French',
  'Italian', 'Canadian', 'Australian', 'Indian', 'Brazilian', 'Russian',
  'Spanish', 'Dutch', 'Swiss', 'Swedish', 'Norwegian', 'Danish', 'Finnish',
  'Austrian', 'Belgian', 'Polish', 'Turkish', 'Mexican', 'Argentine',
  'Chilean', 'Colombian', 'Indonesian', 'Malaysian', 'Singaporean',
  'Thai', 'Vietnamese', 'Filipino', 'Egyptian', 'South African', 'Nigerian',
  'Other',
];

export default function PersonalInfoStep() {
  const { t } = useTranslation();
  const { expertData, updateExpertData } = useRegistrationStore();
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [customNationality, setCustomNationality] = useState('');

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    updateExpertData({
      currentLocation: location.address,
      locationLat: location.lat,
      locationLng: location.lng,
    });
    setShowLocationMap(false);
  };

  const handleNationalityChange = (value: string) => {
    if (value === 'Other') {
      updateExpertData({ nationality: customNationality || 'Other' });
    } else {
      updateExpertData({ nationality: value });
      setCustomNationality('');
    }
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
            <label className="label">{t('expertPersonal.dateOfBirth', 'Date of Birth')}</label>
            <input
              type="date"
              value={expertData.dateOfBirth || ''}
              onChange={(e) => updateExpertData({ dateOfBirth: e.target.value })}
              className="input"
            />
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
            <label className="label">{t('expertPersonal.nationality', 'Nationality')}</label>
            <select
              value={NATIONALITIES.includes(expertData.nationality || '') ? expertData.nationality : (expertData.nationality ? 'Other' : '')}
              onChange={(e) => handleNationalityChange(e.target.value)}
              className="select"
            >
              <option value="">{t('common.select', 'Select...')}</option>
              {NATIONALITIES.map((nat) => (
                <option key={nat} value={nat}>{nat}</option>
              ))}
            </select>
            {(!NATIONALITIES.includes(expertData.nationality || '') && expertData.nationality) ||
             (NATIONALITIES.includes(expertData.nationality || '') && expertData.nationality === 'Other') ? (
              <input
                type="text"
                value={expertData.nationality === 'Other' ? customNationality : (expertData.nationality || '')}
                onChange={(e) => {
                  setCustomNationality(e.target.value);
                  updateExpertData({ nationality: e.target.value });
                }}
                className="input mt-2"
                placeholder={t('expertPersonal.enterNationality', 'Enter nationality')}
              />
            ) : null}
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
