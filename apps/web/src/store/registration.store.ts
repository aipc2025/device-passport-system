import { create } from 'zustand';
import {
  RegistrationType,
  CompanyType,
  ContactType,
  Gender,
  ExpertType,
  PackagingType,
  PurchaseFrequency,
  IndustryCode,
  SkillCode,
} from '@device-passport/shared';

export { Gender } from '@device-passport/shared';

// Types for form data
export interface AddressData {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface ContactData {
  id?: string;
  contactType: ContactType;
  name: string;
  gender?: Gender;
  phone?: string;
  mobile?: string;
  email?: string;
  position?: string;
  department?: string;
  isPrimary?: boolean;
}

export interface ProductData {
  id?: string;
  name: string;
  model?: string;
  brand?: string;
  hsCode?: string;
  description?: string;
  costPrice?: number;
  sellingPrice?: number;
  priceCurrency?: string;
  customCurrency?: string; // For "Other" currency option
  packagingType?: PackagingType;
  customPackaging?: string; // For "Other" packaging option
  length?: number;
  width?: number;
  height?: number;
  netWeight?: number;
  grossWeight?: number;
  imageFileIds?: string[];
}

export interface CompanyFormData {
  // User info
  email: string;
  password: string;
  confirmPassword: string;
  userName: string;

  // Organization info
  organizationName: string;
  organizationCode: string;

  // Roles
  isSupplier: boolean;
  isBuyer: boolean;

  // Business License Info (Section A)
  registeredCapital?: number;
  capitalCurrency?: string;
  companyType?: CompanyType;
  establishmentDate?: string;
  legalRepresentative?: string;
  businessScope?: string;
  registeredAddress?: AddressData;
  businessAddress?: AddressData;
  businessLicenseFileId?: string;

  // Contacts (Section B)
  contacts: ContactData[];

  // Invoice Info (Section C)
  taxNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  invoicePhone?: string;
  invoiceAddress?: string;

  // Supplier Products (Section D)
  products: ProductData[];

  // Buyer Requirements (Section E)
  buyerProductDescription?: string;
  buyerProductRequirements?: string; // JSON string of product requirements
  purchaseFrequency?: PurchaseFrequency;
  purchaseVolume?: string;
  preferredPaymentTerms?: string;
}

export interface WorkHistoryEntry {
  id?: string;
  companyName: string;
  companyContactEmail?: string;
  companyContactPhone?: string;
  companyAddress?: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  isPublic?: boolean;
}

export interface ExpertFormData {
  // User info
  email: string;
  password: string;
  confirmPassword: string;

  // Expert type - now supports multiple selection
  expertTypes: ExpertType[];

  // Industries and Skills for passport code
  industries: IndustryCode[];
  skills: SkillCode[];

  // Personal Info (Section F)
  personalName: string;
  gender?: Gender;
  nationality?: string; // ISO 3166-1 Alpha-2 code (e.g., CN, US, DE)
  passportNumber?: string;
  idNumber?: string;
  phone?: string;
  dateOfBirth?: string;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  // Professional Info
  professionalField?: string;
  servicesOffered?: string;
  yearsOfExperience?: number;
  certifications?: string[];
  workHistory: WorkHistoryEntry[];

  // Location
  currentLocation?: string;
  locationLat?: number;
  locationLng?: number;

  // File uploads
  resumeFileId?: string;
  certificateFileIds?: string[];
  idDocumentFileId?: string; // ID/passport document
  photoFileId?: string; // Personal photo

  // Profile visibility
  isProfilePublic?: boolean;
  bio?: string;
}

// Company registration steps
export type CompanyStep =
  | 'role-selection'
  | 'business-license'
  | 'contacts'
  | 'invoice-info'
  | 'supplier-products'
  | 'buyer-requirements'
  | 'review';

// Expert registration steps
export type ExpertStep =
  | 'expert-type'
  | 'industry-skill'
  | 'personal-info'
  | 'professional-info'
  | 'documents'
  | 'review';

// Initial form data
const initialCompanyData: CompanyFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  userName: '',
  organizationName: '',
  organizationCode: '',
  isSupplier: false,
  isBuyer: false,
  contacts: [],
  products: [],
};

const initialExpertData: ExpertFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  expertTypes: [],
  industries: [],
  skills: [],
  personalName: '',
  workHistory: [],
  isProfilePublic: true,
};

interface RegistrationState {
  // Type selection
  registrationType: RegistrationType | null;

  // Company form
  companyData: CompanyFormData;
  companyStep: CompanyStep;
  companySteps: CompanyStep[];

  // Expert form
  expertData: ExpertFormData;
  expertStep: ExpertStep;
  expertSteps: ExpertStep[];

  // Status
  isSubmitting: boolean;
  error: string | null;

  // Actions
  setRegistrationType: (type: RegistrationType | null) => void;

