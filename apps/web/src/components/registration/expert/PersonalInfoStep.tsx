import { useRegistrationStore } from '../../../store/registration.store';

export default function PersonalInfoStep() {
  const { expertData, updateExpertData } = useRegistrationStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Provide your personal and emergency contact information.
        </p>
      </div>

      {/* Account Information */}
      <div className="border-b pb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              required
              value={expertData.email}
              onChange={(e) => updateExpertData({ email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name *</label>
            <input
              type="text"
              required
              value={expertData.personalName}
              onChange={(e) => updateExpertData({ personalName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password *</label>
            <input
              type="password"
              required
              minLength={8}
              value={expertData.password}
              onChange={(e) => updateExpertData({ password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
            <input
              type="password"
              required
              value={expertData.confirmPassword}
              onChange={(e) => updateExpertData({ confirmPassword: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {expertData.password && expertData.confirmPassword &&
             expertData.password !== expertData.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <div className="border-b pb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Personal Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Number</label>
            <input
              type="text"
              value={expertData.idNumber || ''}
              onChange={(e) => updateExpertData({ idNumber: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="National ID or Passport number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={expertData.phone || ''}
              onChange={(e) => updateExpertData({ phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              value={expertData.dateOfBirth || ''}
              onChange={(e) => updateExpertData({ dateOfBirth: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Current Location</label>
            <input
              type="text"
              value={expertData.currentLocation || ''}
              onChange={(e) => updateExpertData({ currentLocation: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="City, Country"
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Name</label>
            <input
              type="text"
              value={expertData.emergencyContactName || ''}
              onChange={(e) => updateExpertData({ emergencyContactName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
            <input
              type="tel"
              value={expertData.emergencyContactPhone || ''}
              onChange={(e) => updateExpertData({ emergencyContactPhone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Relationship</label>
            <input
              type="text"
              value={expertData.emergencyContactRelationship || ''}
              onChange={(e) => updateExpertData({ emergencyContactRelationship: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., Spouse, Parent"
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900">Privacy Note</h4>
        <p className="mt-1 text-sm text-blue-700">
          Your personal information is securely stored and only shared with clients when you
          accept a service assignment. Emergency contact details are kept strictly confidential.
        </p>
      </div>
    </div>
  );
}
