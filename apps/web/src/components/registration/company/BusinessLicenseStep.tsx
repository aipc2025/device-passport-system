import { useState, useEffect } from 'react';
import { useRegistrationStore } from '../../../store/registration.store';
import { registrationApi } from '../../../services/api';
import FileUploader from '../common/FileUploader';
import { CompanyType, FileCategory } from '@device-passport/shared';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function BusinessLicenseStep() {
  const { companyData, updateCompanyData } = useRegistrationStore();
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Check code availability with debounce
  useEffect(() => {
    if (companyData.organizationCode.length !== 3) {
      setCodeStatus('idle');
      return;
    }

    const timeout = setTimeout(async () => {
      setCodeStatus('checking');
      try {
        const result = await registrationApi.checkCodeAvailability(companyData.organizationCode);
        setCodeStatus(result.available ? 'available' : 'taken');
      } catch {
        setCodeStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [companyData.organizationCode]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Business License Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Provide your company details and upload your business license.
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
              value={companyData.email}
              onChange={(e) => updateCompanyData({ email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Your Name *</label>
            <input
              type="text"
              required
              value={companyData.userName}
              onChange={(e) => updateCompanyData({ userName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password *</label>
            <input
              type="password"
              required
              minLength={8}
              value={companyData.password}
              onChange={(e) => updateCompanyData({ password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password *</label>
            <input
              type="password"
              required
              value={companyData.confirmPassword}
              onChange={(e) => updateCompanyData({ confirmPassword: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {companyData.password && companyData.confirmPassword &&
             companyData.password !== companyData.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
            )}
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="border-b pb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company Name *</label>
            <input
              type="text"
              required
              value={companyData.organizationName}
              onChange={(e) => updateCompanyData({ organizationName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Organization Code * (3 letters)
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                required
                maxLength={3}
                pattern="[A-Z]{3}"
                value={companyData.organizationCode}
                onChange={(e) =>
                  updateCompanyData({ organizationCode: e.target.value.toUpperCase() })
                }
                className={`block w-full rounded-md shadow-sm focus:ring-blue-500 sm:text-sm uppercase ${
                  codeStatus === 'taken'
                    ? 'border-red-300 focus:border-red-500'
                    : codeStatus === 'available'
                      ? 'border-green-300 focus:border-green-500'
                      : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="ABC"
              />
              {codeStatus === 'checking' && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              )}
              {codeStatus === 'available' && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
              )}
              {codeStatus === 'taken' && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {codeStatus === 'taken' && (
              <p className="mt-1 text-sm text-red-600">This code is already taken</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Used in device passport codes (e.g., DP-ABC-2025-...)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Company Type</label>
            <select
              value={companyData.companyType || ''}
              onChange={(e) =>
                updateCompanyData({ companyType: e.target.value as CompanyType || undefined })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select...</option>
              <option value={CompanyType.LLC}>LLC</option>
              <option value={CompanyType.CORPORATION}>Corporation</option>
              <option value={CompanyType.PARTNERSHIP}>Partnership</option>
              <option value={CompanyType.SOLE_PROPRIETORSHIP}>Sole Proprietorship</option>
              <option value={CompanyType.OTHER}>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Legal Representative</label>
            <input
              type="text"
              value={companyData.legalRepresentative || ''}
              onChange={(e) => updateCompanyData({ legalRepresentative: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Registered Capital</label>
            <div className="mt-1 flex">
              <input
                type="number"
                min="0"
                value={companyData.registeredCapital || ''}
                onChange={(e) =>
                  updateCompanyData({ registeredCapital: parseFloat(e.target.value) || undefined })
                }
                className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <select
                value={companyData.capitalCurrency || 'USD'}
                onChange={(e) => updateCompanyData({ capitalCurrency: e.target.value })}
                className="rounded-r-md border-l-0 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CNY">CNY</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Establishment Date</label>
            <input
              type="date"
              value={companyData.establishmentDate || ''}
              onChange={(e) => updateCompanyData({ establishmentDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Business Scope</label>
          <textarea
            rows={3}
            value={companyData.businessScope || ''}
            onChange={(e) => updateCompanyData({ businessScope: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Describe your company's main business activities..."
          />
        </div>
      </div>

      {/* Addresses */}
      <div className="border-b pb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Registered Address</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Street Address</label>
            <input
              type="text"
              value={companyData.registeredAddress?.street || ''}
              onChange={(e) =>
                updateCompanyData({
                  registeredAddress: { ...companyData.registeredAddress, street: e.target.value },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={companyData.registeredAddress?.city || ''}
              onChange={(e) =>
                updateCompanyData({
                  registeredAddress: { ...companyData.registeredAddress, city: e.target.value },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State/Province</label>
            <input
              type="text"
              value={companyData.registeredAddress?.state || ''}
              onChange={(e) =>
                updateCompanyData({
                  registeredAddress: { ...companyData.registeredAddress, state: e.target.value },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Postal Code</label>
            <input
              type="text"
              value={companyData.registeredAddress?.postalCode || ''}
              onChange={(e) =>
                updateCompanyData({
                  registeredAddress: { ...companyData.registeredAddress, postalCode: e.target.value },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              value={companyData.registeredAddress?.country || ''}
              onChange={(e) =>
                updateCompanyData({
                  registeredAddress: { ...companyData.registeredAddress, country: e.target.value },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Business License Upload */}
      <div>
        <FileUploader
          label="Business License Document"
          accept=".pdf,.jpg,.jpeg,.png"
          fileCategory={FileCategory.BUSINESS_LICENSE}
          value={companyData.businessLicenseFileId}
          onChange={(fileId) =>
            updateCompanyData({ businessLicenseFileId: fileId as string | undefined })
          }
          helperText="Upload your business license (PDF or image, max 10MB)"
        />
      </div>
    </div>
  );
}
