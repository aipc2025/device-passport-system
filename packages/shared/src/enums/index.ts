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
  PF = 'PF',   // Packaging Filling
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
  VN = 'VN', // Vietnam
  OTHER = 'OTHER', // Other (custom)
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
  [ProductLine.PF]: 'Packaging Filling',
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
  [ProductLine.PF]: 'Automated packaging and filling solutions designed to improve efficiency, accuracy, and speed in various industries.',
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
  PLASTIC_WRAP = 'PLASTIC_WRAP',
  FOAM_PACKAGING = 'FOAM_PACKAGING',
  PALLET = 'PALLET',
  OTHER = 'OTHER',
}

/**
 * Packaging type display names
 */
export const PACKAGING_TYPE_NAMES: Record<PackagingType, string> = {
  [PackagingType.WOODEN_BOX]: 'Wooden Box',
  [PackagingType.CARDBOARD_BOX]: 'Cardboard Box',
  [PackagingType.PLASTIC_WRAP]: 'Plastic Wrap',
  [PackagingType.FOAM_PACKAGING]: 'Foam Packaging',
  [PackagingType.PALLET]: 'Pallet',
  [PackagingType.OTHER]: 'Other',
};

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
  SERVICE_ATTACHMENT = 'SERVICE_ATTACHMENT',
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

// ============================================
// B2B Marketplace Enums
// ============================================

/**
 * Marketplace product listing status
 */
export enum MarketplaceListingStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED',
  REMOVED = 'REMOVED',
}

/**
 * Marketplace listing status display names
 */
export const MARKETPLACE_LISTING_STATUS_NAMES: Record<MarketplaceListingStatus, string> = {
  [MarketplaceListingStatus.DRAFT]: 'Draft',
  [MarketplaceListingStatus.PENDING_REVIEW]: 'Pending Review',
  [MarketplaceListingStatus.ACTIVE]: 'Active',
  [MarketplaceListingStatus.PAUSED]: 'Paused',
  [MarketplaceListingStatus.EXPIRED]: 'Expired',
  [MarketplaceListingStatus.REMOVED]: 'Removed',
};

/**
 * RFQ (Request for Quotation) status
 */
export enum RFQStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

/**
 * RFQ status display names
 */
export const RFQ_STATUS_NAMES: Record<RFQStatus, string> = {
  [RFQStatus.DRAFT]: 'Draft',
  [RFQStatus.OPEN]: 'Open',
  [RFQStatus.CLOSED]: 'Closed',
  [RFQStatus.FULFILLED]: 'Fulfilled',
  [RFQStatus.CANCELLED]: 'Cancelled',
  [RFQStatus.EXPIRED]: 'Expired',
};

/**
 * Match type - direction of the match
 */
export enum MatchType {
  PRODUCT_TO_BUYER = 'PRODUCT_TO_BUYER',
  REQUIREMENT_TO_SUPPLIER = 'REQUIREMENT_TO_SUPPLIER',
}

/**
 * Match status - user interaction state
 */
export enum MatchStatus {
  NEW = 'NEW',
  VIEWED = 'VIEWED',
  CONTACTED = 'CONTACTED',
  DISMISSED = 'DISMISSED',
}

/**
 * Match status display names
 */
export const MATCH_STATUS_NAMES: Record<MatchStatus, string> = {
  [MatchStatus.NEW]: 'New',
  [MatchStatus.VIEWED]: 'Viewed',
  [MatchStatus.CONTACTED]: 'Contacted',
  [MatchStatus.DISMISSED]: 'Dismissed',
};

/**
 * Match source - how the match was created
 */
export enum MatchSource {
  AI_MATCHED = 'AI_MATCHED',
  PLATFORM_RECOMMENDED = 'PLATFORM_RECOMMENDED',
  BUYER_SPECIFIED = 'BUYER_SPECIFIED',
}

/**
 * Match source display names
 */
export const MATCH_SOURCE_NAMES: Record<MatchSource, string> = {
  [MatchSource.AI_MATCHED]: 'AI Matched',
  [MatchSource.PLATFORM_RECOMMENDED]: 'Platform Recommended',
  [MatchSource.BUYER_SPECIFIED]: 'Buyer Specified',
};

/**
 * Inquiry status
 */
