import { useNavigate } from 'react-router-dom';
import { useRegistrationStore, ExpertStep } from '../../store/registration.store';
import { registrationApi } from '../../services/api';
import StepIndicator from '../../components/registration/StepIndicator';
import ExpertTypeStep from '../../components/registration/expert/ExpertTypeStep';
import IndustrySkillStep from '../../components/registration/expert/IndustrySkillStep';
import PersonalInfoStep from '../../components/registration/expert/PersonalInfoStep';
import ProfessionalInfoStep from '../../components/registration/expert/ProfessionalInfoStep';
import DocumentsStep from '../../components/registration/expert/DocumentsStep';
import ExpertReviewStep from '../../components/registration/expert/ExpertReviewStep';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const STEP_NAMES: Record<ExpertStep, string> = {
  'expert-type': 'Type',
  'industry-skill': 'Industry',
  'personal-info': 'Personal',
  'professional-info': 'Professional',
  documents: 'Documents',
  review: 'Review',
};

export default function ExpertRegistration() {
  const navigate = useNavigate();
  const {
    expertData,
    expertStep,
    expertSteps,
    nextExpertStep,
    prevExpertStep,
    setExpertStep,
    isSubmitting,
    error,
    setSubmitting,
    setError,
    reset,
  } = useRegistrationStore();

  const currentStepIndex = expertSteps.indexOf(expertStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === expertSteps.length - 1;

  const validateCurrentStep = (): boolean => {
    switch (expertStep) {
      case 'expert-type':
        if (!expertData.expertTypes?.length) {
          setError('Please select at least one expert type');
          return false;
        }
        break;
      case 'industry-skill':
        if (!expertData.industries?.length) {
          setError('Please select at least one industry');
          return false;
        }
        if (!expertData.skills?.length) {
          setError('Please select at least one skill');
          return false;
        }
        break;
      case 'personal-info':
        if (!expertData.email || !expertData.password || !expertData.personalName) {
          setError('Please fill in all required fields');
          return false;
        }
        if (expertData.password !== expertData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (expertData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        if (!expertData.nationality) {
          setError('Please select your nationality');
          return false;
        }
        if (!expertData.dateOfBirth) {
          setError('Please enter your date of birth');
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextExpertStep();
    }
  };

  const handlePrev = () => {
    setError(null);
    prevExpertStep();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const submitData = {
        email: expertData.email,
        password: expertData.password,
        expertTypes: expertData.expertTypes,
        industries: expertData.industries,
        skills: expertData.skills,
        personalName: expertData.personalName,
        nationality: expertData.nationality,
        idNumber: expertData.idNumber,
        phone: expertData.phone,
        dateOfBirth: expertData.dateOfBirth,
        emergencyContactName: expertData.emergencyContactName,
        emergencyContactPhone: expertData.emergencyContactPhone,
        emergencyContactRelationship: expertData.emergencyContactRelationship,
        professionalField: expertData.professionalField,
        servicesOffered: expertData.servicesOffered,
        yearsOfExperience: expertData.yearsOfExperience,
        certifications: expertData.certifications,
        workHistory: expertData.workHistory,
        currentLocation: expertData.currentLocation,
        locationLat: expertData.locationLat,
        locationLng: expertData.locationLng,
        resumeFileId: expertData.resumeFileId,
        certificateFileIds: expertData.certificateFileIds?.length ? expertData.certificateFileIds : undefined,
        idDocumentFileId: expertData.idDocumentFileId,
        photoFileId: expertData.photoFileId,
        isProfilePublic: expertData.isProfilePublic,
        bio: expertData.bio,
      };

      await registrationApi.registerExpert(submitData);

      reset();
      navigate('/registration/success', { state: { type: 'expert' } });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string | string[]; error?: string } } };
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response?.data) {
        const { message, error: errorType } = error.response.data;
        if (Array.isArray(message)) {
          // Validation errors come as array
          errorMessage = message.join('\n');
        } else if (message) {
          errorMessage = message;
        } else if (errorType) {
          errorMessage = errorType;
        }
      }

      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (expertStep) {
      case 'expert-type':
        return <ExpertTypeStep />;
      case 'industry-skill':
        return <IndustrySkillStep />;
      case 'personal-info':
        return <PersonalInfoStep />;
      case 'professional-info':
        return <ProfessionalInfoStep />;
      case 'documents':
        return <DocumentsStep />;
      case 'review':
        return <ExpertReviewStep />;
      default:
        return null;
    }
  };

  const steps = expertSteps.map((step) => ({
    id: step,
    name: STEP_NAMES[step],
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Expert Registration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Register as a Technical or Business Expert
          </p>
        </div>

        <StepIndicator
          steps={steps}
          currentStepId={expertStep}
          onStepClick={(stepId) => {
            const stepIndex = expertSteps.indexOf(stepId as ExpertStep);
            if (stepIndex < currentStepIndex) {
              setExpertStep(stepId as ExpertStep);
            }
          }}
        />

        <div className="bg-white shadow-sm rounded-lg p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {renderStep()}

          <div className="mt-8 flex justify-between pt-6 border-t">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirstStep}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isFirstStep
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </button>

            {isLastStep ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Next
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              reset();
              navigate('/register');
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel and go back
          </button>
        </div>
      </div>
    </div>
  );
}
