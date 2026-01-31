import { useRegistrationStore } from '../../../store/registration.store';
import { PurchaseFrequency } from '@device-passport/shared';

export default function BuyerRequirementsStep() {
  const { companyData, updateCompanyData } = useRegistrationStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Buyer Requirements</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tell us about your purchasing needs so we can match you with suitable suppliers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product/Equipment Needs
          </label>
          <textarea
            rows={4}
            value={companyData.buyerProductDescription || ''}
            onChange={(e) => updateCompanyData({ buyerProductDescription: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Describe the types of products or equipment you're looking to purchase..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Include product categories, specifications, or specific requirements
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Frequency</label>
            <select
              value={companyData.purchaseFrequency || ''}
              onChange={(e) =>
                updateCompanyData({
                  purchaseFrequency: e.target.value as PurchaseFrequency || undefined,
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select...</option>
              <option value={PurchaseFrequency.ONE_TIME}>One-time purchase</option>
              <option value={PurchaseFrequency.MONTHLY}>Monthly</option>
              <option value={PurchaseFrequency.QUARTERLY}>Quarterly</option>
              <option value={PurchaseFrequency.YEARLY}>Yearly</option>
              <option value={PurchaseFrequency.AS_NEEDED}>As needed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estimated Purchase Volume
            </label>
            <input
              type="text"
              value={companyData.purchaseVolume || ''}
              onChange={(e) => updateCompanyData({ purchaseVolume: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g., $10,000 - $50,000 per order"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Payment Terms</label>
          <textarea
            rows={2}
            value={companyData.preferredPaymentTerms || ''}
            onChange={(e) => updateCompanyData({ preferredPaymentTerms: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., Net 30, LC at sight, 30% advance + 70% before shipment"
          />
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900">How We Use This Information</h4>
        <p className="mt-1 text-sm text-blue-700">
          Your purchasing requirements help us recommend suitable suppliers and products.
          This information is shared with potential suppliers to facilitate better matches.
        </p>
      </div>
    </div>
  );
}