  // Company actions
  updateCompanyData: (data: Partial<CompanyFormData>) => void;
  setCompanyStep: (step: CompanyStep) => void;
  nextCompanyStep: () => void;
  prevCompanyStep: () => void;
  addContact: (contact: ContactData) => void;
  updateContact: (index: number, contact: ContactData) => void;
  removeContact: (index: number) => void;
  addProduct: (product: ProductData) => void;
  updateProduct: (index: number, product: ProductData) => void;
  removeProduct: (index: number) => void;

  // Expert actions
  updateExpertData: (data: Partial<ExpertFormData>) => void;
  setExpertStep: (step: ExpertStep) => void;
  nextExpertStep: () => void;
  prevExpertStep: () => void;

  // Status actions
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;

  // Reset
  reset: () => void;
}

// Get company steps based on roles
const getCompanySteps = (isSupplier: boolean, isBuyer: boolean): CompanyStep[] => {
  const steps: CompanyStep[] = [
    'role-selection',
    'business-license',
    'contacts',
    'invoice-info',
  ];

  if (isSupplier) {
    steps.push('supplier-products');
  }

  if (isBuyer) {
    steps.push('buyer-requirements');
  }

  steps.push('review');
  return steps;
};

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  // Initial state
  registrationType: null,
  companyData: initialCompanyData,
  companyStep: 'role-selection',
  companySteps: ['role-selection', 'business-license', 'contacts', 'invoice-info', 'review'],
  expertData: initialExpertData,
  expertStep: 'expert-type',
  expertSteps: ['expert-type', 'industry-skill', 'personal-info', 'professional-info', 'documents', 'review'],
  isSubmitting: false,
  error: null,

  // Type selection
  setRegistrationType: (type) => set({ registrationType: type }),

  // Company actions
  updateCompanyData: (data) => {
    const newData = { ...get().companyData, ...data };
    const steps = getCompanySteps(newData.isSupplier, newData.isBuyer);
    set({ companyData: newData, companySteps: steps });
  },

  setCompanyStep: (step) => set({ companyStep: step }),

  nextCompanyStep: () => {
    const { companyStep, companySteps } = get();
    const currentIndex = companySteps.indexOf(companyStep);
    if (currentIndex < companySteps.length - 1) {
      set({ companyStep: companySteps[currentIndex + 1] });
    }
  },

  prevCompanyStep: () => {
    const { companyStep, companySteps } = get();
    const currentIndex = companySteps.indexOf(companyStep);
    if (currentIndex > 0) {
      set({ companyStep: companySteps[currentIndex - 1] });
    }
  },

  addContact: (contact) => {
    const contacts = [...get().companyData.contacts, contact];
    set({ companyData: { ...get().companyData, contacts } });
  },

  updateContact: (index, contact) => {
    const contacts = [...get().companyData.contacts];
    contacts[index] = contact;
    set({ companyData: { ...get().companyData, contacts } });
  },

  removeContact: (index) => {
    const contacts = get().companyData.contacts.filter((_, i) => i !== index);
    set({ companyData: { ...get().companyData, contacts } });
  },

  addProduct: (product) => {
    const products = [...get().companyData.products, product];
    set({ companyData: { ...get().companyData, products } });
  },

  updateProduct: (index, product) => {
    const products = [...get().companyData.products];
    products[index] = product;
    set({ companyData: { ...get().companyData, products } });
  },

  removeProduct: (index) => {
    const products = get().companyData.products.filter((_, i) => i !== index);
    set({ companyData: { ...get().companyData, products } });
  },

  // Expert actions
  updateExpertData: (data) => set({ expertData: { ...get().expertData, ...data } }),

  setExpertStep: (step) => set({ expertStep: step }),

  nextExpertStep: () => {
    const { expertStep, expertSteps } = get();
    const currentIndex = expertSteps.indexOf(expertStep);
    if (currentIndex < expertSteps.length - 1) {
      set({ expertStep: expertSteps[currentIndex + 1] });
    }
  },

  prevExpertStep: () => {
    const { expertStep, expertSteps } = get();
    const currentIndex = expertSteps.indexOf(expertStep);
    if (currentIndex > 0) {
      set({ expertStep: expertSteps[currentIndex - 1] });
    }
  },

  // Status actions
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),
  setError: (error) => set({ error }),

  // Reset
  reset: () =>
    set({
      registrationType: null,
      companyData: initialCompanyData,
      companyStep: 'role-selection',
      companySteps: ['role-selection', 'business-license', 'contacts', 'invoice-info', 'review'],
      expertData: initialExpertData,
      expertStep: 'expert-type',
      expertSteps: ['expert-type', 'industry-skill', 'personal-info', 'professional-info', 'documents', 'review'],
      isSubmitting: false,
      error: null,
    }),
}));
