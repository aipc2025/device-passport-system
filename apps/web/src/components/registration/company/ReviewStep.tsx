import { useRegistrationStore } from '../../../store/registration.store';
import {
  BuildingOfficeIcon,
  ShoppingCartIcon,
  UserIcon,
  CubeIcon,
  DocumentTextIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { CONTACT_TYPE_NAMES } from '@device-passport/shared';

export default function ReviewStep() {
  const { companyData } = useRegistrationStore();

  const Section = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }) => (
    <div className="border rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Icon className="h-5 w-5 text-gray-400" />
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="py-1">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value || '-'}</dd>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Review Your Registration</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please review your information before submitting. You can go back to make changes.
        </p>
      </div>

      {/* Roles */}
      <div className="flex space-x-4">
        {companyData.isSupplier && (
          <div className="flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">
            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
            Supplier
          </div>
        )}
        {companyData.isBuyer && (
          <div className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm">
            <ShoppingCartIcon className="h-4 w-4 mr-1" />
            Buyer
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Account Info */}
        <Section title="Account Information" icon={UserIcon}>
          <dl className="grid grid-cols-2 gap-x-4">
            <Field label="Email" value={companyData.email} />
            <Field label="Name" value={companyData.userName} />
          </dl>
        </Section>

        {/* Company Info */}
        <Section title="Company Information" icon={BuildingOfficeIcon}>
          <dl className="grid grid-cols-2 gap-x-4">
            <Field label="Company Name" value={companyData.organizationName} />
            <Field label="Code" value={companyData.organizationCode} />
            <Field label="Company Type" value={companyData.companyType} />
            <Field label="Legal Representative" value={companyData.legalRepresentative} />
            <Field
              label="Registered Capital"
              value={
                companyData.registeredCapital
                  ? `${companyData.registeredCapital} ${companyData.capitalCurrency || 'USD'}`
                  : undefined
              }
            />
            <Field label="Establishment Date" value={companyData.establishmentDate} />
          </dl>
        </Section>

        {/* Invoice Info */}
        <Section title="Invoice Information" icon={BanknotesIcon}>
          <dl className="grid grid-cols-2 gap-x-4">
            <Field label="Tax Number" value={companyData.taxNumber} />
            <Field label="Bank Name" value={companyData.bankName} />
            <Field label="Account Number" value={companyData.bankAccountNumber} />
            <Field label="Invoice Phone" value={companyData.invoicePhone} />
          </dl>
        </Section>

        {/* Contacts */}
        <Section title="Contacts" icon={UserIcon}>
          {companyData.contacts.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No contacts added</p>
          ) : (
            <ul className="space-y-2">
              {companyData.contacts.map((contact, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{contact.name}</span>
                  <span className="text-gray-500 ml-2">
                    ({CONTACT_TYPE_NAMES[contact.contactType]})
                  </span>
                  {contact.email && (
                    <span className="text-gray-500 ml-2">{contact.email}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Products (if supplier) */}
        {companyData.isSupplier && (
          <Section title="Products" icon={CubeIcon}>
            {companyData.products.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No products added</p>
            ) : (
              <ul className="space-y-2">
                {companyData.products.map((product, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{product.name}</span>
                    {product.model && (
                      <span className="text-gray-500 ml-2">Model: {product.model}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}

        {/* Buyer Requirements (if buyer) */}
        {companyData.isBuyer && (
          <Section title="Buyer Requirements" icon={DocumentTextIcon}>
            <dl>
              <Field label="Product Needs" value={companyData.buyerProductDescription} />
              <Field label="Purchase Frequency" value={companyData.purchaseFrequency} />
              <Field label="Volume" value={companyData.purchaseVolume} />
            </dl>
          </Section>
        )}
      </div>

      <div className="bg-amber-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-amber-900">What happens next?</h4>
        <ul className="mt-2 text-sm text-amber-700 list-disc list-inside space-y-1">
          <li>Your registration will be submitted for review</li>
          <li>Our team will verify your information</li>
          <li>You'll receive an email once your account is approved</li>
          <li>You can log in immediately, but some features will be limited until approval</li>
        </ul>
      </div>
    </div>
  );
}
