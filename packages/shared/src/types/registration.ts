import {
  RegistrationType,
  ExpertType,
  ContactType,
  Gender,
  PackagingType,
  CompanyType,
  RegistrationStatus,
  FileCategory,
  PurchaseFrequency,
} from '../enums';

// ============================================
// Address Types
// ============================================

/**
 * Address with optional coordinates
 */
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// ============================================
// Company Profile Types
// ============================================

/**
 * Company profile linked to Organization
 */
export interface CompanyProfile {
  id: string;
  organizationId: string;

  // Roles
  isSupplier: boolean;
  isBuyer: boolean;

  // Business License Info (Section A)
  registeredCapital?: number;
  capitalCurrency?: string;
  companyType?: CompanyType;
  establishmentDate?: Date;
  legalRepresentative?: string;
  businessScope?: string;

  // Addresses
  registeredAddress?: Address;
  businessAddress?: Address;

  // Invoice Info (Section C)
  taxNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  invoicePhone?: string;
  invoiceAddress?: string;

  // Buyer Requirements (Section E)
  buyerProductDescription?: string;
  purchaseFrequency?: PurchaseFrequency;
  purchaseVolume?: string;
  preferredPaymentTerms?: string;

  // Registration Status
  registrationStatus: RegistrationStatus;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Organization Contact Types
// ============================================

/**
 * Contact person for an organization
 */
export interface OrganizationContact {
  id: string;
  organizationId: string;
  contactType: ContactType;
  name: string;
  gender?: Gender;
  phone?: string;
  mobile?: string;
  email?: string;
  position?: string;
  department?: string;
  isPrimary: boolean;
  personalNotes?: string; // Admin-only field
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create contact DTO
 */
export interface CreateContactDto {
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

/**
 * Update contact DTO
 */
export interface UpdateContactDto {
  name?: string;
  gender?: Gender;
  phone?: string;
  mobile?: string;
  email?: string;
  position?: string;
  department?: string;
  isPrimary?: boolean;
  personalNotes?: string; // Admin-only
}

// ============================================
// Supplier Product Types
// ============================================

/**
 * Product offered by a supplier
 */
export interface SupplierProduct {
  id: string;
  organizationId: string;

  // Basic Info
  name: string;
  model?: string;
  brand?: string;
  hsCode?: string;
  description?: string;

  // Pricing
  costPrice?: number;
  sellingPrice?: number;
  priceCurrency?: string;

  // Packaging & Dimensions
  packagingType?: PackagingType;
  length?: number; // cm
  width?: number; // cm
  height?: number; // cm
  netWeight?: number; // kg
  grossWeight?: number; // kg

  // Status
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create supplier product DTO
 */
export interface CreateSupplierProductDto {
  name: string;
  model?: string;
  brand?: string;
  hsCode?: string;
  description?: string;
  costPrice?: number;
  sellingPrice?: number;
  priceCurrency?: string;
  packagingType?: PackagingType;
  length?: number;
  width?: number;
  height?: number;
  netWeight?: number;
  grossWeight?: number;
}

/**
 * Update supplier product DTO
 */
export interface UpdateSupplierProductDto {
  name?: string;
  model?: string;
  brand?: string;
  hsCode?: string;
  description?: string;
  costPrice?: number;
  sellingPrice?: number;
  priceCurrency?: string;
  packagingType?: PackagingType;
  length?: number;
  width?: number;
  height?: number;
  netWeight?: number;
  grossWeight?: number;
  isActive?: boolean;
}

// ============================================
// Individual Expert Types
// ============================================

/**
 * Individual expert profile linked to User
 */
export interface IndividualExpert {
  id: string;
  userId: string;
  expertType: ExpertType;

  // Personal Info (Section F)
  personalName: string;
  idNumber?: string;
  phone?: string;
  dateOfBirth?: Date;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  // Professional Info
  professionalField?: string;
  servicesOffered?: string;
  yearsOfExperience?: number;
  certifications?: string[];

  // Location
  currentLocation?: string;
  locationLat?: number;
  locationLng?: number;

  // Admin fields
  personalNotes?: string;
  registrationStatus: RegistrationStatus;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Uploaded File Types
// ============================================

/**
 * Uploaded file metadata
 */
export interface UploadedFile {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  publicUrl?: string;
  fileCategory: FileCategory;

  // Polymorphic relation
  relatedEntityType?: string;
  relatedEntityId?: string;

  // OCR (future feature)
  ocrData?: Record<string, unknown>;
  ocrProcessed?: boolean;

  uploadedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  publicUrl: string;
}

// ============================================
// Company Registration DTOs
// ============================================

/**
 * Company registration request
 */
export interface CompanyRegistrationDto {
  // User info
  email: string;
  password: string;
  userName: string;

  // Organization info
  organizationName: string;
  organizationCode: string; // 3-letter code

  // Roles
  isSupplier: boolean;
  isBuyer: boolean;

  // Business License Info (Section A)
  registeredCapital?: number;
  capitalCurrency?: string;
  companyType?: CompanyType;
  establishmentDate?: string; // ISO date string
  legalRepresentative?: string;
  businessScope?: string;
  registeredAddress?: Address;
  businessAddress?: Address;
  businessLicenseFileId?: string;

  // Contacts (Section B)
  contacts?: CreateContactDto[];

  // Invoice Info (Section C)
  taxNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  invoicePhone?: string;
  invoiceAddress?: string;

  // Supplier Products (Section D) - if isSupplier
  products?: CreateSupplierProductDto[];
  productImageFileIds?: string[];

  // Buyer Requirements (Section E) - if isBuyer
  buyerProductDescription?: string;
  purchaseFrequency?: PurchaseFrequency;
  purchaseVolume?: string;
  preferredPaymentTerms?: string;
}

// ============================================
// Expert Registration DTOs
// ============================================

/**
 * Expert registration request
 */
export interface ExpertRegistrationDto {
  // User info
  email: string;
  password: string;

  // Expert type
  expertType: ExpertType;

  // Personal Info (Section F)
  personalName: string;
  idNumber?: string;
  phone?: string;
  dateOfBirth?: string; // ISO date string

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;

  // Professional Info
  professionalField?: string;
  servicesOffered?: string;
  yearsOfExperience?: number;
  certifications?: string[];

  // Location
  currentLocation?: string;
  locationLat?: number;
  locationLng?: number;

  // File uploads
  resumeFileId?: string;
  certificateFileIds?: string[];
}

// ============================================
// Registration Status DTOs
// ============================================

/**
 * Registration status response
 */
export interface RegistrationStatusResponse {
  registrationType: RegistrationType;
  status: RegistrationStatus;
  adminNotes?: string;
  reviewedAt?: Date;
  submittedAt: Date;
}

/**
 * Update registration status DTO (Admin)
 */
export interface UpdateRegistrationStatusDto {
  status: RegistrationStatus;
  adminNotes?: string;
}

/**
 * Pending registration list item
 */
export interface PendingRegistration {
  id: string;
  registrationType: RegistrationType;
  name: string; // Company name or expert name
  email: string;
  status: RegistrationStatus;
  submittedAt: Date;
  // Additional info based on type
  companyCode?: string;
  isSupplier?: boolean;
  isBuyer?: boolean;
  expertType?: ExpertType;
}
