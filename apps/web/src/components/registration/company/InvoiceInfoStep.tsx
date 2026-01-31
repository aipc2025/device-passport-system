import { useRegistrationStore } from '../../../store/registration.store';

export default function InvoiceInfoStep() {
  const { companyData, updateCompanyData } = useRegistrationStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Invoice Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Provide your tax and banking information for invoicing purposes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Tax Number / VAT ID</label>
          <input
            type="text"
            value={companyData.taxNumber || ''}
            onChange={(e) => updateCompanyData({ taxNumber: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., DE123456789"
          />
          <p className="mt-1 text-xs text-gray-500">
            Your company's tax identification number
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Bank Name</label>
          <input
            type="text"
            value={companyData.bankName || ''}
            onChange={(e) => updateCompanyData({ bankName: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., Deutsche Bank"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Bank Account Number / IBAN</label>
          <input
            type="text"
            value={companyData.bankAccountNumber || ''}
            onChange={(e) => updateCompanyData({ bankAccountNumber: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="e.g., DE89 3704 0044 0532 0130 00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice Phone</label>
          <input
            type="tel"
            value={companyData.invoicePhone || ''}
            onChange={(e) => updateCompanyData({ invoicePhone: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="+49 123 456789"
          />
          <p className="mt-1 text-xs text-gray-500">
            Contact number for invoice inquiries
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Invoice Address</label>
          <textarea
            rows={3}
            value={companyData.invoiceAddress || ''}
            onChange={(e) => updateCompanyData({ invoiceAddress: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Full address for invoicing (if different from registered address)"
          />
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900">Note</h4>
        <p className="mt-1 text-sm text-blue-700">
          This information will be used for generating invoices and financial transactions.
          Make sure the details are accurate as they will appear on official documents.
        </p>
      </div>
    </div>
  );
}
