/**
 * User roles with ascending permission levels
 */
export enum UserRole {
  PUBLIC = 'PUBLIC',
  CUSTOMER = 'CUSTOMER',
  ENGINEER = 'ENGINEER',
  QC_INSPECTOR = 'QC_INSPECTOR',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',
}

/**
 * Device lifecycle status
 */
export enum DeviceStatus {
  CREATED = 'CREATED',
  PROCURED = 'PROCURED',
  IN_QC = 'IN_QC',
  QC_PASSED = 'QC_PASSED',
  QC_FAILED = 'QC_FAILED',
  IN_ASSEMBLY = 'IN_ASSEMBLY',
  IN_TESTING = 'IN_TESTING',
  TEST_PASSED = 'TEST_PASSED',
  TEST_FAILED = 'TEST_FAILED',
  PACKAGED = 'PACKAGED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  IN_SERVICE = 'IN_SERVICE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}

/**
 * Product type codes for passport generation
 */
export enum ProductLine {
  PKG = 'PKG', // Packaging Filling
  QI = 'QI',   // Quality Inspection
  MP = 'MP',   // Metal Processing
  PP = 'PP',   // Plastics Processing
  HL = 'HL',   // Hospital Lab
  ET = 'ET',   // Education Training
  WL = 'WL',   // Warehouse Logistics
  IP = 'IP',   // Industrial Parts
  CS = 'CS',   // Custom Solutions
}

// Alias for clearer naming
export type ProductType = ProductLine;
export const ProductType = ProductLine;

/**
 * Service order status
 */
export enum ServiceOrderStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Service types
 */
export enum ServiceType {
  INSTALLATION = 'INSTALLATION',
  REPAIR = 'REPAIR',
  MAINTENANCE = 'MAINTENANCE',
  INSPECTION = 'INSPECTION',
  UPGRADE = 'UPGRADE',
  CONSULTATION = 'CONSULTATION',
}

/**
 * Lifecycle event types
 */
export enum LifecycleEventType {
  STATUS_CHANGE = 'STATUS_CHANGE',
  LOCATION_CHANGE = 'LOCATION_CHANGE',
  OWNERSHIP_TRANSFER = 'OWNERSHIP_TRANSFER',
  SERVICE_PERFORMED = 'SERVICE_PERFORMED',
  DOCUMENT_ATTACHED = 'DOCUMENT_ATTACHED',
  NOTE_ADDED = 'NOTE_ADDED',
  QC_INSPECTION = 'QC_INSPECTION',
  TEST_RESULT = 'TEST_RESULT',
}

/**
 * Country/Origin codes (ISO 3166-1 alpha-2)
 */
export enum OriginCode {
  CN = 'CN', // China
  DE = 'DE', // Germany
  JP = 'JP', // Japan
  US = 'US', // United States
  KR = 'KR', // South Korea
  TW = 'TW', // Taiwan
  IT = 'IT', // Italy
  FR = 'FR', // France
  GB = 'GB', // United Kingdom
  CH = 'CH', // Switzerland
}

/**
 * Valid status transitions map
 */
export const VALID_STATUS_TRANSITIONS: Record<DeviceStatus, DeviceStatus[]> = {
  [DeviceStatus.CREATED]: [DeviceStatus.PROCURED],
  [DeviceStatus.PROCURED]: [DeviceStatus.IN_QC],
  [DeviceStatus.IN_QC]: [DeviceStatus.QC_PASSED, DeviceStatus.QC_FAILED],
  [DeviceStatus.QC_PASSED]: [DeviceStatus.IN_ASSEMBLY],
  [DeviceStatus.QC_FAILED]: [DeviceStatus.IN_QC, DeviceStatus.RETIRED],
  [DeviceStatus.IN_ASSEMBLY]: [DeviceStatus.IN_TESTING],
  [DeviceStatus.IN_TESTING]: [DeviceStatus.TEST_PASSED, DeviceStatus.TEST_FAILED],
  [DeviceStatus.TEST_PASSED]: [DeviceStatus.PACKAGED],
  [DeviceStatus.TEST_FAILED]: [DeviceStatus.IN_ASSEMBLY, DeviceStatus.RETIRED],
  [DeviceStatus.PACKAGED]: [DeviceStatus.IN_TRANSIT],
  [DeviceStatus.IN_TRANSIT]: [DeviceStatus.DELIVERED],
  [DeviceStatus.DELIVERED]: [DeviceStatus.IN_SERVICE],
  [DeviceStatus.IN_SERVICE]: [DeviceStatus.MAINTENANCE, DeviceStatus.RETIRED],
  [DeviceStatus.MAINTENANCE]: [DeviceStatus.IN_SERVICE, DeviceStatus.RETIRED],
  [DeviceStatus.RETIRED]: [],
};

/**
 * Role permission levels (higher number = more permissions)
 */
