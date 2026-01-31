import { useTranslation } from 'react-i18next';
import { useRegistrationStore } from '../../../store/registration.store';
import {
  BuildingOfficeIcon,
  ShoppingCartIcon,
  UserIcon,
  CubeIcon,
  DocumentTextIcon,
  BanknotesIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { CONTACT_TYPE_NAMES, PackagingType, PACKAGING_TYPE_NAMES } from '@device-passport/shared';

interface BuyerProductRequirement {
  productName: string;
  specifications?: string;
  quantity?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency: string;
}

export default function ReviewStep() {
  const { t } = useTranslation();
  const { companyData } = useRegistrationStore();

  // Parse buyer product requirements
  const getBuyerProductRequirements = (): BuyerProductRequirement[] => {
    if (!companyData.buyerProductRequirements) return [];
    try {
      return JSON.parse(companyData.buyerProductRequirements);
    } catch {
      return [];
    }
  };

  const Section = ({
    title,
    icon: Icon,
    children,
  }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
  }) => (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-100">
        <Icon className="h-5 w-5 text-primary-600" />
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="py-1.5">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900 break-words whitespace-pre-wrap">{value || '-'}</dd>
    </div>
  );

  const LongTextField = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="py-1.5">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 break-words whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
        {value || '-'}
      </dd>
    </div>
  );

  const getDisplayCurrency = (product: { priceCurrency?: string; customCurrency?: string }) => {
    if (product.priceCurrency === 'OTHER' && product.customCurrency) {
      return product.customCurrency;
    }
    return product.priceCurrency || 'USD';
  };

  const getDisplayPackaging = (product: { packagingType?: PackagingType; customPackaging?: string }) => {
    if (product.packagingType === PackagingType.OTHER && product.customPackaging) {
      return product.customPackaging;
    }
    if (product.packagingType) {
      return PACKAGING_TYPE_NAMES[product.packagingType] || product.packagingType.replace(/_/g, ' ');
    }
    return null;
  };

  const formatBudget = (product: BuyerProductRequirement) => {
    if (!product.budgetMin && !product.budgetMax) return null;
    const currency = product.budgetCurrency || 'USD';
    if (product.budgetMin && product.budgetMax) {
      return `${currency} ${product.budgetMin.toLocaleString()} - ${product.budgetMax.toLocaleString()}`;
    }
    if (product.budgetMin) {
      return `${currency} ${product.budgetMin.toLocaleString()}+`;
    }
    return `Up to ${currency} ${product.budgetMax?.toLocaleString()}`;
  };

  const buyerProductRequirements = getBuyerProductRequirements();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{t('review.title', 'Review Your Registration')}</h2>
        <p className="mt-2 text-sm text-gray-500">
          {t('review.subtitle', 'Please review your information before submitting. You can go back to make changes.')}
        </p>
      </div>

      {/* Roles */}
      <div className="flex flex-wrap gap-3">
        {companyData.isSupplier && (
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <BuildingOfficeIcon className="h-4 w-4 mr-2" />
            {t('role.supplier', 'Supplier')}
          </div>
        )}
        {companyData.isBuyer && (
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <ShoppingCartIcon className="h-4 w-4 mr-2" />
            {t('role.buyer', 'Buyer')}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Account Info */}
        <Section title={t('review.accountInfo', 'Account Information')} icon={UserIcon}>
          <dl className="grid grid-cols-2 gap-x-4">
            <Field label={t('review.email', 'Email')} value={companyData.email} />
            <Field label={t('review.name', 'Name')} value={companyData.userName} />
          </dl>
        </Section>

        {/* Company Info */}
        <Section title={t('review.companyInfo', 'Company Information')} icon={BuildingOfficeIcon}>
          <dl className="grid grid-cols-2 gap-x-4">
            <Field label={t('review.companyName', 'Company Name')} value={companyData.organizationName} />
            <Field label={t('review.code', 'Code')} value={companyData.organizationCode} />
            <Field label={t('review.companyType', 'Company Type')} value={companyData.companyType} />
            <Field label={t('review.legalRep', 'Legal Representative')} value={companyData.legalRepresentative} />
            <Field
              label={t('review.capital', 'Registered Capital')}
              value={
                companyData.registeredCapital
                  ? `${companyData.registeredCapital.toLocaleString()} ${companyData.capitalCurrency || 'USD'}`
                  : undefined
              }
            />
            <Field label={t('review.establishmentDate', 'Establishment Date')} value={companyData.establishmentDate} />
          </dl>
          {companyData.businessScope && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <LongTextField label={t('review.businessScope', 'Business Scope')} value={companyData.businessScope} />
            </div>
          )}
        </Section>

        {/* Addresses */}
        <Section title={t('review.addresses', 'Addresses')} icon={MapPinIcon}>
          <dl className="space-y-3">
            <LongTextField
              label={t('review.registeredAddress', 'Registered Address')}
              value={companyData.registeredAddress?.street}
            />
            <LongTextField
              label={t('review.businessAddress', 'Business Address')}
              value={companyData.businessAddress?.street}
            />
            {companyData.businessAddress?.latitude && companyData.businessAddress?.longitude && (
              <Field
                label={t('review.coordinates', 'Coordinates')}
                value={`${companyData.businessAddress.latitude.toFixed(6)}, ${companyData.businessAddress.longitude.toFixed(6)}`}
              />
            )}
          </dl>
        </Section>

        {/* Invoice Info */}
        <Section title={t('review.invoiceInfo', 'Invoice Information')} icon={BanknotesIcon}>
          <dl className="grid grid-cols-2 gap-x-4">
            <Field label={t('review.taxNumber', 'Tax Number')} value={companyData.taxNumber} />
            <Field label={t('review.bankName', 'Bank Name')} value={companyData.bankName} />
            <Field label={t('review.accountNumber', 'Account Number')} value={companyData.bankAccountNumber} />
            <Field label={t('review.invoicePhone', 'Invoice Phone')} value={companyData.invoicePhone} />
          </dl>
          {companyData.invoiceAddress && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <LongTextField label={t('review.invoiceAddress', 'Invoice Address')} value={companyData.invoiceAddress} />
            </div>
          )}
        </Section>

        {/* Contacts */}
        <Section title={t('review.contacts', 'Contacts')} icon={UserIcon}>
          {companyData.contacts.length === 0 ? (
            <p className="text-sm text-gray-500 italic">{t('review.noContacts', 'No contacts added')}</p>
          ) : (
            <ul className="space-y-3">
              {companyData.contacts.map((contact, index) => (
                <li key={index} className="text-sm bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{contact.name}</span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                      {CONTACT_TYPE_NAMES[contact.contactType]}
                    </span>
                  </div>
                  <div className="mt-1 text-gray-600 text-xs space-y-0.5">
                    {contact.email && <p>{contact.email}</p>}
                    {contact.phone && <p>{contact.phone}</p>}
                    {contact.mobile && <p>{contact.mobile}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Products (if supplier) */}
        {companyData.isSupplier && (
          <Section title={t('review.products', 'Products')} icon={CubeIcon}>
            {companyData.products.length === 0 ? (
              <p className="text-sm text-gray-500 italic">{t('review.noProducts', 'No products added')}</p>
            ) : (
              <ul className="space-y-3">
                {companyData.products.map((product, index) => (
                  <li key={index} className="text-sm bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900 block truncate">{product.name}</span>
                        {product.model && (
                          <span className="text-gray-500 text-xs">Model: {product.model}</span>
                        )}
                      </div>
                      {product.sellingPrice && (
                        <span className="text-gray-700 font-medium text-xs ml-2 whitespace-nowrap">
                          {getDisplayCurrency(product)} {product.sellingPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-600 flex flex-wrap gap-2">
                      {product.brand && <span>Brand: {product.brand}</span>}
                      {product.hsCode && <span>HS: {product.hsCode}</span>}
                      {getDisplayPackaging(product) && (
                        <span>Pkg: {getDisplayPackaging(product)}</span>
                      )}
                    </div>
                    {product.description && (
                      <p className="mt-2 text-xs text-gray-600 line-clamp-2 break-words">
                        {product.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )}

        {/* Buyer Requirements (if buyer) */}
        {companyData.isBuyer && (
          <Section title={t('review.buyerRequirements', 'Buyer Requirements')} icon={DocumentTextIcon}>
            {buyerProductRequirements.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  {t('review.productRequirements', 'Product Requirements')}
                </h4>
                <ul className="space-y-2">
                  {buyerProductRequirements.map((product, index) => (
                    <li key={index} className="text-sm bg-gray-50 rounded-lg p-3">
                      <div className="font-medium text-gray-900">{product.productName}</div>
                      {product.specifications && (
                        <p className="text-xs text-gray-600 mt-1 break-words whitespace-pre-wrap line-clamp-2">
                          {product.specifications}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                        {product.quantity && <span>Qty: {product.quantity}</span>}
                        {formatBudget(product) && <span>Budget: {formatBudget(product)}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <dl className="space-y-2">
              {companyData.buyerProductDescription && (
                <LongTextField
                  label={t('review.generalNeeds', 'General Requirements')}
                  value={companyData.buyerProductDescription}
                />
              )}
              <Field label={t('review.purchaseFrequency', 'Purchase Frequency')} value={companyData.purchaseFrequency} />
              <Field label={t('review.volume', 'Volume')} value={companyData.purchaseVolume} />
              {companyData.preferredPaymentTerms && (
                <LongTextField
                  label={t('review.paymentTerms', 'Payment Terms')}
                  value={companyData.preferredPaymentTerms}
                />
              )}
            </dl>
          </Section>
        )}
      </div>

      <div className="bg-amber-50 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-amber-900">{t('review.nextSteps', 'What happens next?')}</h4>
        <ul className="mt-3 text-sm text-amber-700 list-disc list-inside space-y-1.5">
          <li>{t('review.step1', 'Your registration will be submitted for review')}</li>
          <li>{t('review.step2', 'Our team will verify your information')}</li>
          <li>{t('review.step3', "You'll receive an email once your account is approved")}</li>
          <li>{t('review.step4', 'You can log in immediately, but some features will be limited until approval')}</li>
        </ul>
      </div>
    </div>
  );
}
