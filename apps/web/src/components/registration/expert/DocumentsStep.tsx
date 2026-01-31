import { useRegistrationStore } from '../../../store/registration.store';
import FileUploader from '../common/FileUploader';
import { FileCategory } from '@device-passport/shared';

export default function DocumentsStep() {
  const { expertData, updateExpertData } = useRegistrationStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Documents</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload your resume and any relevant certificates to strengthen your profile.
        </p>
      </div>

      <div className="space-y-6">
        <FileUploader
          label="Resume / CV"
          accept=".pdf,.doc,.docx"
          fileCategory={FileCategory.RESUME}
          value={expertData.resumeFileId}
          onChange={(fileId) => updateExpertData({ resumeFileId: fileId as string | undefined })}
          helperText="Upload your resume in PDF or Word format (max 10MB)"
        />

        <FileUploader
          label="Certificates & Credentials"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          maxFiles={5}
          fileCategory={FileCategory.CERTIFICATE}
          value={expertData.certificateFileIds}
          onChange={(fileIds) =>
            updateExpertData({ certificateFileIds: fileIds as string[] | undefined })
          }
          helperText="Upload certificates, licenses, or credential documents (up to 5 files)"
        />
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900">Document Tips</h4>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>Ensure your resume is up-to-date with recent experience</li>
          <li>Include certificates for specific equipment brands or technologies</li>
          <li>Professional licenses and safety certifications are highly valued</li>
          <li>Documents will be verified during the approval process</li>
        </ul>
      </div>
    </div>
  );
}