export enum InquiryStatus {
  PENDING = 'PENDING',
  RESPONDED = 'RESPONDED',
  NEGOTIATING = 'NEGOTIATING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

/**
 * Inquiry status display names
 */
export const INQUIRY_STATUS_NAMES: Record<InquiryStatus, string> = {
  [InquiryStatus.PENDING]: 'Pending',
  [InquiryStatus.RESPONDED]: 'Responded',
  [InquiryStatus.NEGOTIATING]: 'Negotiating',
  [InquiryStatus.ACCEPTED]: 'Accepted',
  [InquiryStatus.REJECTED]: 'Rejected',
  [InquiryStatus.EXPIRED]: 'Expired',
};

/**
 * Inquiry message type
 */
export enum InquiryMessageType {
  MESSAGE = 'MESSAGE',
  QUOTE = 'QUOTE',
  COUNTER_OFFER = 'COUNTER_OFFER',
  ACCEPTANCE = 'ACCEPTANCE',
  REJECTION = 'REJECTION',
  SYSTEM = 'SYSTEM',
}

/**
 * Inquiry message type display names
 */
export const INQUIRY_MESSAGE_TYPE_NAMES: Record<InquiryMessageType, string> = {
  [InquiryMessageType.MESSAGE]: 'Message',
  [InquiryMessageType.QUOTE]: 'Quote',
  [InquiryMessageType.COUNTER_OFFER]: 'Counter Offer',
  [InquiryMessageType.ACCEPTANCE]: 'Acceptance',
  [InquiryMessageType.REJECTION]: 'Rejection',
  [InquiryMessageType.SYSTEM]: 'System',
};

/**
 * Saved item type for favorites/bookmarks
 */
export enum SavedItemType {
  SUPPLIER = 'SUPPLIER',
  PRODUCT = 'PRODUCT',
  RFQ = 'RFQ',
}

/**
 * Saved item type display names
 */
export const SAVED_ITEM_TYPE_NAMES: Record<SavedItemType, string> = {
  [SavedItemType.SUPPLIER]: 'Supplier',
  [SavedItemType.PRODUCT]: 'Product',
  [SavedItemType.RFQ]: 'RFQ',
};

/**
 * Purchase frequency display names
 */
export const PURCHASE_FREQUENCY_NAMES: Record<PurchaseFrequency, string> = {
  [PurchaseFrequency.ONE_TIME]: 'One Time',
  [PurchaseFrequency.MONTHLY]: 'Monthly',
  [PurchaseFrequency.QUARTERLY]: 'Quarterly',
  [PurchaseFrequency.YEARLY]: 'Yearly',
  [PurchaseFrequency.AS_NEEDED]: 'As Needed',
};

// ============================================
// Expert Service System Enums
// ============================================

/**
 * Public service request status
 */
export enum ServiceRequestStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

/**
 * Service request status display names
 */
export const SERVICE_REQUEST_STATUS_NAMES: Record<ServiceRequestStatus, string> = {
  [ServiceRequestStatus.DRAFT]: 'Draft',
  [ServiceRequestStatus.OPEN]: 'Open',
  [ServiceRequestStatus.IN_PROGRESS]: 'In Progress',
  [ServiceRequestStatus.COMPLETED]: 'Completed',
  [ServiceRequestStatus.CANCELLED]: 'Cancelled',
  [ServiceRequestStatus.EXPIRED]: 'Expired',
};

/**
 * Service request urgency level
 */
export enum ServiceUrgency {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Service urgency display names
 */
export const SERVICE_URGENCY_NAMES: Record<ServiceUrgency, string> = {
  [ServiceUrgency.LOW]: 'Low',
  [ServiceUrgency.NORMAL]: 'Normal',
  [ServiceUrgency.HIGH]: 'High',
  [ServiceUrgency.URGENT]: 'Urgent',
};

/**
 * Expert application status for service requests
 */
export enum ExpertApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

/**
 * Expert application status display names
 */
export const EXPERT_APPLICATION_STATUS_NAMES: Record<ExpertApplicationStatus, string> = {
  [ExpertApplicationStatus.PENDING]: 'Pending',
  [ExpertApplicationStatus.ACCEPTED]: 'Accepted',
  [ExpertApplicationStatus.REJECTED]: 'Rejected',
  [ExpertApplicationStatus.WITHDRAWN]: 'Withdrawn',
};

/**
 * Expert match type (for expert-to-service matching)
 */
export enum ExpertMatchType {
  SERVICE_TO_EXPERT = 'SERVICE_TO_EXPERT',
  EXPERT_TO_SERVICE = 'EXPERT_TO_SERVICE',
}

/**
 * Expert match status
 */
export enum ExpertMatchStatus {
  NEW = 'NEW',
  VIEWED = 'VIEWED',
  APPLIED = 'APPLIED',
  DISMISSED = 'DISMISSED',
}

/**
 * Expert match status display names
 */
export const EXPERT_MATCH_STATUS_NAMES: Record<ExpertMatchStatus, string> = {
  [ExpertMatchStatus.NEW]: 'New',
  [ExpertMatchStatus.VIEWED]: 'Viewed',
  [ExpertMatchStatus.APPLIED]: 'Applied',
  [ExpertMatchStatus.DISMISSED]: 'Dismissed',
};
