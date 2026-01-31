import { useRegistrationStore } from '../../../store/registration.store';
import { BuildingOfficeIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function RoleSelectionStep() {
  const { companyData, updateCompanyData } = useRegistrationStore();

  const roles = [
    {
      id: 'supplier',
      name: 'Supplier',
      description: 'I supply products and equipment to buyers',
      icon: BuildingOfficeIcon,
      checked: companyData.isSupplier,
      onChange: (checked: boolean) => updateCompanyData({ isSupplier: checked }),
    },
    {
      id: 'buyer',
      name: 'Buyer',
      description: 'I purchase products and equipment from suppliers',
      icon: ShoppingCartIcon,
      checked: companyData.isBuyer,
      onChange: (checked: boolean) => updateCompanyData({ isBuyer: checked }),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Select Your Role</h2>
        <p className="mt-1 text-sm text-gray-500">
          Choose how your company will participate in the platform. You can select both roles.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {roles.map((role) => (
          <label
            key={role.id}
            className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
              role.checked
                ? 'border-blue-600 ring-2 ring-blue-600'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="checkbox"
              checked={role.checked}
              onChange={(e) => role.onChange(e.target.checked)}
              className="sr-only"
            />
            <div className="flex flex-1">
              <div className="flex flex-col">
                <div className="flex items-center space-x-3">
                  <role.icon
                    className={`h-6 w-6 ${role.checked ? 'text-blue-600' : 'text-gray-400'}`}
                  />
                  <span
                    className={`block text-sm font-medium ${
                      role.checked ? 'text-blue-900' : 'text-gray-900'
                    }`}
                  >
                    {role.name}
                  </span>
                </div>
                <span className="mt-2 text-sm text-gray-500">{role.description}</span>
              </div>
            </div>
            <div
              className={`absolute -inset-px rounded-lg border-2 pointer-events-none ${
                role.checked ? 'border-blue-600' : 'border-transparent'
              }`}
              aria-hidden="true"
            />
          </label>
        ))}
      </div>

      {!companyData.isSupplier && !companyData.isBuyer && (
        <p className="text-sm text-amber-600">Please select at least one role to continue.</p>
      )}
    </div>
  );
}
