import { useTranslation } from 'react-i18next';
import { useRegistrationStore, WorkHistoryEntry } from '../../../store/registration.store';
import {
  UserIcon,
  WrenchScrewdriverIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { ExpertType, Gender } from '@device-passport/shared';

export default function ExpertReviewStep() {
  const { t } = useTranslation();
  const { expertData } = useRegistrationStore();

  const Section = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }) => (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-100">
        <Icon className="h-5 w-5 text-primary-600" />
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="py-1.5">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900 break-words">{value || '-'}</dd>
    </div>
  );

  const LongTextField = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="py-1.5">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 break-words whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
        {value || '-'}
      </dd>
    </div>
  );

  const getGenderLabel = (gender?: Gender) => {
    switch (gender) {
      case Gender.MALE:
        return t('gender.male', 'Male');
      case Gender.FEMALE:
        return t('gender.female', 'Female');
      case Gender.OTHER:
        return t('gender.other', 'Other');
      default:
        return '-';
    }
  };

  const formatDateRange = (work: WorkHistoryEntry) => {
    const start = new Date(work.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    if (work.isCurrent) {
      return `${start} - ${t('professional.present', 'Present')}`;
    }
    if (work.endDate) {
      const end = new Date(work.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      return `${start} - ${end}`;
    }
    return start;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('expertReview.title', 'Review Your Registration')}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {t('expertReview.subtitle', 'Please review your information before submitting. You can go back to make changes.')}
        </p>
      </div>

      {/* Expert Type Badges */}
      <div className="flex flex-wrap gap-3">
        {expertData.expertTypes?.includes(ExpertType.TECHNICAL) && (
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
            {t('expertType.technical.name', 'Technical Expert')}
          </div>
        )}
        {expertData.expertTypes?.includes(ExpertType.BUSINESS) && (
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            <BriefcaseIcon className="h-4 w-4 mr-2" />
            {t('expertType.business.name', 'Business Expert')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Account Info */}
        <Section title={t('expertReview.accountInfo', 'Account Information')} icon={UserIcon}>
          <dl className="grid grid-cols-2 gap-x-4">
            <Field label={t('expertReview.email', 'Email')} value={expertData.email} />
            <Field label={t('expertReview.fullName', 'Full Name')} value={expertData.personalName} />
          </dl>
        </Section>

        {/* Personal Details */}
        <Section title={t('expertReview.personalDetails', 'Personal Details')} icon={IdentificationIcon}>
          <dl className="grid grid-cols-2 gap-x-4">
            <Field label={t('expertReview.gender', 'Gender')} value={getGenderLabel(expertData.gender)} />
            <Field label={t('expertReview.dateOfBirth', 'Date of Birth')} value={expertData.dateOfBirth} />
            <Field label={t('expertReview.nationality', 'Nationality')} value={expertData.nationality} />
            <Field label={t('expertReview.phone', 'Phone')} value={expertData.phone} />
            <Field label={t('expertReview.idNumber', 'ID Number')} value={expertData.idNumber} />
            <Field label={t('expertReview.passport', 'Passport')} value={expertData.passportNumber} />
          </dl>
        </Section>

        {/* Location */}
        <Section title={t('expertReview.location', 'Location')} icon={MapPinIcon}>
          <dl>
            <Field label={t('expertReview.currentLocation', 'Current Location')} value={expertData.currentLocation} />
            {expertData.locationLat && expertData.locationLng && (
              <Field
                label={t('expertReview.coordinates', 'Coordinates')}
                value={`${expertData.locationLat.toFixed(6)}, ${expertData.locationLng.toFixed(6)}`}
              />
            )}
          </dl>
        </Section>

        {/* Emergency Contact */}
        <Section title={t('expertReview.emergencyContact', 'Emergency Contact')} icon={PhoneIcon}>
          <dl className="grid grid-cols-2 gap-x-4">
            <Field label={t('expertReview.contactName', 'Contact Name')} value={expertData.emergencyContactName} />
            <Field label={t('expertReview.contactPhone', 'Phone')} value={expertData.emergencyContactPhone} />
            <Field label={t('expertReview.relationship', 'Relationship')} value={expertData.emergencyContactRelationship} />
          </dl>
        </Section>

        {/* Professional Info */}
        <Section title={t('expertReview.professionalInfo', 'Professional Information')} icon={AcademicCapIcon}>
          <dl>
            <Field label={t('expertReview.field', 'Professional Field')} value={expertData.professionalField} />
            <Field
              label={t('expertReview.experience', 'Years of Experience')}
              value={expertData.yearsOfExperience?.toString()}
            />
          </dl>
          {expertData.servicesOffered && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <LongTextField
                label={t('expertReview.services', 'Services Offered')}
                value={expertData.servicesOffered}
              />
            </div>
          )}
        </Section>

        {/* Work History */}
        <Section title={t('expertReview.workHistory', 'Work History')} icon={BriefcaseIcon}>
          {expertData.workHistory?.length > 0 ? (
            <ul className="space-y-3">
              {expertData.workHistory.map((work, index) => (
                <li key={index} className="text-sm bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900">{work.position}</div>
                  <div className="text-gray-600">{work.companyName}</div>
                  <div className="text-xs text-gray-500 mt-1">{formatDateRange(work)}</div>
                  {work.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{work.description}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">
              {t('expertReview.noWorkHistory', 'No work history added')}
            </p>
          )}
        </Section>

        {/* Certifications */}
        <Section title={t('expertReview.certifications', 'Certifications')} icon={DocumentTextIcon}>
          {expertData.certifications && expertData.certifications.length > 0 ? (
            <ul className="space-y-1.5">
              {expertData.certifications.map((cert, index) => (
                <li key={index} className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                  {cert}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">
              {t('expertReview.noCertifications', 'No certifications listed')}
            </p>
          )}
        </Section>

        {/* Documents */}
        <Section title={t('expertReview.documents', 'Uploaded Documents')} icon={DocumentTextIcon}>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-gray-600">{t('expertReview.photo', 'Profile Photo')}</span>
              <span className={expertData.photoFileId ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {expertData.photoFileId ? t('expertReview.uploaded', 'Uploaded') : t('expertReview.notUploaded', 'Not uploaded')}
              </span>
            </li>
            <li className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-gray-600">{t('expertReview.idDocument', 'ID/Passport')}</span>
              <span className={expertData.idDocumentFileId ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {expertData.idDocumentFileId ? t('expertReview.uploaded', 'Uploaded') : t('expertReview.notUploaded', 'Not uploaded')}
              </span>
            </li>
            <li className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-gray-600">{t('expertReview.resume', 'Resume')}</span>
              <span className={expertData.resumeFileId ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {expertData.resumeFileId ? t('expertReview.uploaded', 'Uploaded') : t('expertReview.notUploaded', 'Not uploaded')}
              </span>
            </li>
            <li className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-gray-600">{t('expertReview.certificates', 'Certificates')}</span>
              <span className={expertData.certificateFileIds?.length ? 'text-green-600 font-medium' : 'text-gray-400'}>
                {expertData.certificateFileIds?.length || 0} {t('expertReview.files', 'file(s)')}
              </span>
            </li>
          </ul>
        </Section>
      </div>

      <div className="bg-amber-50 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-amber-900">
          {t('expertReview.nextSteps', 'What happens next?')}
        </h4>
        <ul className="mt-3 text-sm text-amber-700 list-disc list-inside space-y-1.5">
          <li>{t('expertReview.step1', 'Your registration will be submitted for review')}</li>
          <li>{t('expertReview.step2', 'Our team will verify your credentials and documents')}</li>
          <li>{t('expertReview.step3', "You'll receive an email once your account is approved")}</li>
          <li>{t('expertReview.step4', "After approval, you'll receive your Personal Digital Passport and can start receiving service assignments")}</li>
        </ul>
      </div>
    </div>
  );
}