export const ROLE_PERMISSION_LEVELS: Record<UserRole, number> = {
  [UserRole.PUBLIC]: 0,
  [UserRole.CUSTOMER]: 1,
  [UserRole.ENGINEER]: 2,
  [UserRole.QC_INSPECTOR]: 3,
  [UserRole.OPERATOR]: 4,
  [UserRole.ADMIN]: 5,
};

/**
 * Product type display names
 */
export const PRODUCT_TYPE_NAMES: Record<ProductLine, string> = {
  [ProductLine.PKG]: 'Packaging Filling',
  [ProductLine.QI]: 'Quality Inspection',
  [ProductLine.MP]: 'Metal Processing',
  [ProductLine.PP]: 'Plastics Processing',
  [ProductLine.HL]: 'Hospital Lab',
  [ProductLine.ET]: 'Education Training',
  [ProductLine.WL]: 'Warehouse Logistics',
  [ProductLine.IP]: 'Industrial Parts',
  [ProductLine.CS]: 'Custom Solutions',
};

/**
 * Product type descriptions
 */
export const PRODUCT_TYPE_DESCRIPTIONS: Record<ProductLine, string> = {
  [ProductLine.PKG]: 'Automated packaging and filling solutions designed to improve efficiency, accuracy, and speed in various industries.',
  [ProductLine.QI]: 'Advanced inspection and testing systems to ensure product quality and compliance.',
  [ProductLine.MP]: 'Precision metalworking machinery and automation solutions for cutting, welding, stamping, and forming.',
  [ProductLine.PP]: 'Automated systems for injection molding, extrusion, blow molding, and plastic part handling.',
  [ProductLine.HL]: 'Automation solutions for medical and laboratory environments.',
  [ProductLine.ET]: 'Training systems and simulators for industrial automation and mechatronics education.',
  [ProductLine.WL]: 'Smart logistics and warehouse automation solutions including AS/RS, conveyor systems, and AGVs.',
  [ProductLine.IP]: 'High-quality mechanical and electrical components including motors, drives, sensors, and controllers.',
  [ProductLine.CS]: 'Bespoke automation systems engineered to meet unique client requirements.',
};

// Backward compatibility alias
export const PRODUCT_LINE_NAMES = PRODUCT_TYPE_NAMES;

// ============================================
// Registration System Enums
// ============================================

/**
 * Registration type - Company or Individual Expert
 */
export enum RegistrationType {
  COMPANY = 'COMPANY',
  INDIVIDUAL_EXPERT = 'INDIVIDUAL_EXPERT',
}

/**
 * Company role - can be Supplier, Buyer, or both
 */
export enum CompanyRole {
  SUPPLIER = 'SUPPLIER',
  BUYER = 'BUYER',
}

/**
 * Expert type - Technical or Business
 */
export enum ExpertType {
  TECHNICAL = 'TECHNICAL',
  BUSINESS = 'BUSINESS',
}

/**
 * Organization contact type
 */
export enum ContactType {
  BUSINESS = 'BUSINESS',
  TECHNICAL = 'TECHNICAL',
  FINANCE = 'FINANCE',
  EMERGENCY = 'EMERGENCY',
}

/**
 * Gender options
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

/**
 * Product packaging type
 */
export enum PackagingType {
  WOODEN_BOX = 'WOODEN_BOX',
  CARDBOARD_BOX = 'CARDBOARD_BOX',
}

/**
 * Company legal type
 */
export enum CompanyType {
  LLC = 'LLC',
  CORPORATION = 'CORPORATION',
  PARTNERSHIP = 'PARTNERSHIP',
  SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
  OTHER = 'OTHER',
}

/**
 * Registration approval status
 */
export enum RegistrationStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

/**
 * File category for uploads
 */
export enum FileCategory {
  BUSINESS_LICENSE = 'BUSINESS_LICENSE',
  PRODUCT_IMAGE = 'PRODUCT_IMAGE',
  RESUME = 'RESUME',
  CERTIFICATE = 'CERTIFICATE',
  OTHER = 'OTHER',
}

/**
 * Purchase frequency for buyers
 */
export enum PurchaseFrequency {
  ONE_TIME = 'ONE_TIME',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  AS_NEEDED = 'AS_NEEDED',
}

/**
 * Contact type display names
 */
export const CONTACT_TYPE_NAMES: Record<ContactType, string> = {
  [ContactType.BUSINESS]: 'Business Contact',
  [ContactType.TECHNICAL]: 'Technical Contact',
  [ContactType.FINANCE]: 'Finance Contact',
  [ContactType.EMERGENCY]: 'Emergency Contact',
};

/**
 * Registration status display names
 */
export const REGISTRATION_STATUS_NAMES: Record<RegistrationStatus, string> = {
  [RegistrationStatus.PENDING]: 'Pending Review',
  [RegistrationStatus.UNDER_REVIEW]: 'Under Review',
  [RegistrationStatus.APPROVED]: 'Approved',
  [RegistrationStatus.REJECTED]: 'Rejected',
  [RegistrationStatus.SUSPENDED]: 'Suspended',
};
