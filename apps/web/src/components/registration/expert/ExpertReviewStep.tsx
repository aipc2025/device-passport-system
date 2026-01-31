import { useRegistrationStore } from '../../../store/registration.store';
import {
  UserIcon,
  WrenchScrewdriverIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { ExpertType } from '@device-passport/shared';

export default function ExpertReviewStep() {
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
    <div className="border rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Icon className="h-5 w-5 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="py-1">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value || '-'}</dd>
    </div>
  );

  const ExpertTypeIcon =
    expertData.expertType === ExpertType.TECHNICAL
      ? WrenchScrewdriverIcon
      : BriefcaseIcon;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Review Your Registration</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please review your information before submitting. You can go back to make changes.
        </p>
      </div>

      {/* Expert Type Badge */}
      <div className="flex items-center space-x-2">
        <div
          className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
            expertData.expertType === ExpertType.TECHNICAL
              ? 'bg-green-100 text-green-800'
              : 'bg-purple-100 text-purple-800'
          }`}
        >
          <ExpertTypeIcon className="h-4 w-4 mr-1" />
          {expertData.expertType === ExpertType.TECHNICAL
            ? 'Technical Expert'
            : 'Business Expert'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Account Info */}
        <Section title="Account Information" icon={UserIcon}>
          <dl className="grid grid-cols-2 gap-x-4">
            <Field label="Email" value={expertData.email} />
            <Field label="Full Name" value={expertData.personalName} />
            <Field label="Phone" value={expertData.phone} />
            <Field label="Date of Birth" value={expertData.dateOfBirth} />
            <Field label="ID Number" value={expertData.idNumber} />
            <Field label="Location" value={expertData.currentLocation} />
          </dl>
        </Section>

        {/* Emergency Contact */}
        <Section title="Emergency Contact" icon={PhoneIcon}>
          <dl className="grid grid-cols-2 gap-x-4">
            <Field label="Contact Name" value={expertData.emergencyContactName} />
            <Field label="Phone" value={expertData.emergencyContactPhone} />
            <Field label="Relationship" value={expertData.emergencyContactRelationship} />
          </dl>
        </Section>

        {/* Professional Info */}
        <Section title="Professional Information" icon={AcademicCapIcon}>
          <dl>
            <Field label="Professional Field" value={expertData.professionalField} />
            <Field
              label="Years of Experience"
              value={expertData.yearsOfExperience?.toString()}
            />
          </dl>
          {expertData.servicesOffered && (
            <div className="mt-2">
              <dt className="text-xs text-gray-500">Services Offered</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {expertData.servicesOffered}
              </dd>
            </div>
          )}
        </Section>

        {/* Certifications */}
        <Section title="Certifications" icon={DocumentTextIcon}>
          {expertData.certifications && expertData.certifications.length > 0 ? (
            <ul className="space-y-1">
              {expertData.certifications.map((cert, index) => (
                <li key={index} className="text-sm text-gray-900">
                  {cert}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No certifications listed</p>
          )}
        </Section>

        {/* Documents */}
        <Section title="Uploaded Documents" icon={DocumentTextIcon}>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center">
              <span className="text-gray-500 mr-2">Resume:</span>
              <span className={expertData.resumeFileId ? 'text-green-600' : 'text-gray-400'}>
                {expertData.resumeFileId ? 'Uploaded' : 'Not uploaded'}
              </span>
            </li>
            <li className="flex items-center">
              <span className="text-gray-500 mr-2">Certificates:</span>
              <span
                className={
                  expertData.certificateFileIds?.length ? 'text-green-600' : 'text-gray-400'
                }
              >
                {expertData.certificateFileIds?.length || 0} file(s)
              </span>
            </li>
          </ul>
        </Section>
      </div>

      <div className="bg-amber-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-amber-900">What happens next?</h4>
        <ul className="mt-2 text-sm text-amber-700 list-disc list-inside space-y-1">
          <li>Your registration will be submitted for review</li>
          <li>Our team will verify your credentials and documents</li>
          <li>You'll receive an email once your account is approved</li>
          <li>After approval, you'll be able to receive service assignments</li>
        </ul>
      </div>
    </div>
  );
}
