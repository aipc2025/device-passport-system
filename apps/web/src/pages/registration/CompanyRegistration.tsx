import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useRegistrationStore, CompanyStep } from '../../store/registration.store';
import { registrationApi } from '../../services/api';
import StepIndicator from '../../components/registration/StepIndicator';
import RoleSelectionStep from '../../components/registration/company/RoleSelectionStep';
import BusinessLicenseStep from '../../components/registration/company/BusinessLicenseStep';
import ContactsStep from '../../components/registration/company/ContactsStep';
import InvoiceInfoStep from '../../components/registration/company/InvoiceInfoStep';
import SupplierProductsStep from '../../components/registration/company/SupplierProductsStep';
import BuyerRequirementsStep from '../../components/registration/company/BuyerRequirementsStep';
import ReviewStep from '../../components/registration/company/ReviewStep';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const STEP_NAMES: Record<CompanyStep, string> = {
  'role-selection': 'Role',
  'business-license': 'Business',
  contacts: 'Contacts',
  'invoice-info': 'Invoice',
  'supplier-products': 'Products',
  'buyer-requirements': 'Buyer Info',
  review: 'Review',
};

export default function CompanyRegistration() {
  const navigate = useNavigate();
  const {
    companyData,
    companyStep,
    companySteps,
    nextCompanyStep,
    prevCompanyStep,
    setCompanyStep,
    isSubmitting,
    error,
    setSubmitting,
    setError,
    reset,
  } = useRegistrationStore();

  const currentStepIndex = companySteps.indexOf(companyStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === companySteps.length - 1;

  const validateCurrentStep = (): boolean => {
    switch (companyStep) {
      case 'role-selection':
        if (!companyData.isSupplier && !companyData.isBuyer) {
          setError('Please select at least one role');
          return false;
        }
        break;
      case 'business-license':
        if (!companyData.email || !companyData.password || !companyData.userName) {
          setError('Please fill in all required account fields');
          return false;
        }
        if (companyData.password !== companyData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (companyData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        if (!companyData.organizationName || !companyData.organizationCode) {
          setError('Please fill in company name and code');
          return false;
        }
        if (companyData.organizationCode.length !== 3) {
          setError('Organization code must be exactly 3 letters');
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextCompanyStep();
    }
  };

  const handlePrev = () => {
    setError(null);
    prevCompanyStep();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Prepare submission data
      const submitData = {
        email: companyData.email,
        password: companyData.password,
        userName: companyData.userName,
        organizationName: companyData.organizationName,
        organizationCode: companyData.organizationCode,
        isSupplier: companyData.isSupplier,
        isBuyer: companyData.isBuyer,
        registeredCapital: companyData.registeredCapital,
        capitalCurrency: companyData.capitalCurrency,
        companyType: companyData.companyType,
        establishmentDate: companyData.establishmentDate,
        legalRepresentative: companyData.legalRepresentative,
        businessScope: companyData.businessScope,
        registeredAddress: companyData.registeredAddress,
        businessAddress: companyData.businessAddress,
        businessLicenseFileId: companyData.businessLicenseFileId,
        contacts: companyData.contacts.map((c) => ({
          contactType: c.contactType,
          name: c.name,
          gender: c.gender,
          phone: c.phone,
          mobile: c.mobile,
          email: c.email,
          position: c.position,
          department: c.department,
          isPrimary: c.isPrimary,
        })),
        taxNumber: companyData.taxNumber,
        bankName: companyData.bankName,
        bankAccountNumber: companyData.bankAccountNumber,
        invoicePhone: companyData.invoicePhone,
        invoiceAddress: companyData.invoiceAddress,
        products: companyData.products.map((p) => ({
          name: p.name,
          model: p.model,
          brand: p.brand,
          hsCode: p.hsCode,
          description: p.description,
          costPrice: p.costPrice,
          sellingPrice: p.sellingPrice,
          priceCurrency: p.priceCurrency,
          packagingType: p.packagingType,
          length: p.length,
          width: p.width,
          height: p.height,
          netWeight: p.netWeight,
          grossWeight: p.grossWeight,
        })),
        buyerProductDescription: companyData.buyerProductDescription,
        purchaseFrequency: companyData.purchaseFrequency,
        purchaseVolume: companyData.purchaseVolume,
        preferredPaymentTerms: companyData.preferredPaymentTerms,
      };

      await registrationApi.registerCompany(submitData);

      // Reset form and navigate to success
      reset();
      navigate('/registration/success', { state: { type: 'company' } });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (companyStep) {
      case 'role-selection':
        return <RoleSelectionStep />;
      case 'business-license':
        return <BusinessLicenseStep />;
      case 'contacts':
        return <ContactsStep />;
      case 'invoice-info':
        return <InvoiceInfoStep />;
      case 'supplier-products':
        return <SupplierProductsStep />;
      case 'buyer-requirements':
        return <BuyerRequirementsStep />;
      case 'review':
        return <ReviewStep />;
      default:
        return null;
    }
  };

  const steps = companySteps.map((step) => ({
    id: step,
    name: STEP_NAMES[step],
  }));

  return (
    <>
      <Helmet>
        <title>Company Registration - Device Passport System</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Company Registration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Register your company as a Supplier, Buyer, or both
          </p>
        </div>

        <StepIndicator
          steps={steps}
          currentStepId={companyStep}
          onStepClick={(stepId) => {
            const stepIndex = companySteps.indexOf(stepId as CompanyStep);
            if (stepIndex < currentStepIndex) {
              setCompanyStep(stepId as CompanyStep);
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
    </>
  );
}
