import { useTranslation } from 'react-i18next';
import { useRegistrationStore } from '../../../store/registration.store';
import FileUploader from '../common/FileUploader';
import { FileCategory } from '@device-passport/shared';

export default function DocumentsStep() {
  const { t } = useTranslation();
  const { expertData, updateExpertData } = useRegistrationStore();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {t('documents.title', 'Documents')}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {t('documents.subtitle', 'Upload your documents to complete your profile. These help verify your identity and qualifications.')}
        </p>
      </div>

      {/* Identity Documents */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-5">
        <h3 className="text-base font-medium text-gray-900">
          {t('documents.identityDocs', 'Identity Documents')}
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FileUploader
            label={t('documents.photo', 'Profile Photo')}
            accept=".jpg,.jpeg,.png"
            fileCategory={FileCategory.OTHER}
            value={expertData.photoFileId}
            onChange={(fileId) => updateExpertData({ photoFileId: fileId as string | undefined })}
            helperText={t('documents.photoHint', 'A clear photo of yourself (JPEG or PNG, max 5MB)')}
          />

          <FileUploader
            label={t('documents.idDocument', 'ID / Passport Document')}
            accept=".pdf,.jpg,.jpeg,.png"
            fileCategory={FileCategory.OTHER}
            value={expertData.idDocumentFileId}
            onChange={(fileId) => updateExpertData({ idDocumentFileId: fileId as string | undefined })}
            helperText={t('documents.idDocumentHint', 'A scan or photo of your ID card or passport (PDF or image, max 10MB)')}
          />
        </div>

        <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700">
          {t('documents.idNote', 'Your ID document will be used for verification purposes only and stored securely.')}
        </div>
      </div>

      {/* Professional Documents */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-5">
        <h3 className="text-base font-medium text-gray-900">
          {t('documents.professionalDocs', 'Professional Documents')}
        </h3>

        <FileUploader
          label={t('documents.resume', 'Resume / CV')}
          accept=".pdf,.doc,.docx"
          fileCategory={FileCategory.RESUME}
          value={expertData.resumeFileId}
          onChange={(fileId) => updateExpertData({ resumeFileId: fileId as string | undefined })}
          helperText={t('documents.resumeHint', 'Upload your resume in PDF or Word format (max 10MB)')}
        />

        <FileUploader
          label={t('documents.certificates', 'Certificates & Credentials')}
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          maxFiles={5}
          fileCategory={FileCategory.CERTIFICATE}
          value={expertData.certificateFileIds}
          onChange={(fileIds) =>
            updateExpertData({ certificateFileIds: fileIds as string[] | undefined })
          }
          helperText={t('documents.certificatesHint', 'Upload certificates, licenses, or credential documents (up to 5 files)')}
        />
      </div>

      <div className="bg-blue-50 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-blue-900">
          {t('documents.tipsTitle', 'Document Tips')}
        </h4>
        <ul className="mt-3 text-sm text-blue-700 list-disc list-inside space-y-1.5">
          <li>{t('documents.tip1', 'Ensure your resume is up-to-date with recent experience')}</li>
          <li>{t('documents.tip2', 'Include certificates for specific equipment brands or technologies')}</li>
          <li>{t('documents.tip3', 'Professional licenses and safety certifications are highly valued')}</li>
          <li>{t('documents.tip4', 'Documents will be verified during the approval process')}</li>
          <li>{t('documents.tip5', 'Use clear, high-quality scans or photos for ID documents')}</li>
        </ul>
      </div>

      <div className="bg-gray-100 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-900">
          {t('documents.passportInfo', 'Personal Digital Passport')}
        </h4>
        <p className="mt-2 text-sm text-gray-600">
          {t('documents.passportInfoText', 'Upon approval, you will receive a unique Personal Digital Passport code in the format:')}
        </p>
        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 font-mono text-sm text-center">
          <span className="text-gray-500">EP-</span>
          <span className="text-primary-600">[Type]</span>
          <span className="text-gray-500">-</span>
          <span className="text-primary-600">[Year]</span>
          <span className="text-gray-500">-</span>
          <span className="text-primary-600">[Sequence]</span>
          <span className="text-gray-500">-</span>
          <span className="text-primary-600">[Checksum]</span>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {t('documents.passportExample', 'Example: EP-TECH-2025-000042-B3 (Technical Expert)')}
        </p>
      </div>
    </div>
  );
}
