import { useNavigate, Link } from 'react-router-dom';
import { useRegistrationStore } from '../../store/registration.store';
import { RegistrationType } from '@device-passport/shared';
import {
  BuildingOfficeIcon,
  UserCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function RegistrationTypeSelection() {
  const navigate = useNavigate();
  const { setRegistrationType, reset } = useRegistrationStore();

  const handleSelectType = (type: RegistrationType) => {
    reset();
    setRegistrationType(type);
    navigate(type === RegistrationType.COMPANY ? '/register/company' : '/register/expert');
  };

  const registrationTypes = [
    {
      type: RegistrationType.COMPANY,
      title: 'Company Registration',
      description:
        'Register your company as a Supplier, Buyer, or both. Create a digital passport system for your equipment.',
      icon: BuildingOfficeIcon,
      features: [
        'Register as Supplier and/or Buyer',
        'Manage company contacts',
        'Add product catalog (for suppliers)',
        'Track equipment lifecycle',
      ],
      color: 'blue',
    },
    {
      type: RegistrationType.INDIVIDUAL_EXPERT,
      title: 'Individual Expert',
      description:
        'Register as a technical or business expert to provide professional services.',
      icon: UserCircleIcon,
      features: [
        'Technical or Business expertise',
        'Receive service assignments',
        'Build professional profile',
        'Manage certifications',
      ],
      color: 'green',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="mt-3 text-lg text-gray-600">
            Choose how you want to join the Device Passport System
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {registrationTypes.map((regType) => (
            <button
              key={regType.type}
              onClick={() => handleSelectType(regType.type)}
              className="relative bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 text-left hover:border-blue-500 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center ${
                    regType.color === 'blue' ? 'bg-blue-100' : 'bg-green-100'
                  }`}
                >
                  <regType.icon
                    className={`h-6 w-6 ${
                      regType.color === 'blue' ? 'text-blue-600' : 'text-green-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{regType.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{regType.description}</p>
                </div>
              </div>

              <ul className="mt-6 space-y-2">
                {regType.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <svg
                      className={`h-4 w-4 mr-2 ${
                        regType.color === 'blue' ? 'text-blue-500' : 'text-green-500'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center text-sm font-medium text-blue-600">
                Get Started
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
