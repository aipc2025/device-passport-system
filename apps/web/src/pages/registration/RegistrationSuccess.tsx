import { useLocation, Link } from 'react-router-dom';
import { CheckCircleIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function RegistrationSuccess() {
  const location = useLocation();
  const registrationType = location.state?.type || 'company';

  const isCompany = registrationType === 'company';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            Registration Submitted!
          </h1>

          <p className="mt-3 text-gray-600">
            Thank you for registering as {isCompany ? 'a company' : 'an individual expert'}.
            Your application has been submitted for review.
          </p>

          <div className="mt-8 space-y-4">
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-blue-900">Check Your Email</p>
                <p className="mt-1 text-sm text-blue-700">
                  We've sent a confirmation email with your registration details.
                </p>
              </div>
            </div>

            <div className="flex items-start p-4 bg-amber-50 rounded-lg">
              <ClockIcon className="h-6 w-6 text-amber-600 flex-shrink-0" />
              <div className="ml-3 text-left">
                <p className="text-sm font-medium text-amber-900">Approval Pending</p>
                <p className="mt-1 text-sm text-amber-700">
                  Our team will review your application. This usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link
              to="/login"
              className="block w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Sign In to Your Account
            </Link>
            <Link
              to="/"
              className="block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Return to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-gray-500">
              While your application is pending, you can log in with limited access.
              Full features will be available once your account is approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
