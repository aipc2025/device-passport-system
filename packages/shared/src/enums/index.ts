/**
 * User roles with ascending permission levels
 * Extended to support organization-specific roles for multi-tenant RBAC
 */
export enum UserRole {
  // Public and customer roles
  PUBLIC = 'PUBLIC',
  CUSTOMER = 'CUSTOMER',

  // Internal platform roles
  ENGINEER = 'ENGINEER',
  QC_INSPECTOR = 'QC_INSPECTOR',
  OPERATOR = 'OPERATOR',
  ADMIN = 'ADMIN',

  // Supplier organization roles (for multi-tenant)
  SUPPLIER_VIEWER = 'SUPPLIER_VIEWER',     // View-only access to own org data
  SUPPLIER_QC = 'SUPPLIER_QC',             // QC inspector at supplier
  SUPPLIER_PACKER = 'SUPPLIER_PACKER',     // Packaging staff at supplier
  SUPPLIER_SHIPPER = 'SUPPLIER_SHIPPER',   // Shipping staff at supplier
  SUPPLIER_ADMIN = 'SUPPLIER_ADMIN',       // Admin at supplier org
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
  [UserRole.SUPPLIER_VIEWER]: 1,
  [UserRole.ENGINEER]: 2,
  [UserRole.SUPPLIER_QC]: 2,
  [UserRole.QC_INSPECTOR]: 3,
  [UserRole.SUPPLIER_PACKER]: 3,
  [UserRole.SUPPLIER_SHIPPER]: 3,
  [UserRole.OPERATOR]: 4,
  [UserRole.SUPPLIER_ADMIN]: 4,
  [UserRole.ADMIN]: 5,
};

/**
 * Data scope for user permissions
 * Determines what data a user can access within their organization
 */
export enum DataScope {
  ALL = 'ALL',           // Full access to all organization data
  DEPARTMENT = 'DEPARTMENT', // Department-level access (future use)
  OWN = 'OWN',           // Only own created data
}

/**
 * Permission action types
 */
export enum PermissionAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  EXPORT = 'EXPORT',
}

/**
 * Permission resource types
 */
export enum PermissionResource {
  DEVICE = 'DEVICE',
  PASSPORT = 'PASSPORT',
  QC = 'QC',
  PACKAGE = 'PACKAGE',
  SHIPPING = 'SHIPPING',
  SERVICE_ORDER = 'SERVICE_ORDER',
  USER = 'USER',
  ORGANIZATION = 'ORGANIZATION',
}

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
  DEVICE_TAKEOVER = 'DEVICE_TAKEOVER',
  DEVICE_PHOTO = 'DEVICE_PHOTO',
  NAMEPLATE_PHOTO = 'NAMEPLATE_PHOTO',
  OTHER = 'OTHER',
}

/**
 * Supported currency codes
 */
export enum CurrencyCode {
  CNY = 'CNY',  // Chinese Yuan (default)
  USD = 'USD',  // US Dollar
  EUR = 'EUR',  // Euro
  VND = 'VND',  // Vietnamese Dong
  MYR = 'MYR',  // Malaysian Ringgit
  THB = 'THB',  // Thai Baht
  IDR = 'IDR',  // Indonesian Rupiah
  AED = 'AED',  // UAE Dirham
  SAR = 'SAR',  // Saudi Riyal
}

/**
 * Currency display names
 */
export const CURRENCY_NAMES: Record<CurrencyCode, { en: string; zh: string; symbol: string }> = {
  [CurrencyCode.CNY]: { en: 'Chinese Yuan', zh: '人民币', symbol: '¥' },
  [CurrencyCode.USD]: { en: 'US Dollar', zh: '美元', symbol: '$' },
  [CurrencyCode.EUR]: { en: 'Euro', zh: '欧元', symbol: '€' },
  [CurrencyCode.VND]: { en: 'Vietnamese Dong', zh: '越南盾', symbol: '₫' },
  [CurrencyCode.MYR]: { en: 'Malaysian Ringgit', zh: '马来西亚林吉特', symbol: 'RM' },
  [CurrencyCode.THB]: { en: 'Thai Baht', zh: '泰铢', symbol: '฿' },
  [CurrencyCode.IDR]: { en: 'Indonesian Rupiah', zh: '印尼盾', symbol: 'Rp' },
  [CurrencyCode.AED]: { en: 'UAE Dirham', zh: '阿联酋迪拉姆', symbol: 'د.إ' },
  [CurrencyCode.SAR]: { en: 'Saudi Riyal', zh: '沙特里亚尔', symbol: '﷼' },
};

/**
 * Default currency
 */
export const DEFAULT_CURRENCY = CurrencyCode.CNY;

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
export const SERVICE_URGENCY_NAMES: Record<ServiceUrgency, { en: string; zh: string }> = {
  [ServiceUrgency.LOW]: { en: 'Low', zh: '低' },
  [ServiceUrgency.NORMAL]: { en: 'Normal', zh: '普通' },
  [ServiceUrgency.HIGH]: { en: 'High', zh: '高' },
  [ServiceUrgency.URGENT]: { en: 'Urgent', zh: '紧急' },
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

// ============================================
// Expert Rating System Enums
// ============================================

/**
 * Expert service record status
 */
export enum ServiceRecordStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
}

/**
 * Service record status display names
 */
export const SERVICE_RECORD_STATUS_NAMES: Record<ServiceRecordStatus, string> = {
  [ServiceRecordStatus.PENDING]: 'Pending',
  [ServiceRecordStatus.IN_PROGRESS]: 'In Progress',
  [ServiceRecordStatus.COMPLETED]: 'Completed',
  [ServiceRecordStatus.CANCELLED]: 'Cancelled',
  [ServiceRecordStatus.DISPUTED]: 'Disputed',
};

/**
 * Expert review status
 */
export enum ReviewStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  HIDDEN = 'HIDDEN',
  FLAGGED = 'FLAGGED',
}

/**
 * Review status display names
 */
export const REVIEW_STATUS_NAMES: Record<ReviewStatus, string> = {
  [ReviewStatus.PENDING]: 'Pending',
  [ReviewStatus.PUBLISHED]: 'Published',
  [ReviewStatus.HIDDEN]: 'Hidden',
  [ReviewStatus.FLAGGED]: 'Flagged',
};

// ============================================
// Expert Passport Code System Enums
// ============================================

/**
 * Expert type code for passport generation
 * T = Technical, B = Business, A = All (both)
 */
export enum ExpertTypeCode {
  T = 'T', // Technical
  B = 'B', // Business
  A = 'A', // All (Technical + Business)
}

/**
 * Expert type code display names
 */
export const EXPERT_TYPE_CODE_NAMES: Record<ExpertTypeCode, { en: string; zh: string }> = {
  [ExpertTypeCode.T]: { en: 'Technical', zh: '技术类' },
  [ExpertTypeCode.B]: { en: 'Business', zh: '商务类' },
  [ExpertTypeCode.A]: { en: 'All (Technical + Business)', zh: '综合类（技术+商务）' },
};

/**
 * Industry code for expert passport
 * 20 industry codes representing major industrial sectors
 */
export enum IndustryCode {
  A = 'A', // Automotive
  B = 'B', // Building & Construction
  C = 'C', // Chemical
  D = 'D', // Pharmaceutical (Drug)
  E = 'E', // Electronics
  F = 'F', // Food & Beverage
  G = 'G', // General Manufacturing
  H = 'H', // Home Appliances
  L = 'L', // Logistics
  M = 'M', // Metallurgy
  N = 'N', // New Energy
  O = 'O', // Oil & Gas
  P = 'P', // Packaging
  R = 'R', // Rubber & Plastics
  S = 'S', // Shipbuilding
  T = 'T', // Textile
  U = 'U', // Utilities
  W = 'W', // Woodworking
  X = 'X', // Mining (Extraction)
  Z = 'Z', // Other
}

/**
 * Industry code display names (English)
 */
export const INDUSTRY_CODE_NAMES_EN: Record<IndustryCode, string> = {
  [IndustryCode.A]: 'Automotive',
  [IndustryCode.B]: 'Building & Construction',
  [IndustryCode.C]: 'Chemical',
  [IndustryCode.D]: 'Pharmaceutical',
  [IndustryCode.E]: 'Electronics',
  [IndustryCode.F]: 'Food & Beverage',
  [IndustryCode.G]: 'General Manufacturing',
  [IndustryCode.H]: 'Home Appliances',
  [IndustryCode.L]: 'Logistics',
  [IndustryCode.M]: 'Metallurgy',
  [IndustryCode.N]: 'New Energy',
  [IndustryCode.O]: 'Oil & Gas',
  [IndustryCode.P]: 'Packaging',
  [IndustryCode.R]: 'Rubber & Plastics',
  [IndustryCode.S]: 'Shipbuilding',
  [IndustryCode.T]: 'Textile',
  [IndustryCode.U]: 'Utilities',
  [IndustryCode.W]: 'Woodworking',
  [IndustryCode.X]: 'Mining',
  [IndustryCode.Z]: 'Other',
};

/**
 * Industry code display names (Chinese)
 */
export const INDUSTRY_CODE_NAMES_ZH: Record<IndustryCode, string> = {
  [IndustryCode.A]: '汽车制造',
  [IndustryCode.B]: '建筑工程',
  [IndustryCode.C]: '化工',
  [IndustryCode.D]: '制药',
  [IndustryCode.E]: '电子',
  [IndustryCode.F]: '食品饮料',
  [IndustryCode.G]: '通用制造',
  [IndustryCode.H]: '家电',
  [IndustryCode.L]: '物流',
  [IndustryCode.M]: '冶金',
  [IndustryCode.N]: '新能源',
  [IndustryCode.O]: '石油天然气',
  [IndustryCode.P]: '包装',
  [IndustryCode.R]: '橡塑',
  [IndustryCode.S]: '船舶制造',
  [IndustryCode.T]: '纺织',
  [IndustryCode.U]: '公用事业',
  [IndustryCode.W]: '木工',
  [IndustryCode.X]: '矿业',
  [IndustryCode.Z]: '其他',
};

/**
 * Industry code display names (bilingual)
 */
export const INDUSTRY_CODE_NAMES: Record<IndustryCode, { en: string; zh: string }> = {
  [IndustryCode.A]: { en: 'Automotive', zh: '汽车制造' },
  [IndustryCode.B]: { en: 'Building & Construction', zh: '建筑工程' },
  [IndustryCode.C]: { en: 'Chemical', zh: '化工' },
  [IndustryCode.D]: { en: 'Pharmaceutical', zh: '制药' },
  [IndustryCode.E]: { en: 'Electronics', zh: '电子' },
  [IndustryCode.F]: { en: 'Food & Beverage', zh: '食品饮料' },
  [IndustryCode.G]: { en: 'General Manufacturing', zh: '通用制造' },
  [IndustryCode.H]: { en: 'Home Appliances', zh: '家电' },
  [IndustryCode.L]: { en: 'Logistics', zh: '物流' },
  [IndustryCode.M]: { en: 'Metallurgy', zh: '冶金' },
  [IndustryCode.N]: { en: 'New Energy', zh: '新能源' },
  [IndustryCode.O]: { en: 'Oil & Gas', zh: '石油天然气' },
  [IndustryCode.P]: { en: 'Packaging', zh: '包装' },
  [IndustryCode.R]: { en: 'Rubber & Plastics', zh: '橡塑' },
  [IndustryCode.S]: { en: 'Shipbuilding', zh: '船舶制造' },
  [IndustryCode.T]: { en: 'Textile', zh: '纺织' },
  [IndustryCode.U]: { en: 'Utilities', zh: '公用事业' },
  [IndustryCode.W]: { en: 'Woodworking', zh: '木工' },
  [IndustryCode.X]: { en: 'Mining', zh: '矿业' },
  [IndustryCode.Z]: { en: 'Other', zh: '其他' },
};

/**
 * Skill code for expert passport
 * 20 skill codes grouped into 5 categories
 */
export enum SkillCode {
  // Automation (6 skills)
  PL = 'PL', // PLC Programming
  HM = 'HM', // HMI Design
  RB = 'RB', // Robotics
  MC = 'MC', // Motion Control
  VS = 'VS', // Vision Systems
  IO = 'IO', // IoT/Industrial IoT

  // Electromechanical (6 skills)
  ED = 'ED', // Electrical Design
  EI = 'EI', // Electrical Installation
  MD = 'MD', // Mechanical Design
  MI = 'MI', // Mechanical Installation
  HD = 'HD', // Hydraulics
  WD = 'WD', // Welding

  // Instrumentation (3 skills)
  IS = 'IS', // Instrumentation
  NT = 'NT', // Networks
  SC = 'SC', // Safety Systems

  // Software (2 skills)
  SW = 'SW', // Software Development
  AI = 'AI', // AI/Machine Learning

  // Service (3 skills)
  MN = 'MN', // Maintenance
  CM = 'CM', // Commissioning
  PM = 'PM', // Project Management
}

/**
 * Skill code categories
 */
export enum SkillCategory {
  AUTOMATION = 'AUTOMATION',
  ELECTROMECHANICAL = 'ELECTROMECHANICAL',
  INSTRUMENTATION = 'INSTRUMENTATION',
  SOFTWARE = 'SOFTWARE',
  SERVICE = 'SERVICE',
}

/**
 * Skill category display names
 */
export const SKILL_CATEGORY_NAMES: Record<SkillCategory, { en: string; zh: string }> = {
  [SkillCategory.AUTOMATION]: { en: 'Automation', zh: '自动化' },
  [SkillCategory.ELECTROMECHANICAL]: { en: 'Electromechanical', zh: '机电' },
  [SkillCategory.INSTRUMENTATION]: { en: 'Instrumentation', zh: '仪器仪表' },
  [SkillCategory.SOFTWARE]: { en: 'Software', zh: '软件' },
  [SkillCategory.SERVICE]: { en: 'Service', zh: '服务' },
};

/**
 * Mapping of skill codes to their categories
 */
export const SKILL_CODE_CATEGORIES: Record<SkillCode, SkillCategory> = {
  // Automation
  [SkillCode.PL]: SkillCategory.AUTOMATION,
  [SkillCode.HM]: SkillCategory.AUTOMATION,
  [SkillCode.RB]: SkillCategory.AUTOMATION,
  [SkillCode.MC]: SkillCategory.AUTOMATION,
  [SkillCode.VS]: SkillCategory.AUTOMATION,
  [SkillCode.IO]: SkillCategory.AUTOMATION,

  // Electromechanical
  [SkillCode.ED]: SkillCategory.ELECTROMECHANICAL,
  [SkillCode.EI]: SkillCategory.ELECTROMECHANICAL,
  [SkillCode.MD]: SkillCategory.ELECTROMECHANICAL,
  [SkillCode.MI]: SkillCategory.ELECTROMECHANICAL,
  [SkillCode.HD]: SkillCategory.ELECTROMECHANICAL,
  [SkillCode.WD]: SkillCategory.ELECTROMECHANICAL,

  // Instrumentation
  [SkillCode.IS]: SkillCategory.INSTRUMENTATION,
  [SkillCode.NT]: SkillCategory.INSTRUMENTATION,
  [SkillCode.SC]: SkillCategory.INSTRUMENTATION,

  // Software
  [SkillCode.SW]: SkillCategory.SOFTWARE,
  [SkillCode.AI]: SkillCategory.SOFTWARE,

  // Service
  [SkillCode.MN]: SkillCategory.SERVICE,
  [SkillCode.CM]: SkillCategory.SERVICE,
  [SkillCode.PM]: SkillCategory.SERVICE,
};

/**
 * Skill code display names (English)
 */
export const SKILL_CODE_NAMES_EN: Record<SkillCode, string> = {
  // Automation
  [SkillCode.PL]: 'PLC Programming',
  [SkillCode.HM]: 'HMI Design',
  [SkillCode.RB]: 'Robotics',
  [SkillCode.MC]: 'Motion Control',
  [SkillCode.VS]: 'Vision Systems',
  [SkillCode.IO]: 'IoT',

  // Electromechanical
  [SkillCode.ED]: 'Electrical Design',
  [SkillCode.EI]: 'Electrical Installation',
  [SkillCode.MD]: 'Mechanical Design',
  [SkillCode.MI]: 'Mechanical Installation',
  [SkillCode.HD]: 'Hydraulics',
  [SkillCode.WD]: 'Welding',

  // Instrumentation
  [SkillCode.IS]: 'Instrumentation',
  [SkillCode.NT]: 'Networks',
  [SkillCode.SC]: 'Safety Systems',

  // Software
  [SkillCode.SW]: 'Software Development',
  [SkillCode.AI]: 'AI/Machine Learning',

  // Service
  [SkillCode.MN]: 'Maintenance',
  [SkillCode.CM]: 'Commissioning',
  [SkillCode.PM]: 'Project Management',
};

/**
 * Skill code display names (Chinese)
 */
export const SKILL_CODE_NAMES_ZH: Record<SkillCode, string> = {
  // Automation
  [SkillCode.PL]: 'PLC编程',
  [SkillCode.HM]: 'HMI设计',
  [SkillCode.RB]: '机器人',
  [SkillCode.MC]: '运动控制',
  [SkillCode.VS]: '视觉系统',
  [SkillCode.IO]: '物联网',

  // Electromechanical
  [SkillCode.ED]: '电气设计',
  [SkillCode.EI]: '电气安装',
  [SkillCode.MD]: '机械设计',
  [SkillCode.MI]: '机械安装',
  [SkillCode.HD]: '液压系统',
  [SkillCode.WD]: '焊接',

  // Instrumentation
  [SkillCode.IS]: '仪器仪表',
  [SkillCode.NT]: '网络通讯',
  [SkillCode.SC]: '安全系统',

  // Software
  [SkillCode.SW]: '软件开发',
  [SkillCode.AI]: 'AI/机器学习',

  // Service
  [SkillCode.MN]: '维护保养',
  [SkillCode.CM]: '调试',
  [SkillCode.PM]: '项目管理',
};

/**
 * Skill code display names (bilingual)
 */
export const SKILL_CODE_NAMES: Record<SkillCode, { en: string; zh: string }> = {
  // Automation
  [SkillCode.PL]: { en: 'PLC Programming', zh: 'PLC编程' },
  [SkillCode.HM]: { en: 'HMI Design', zh: 'HMI设计' },
  [SkillCode.RB]: { en: 'Robotics', zh: '机器人' },
  [SkillCode.MC]: { en: 'Motion Control', zh: '运动控制' },
  [SkillCode.VS]: { en: 'Vision Systems', zh: '视觉系统' },
  [SkillCode.IO]: { en: 'IoT', zh: '物联网' },

  // Electromechanical
  [SkillCode.ED]: { en: 'Electrical Design', zh: '电气设计' },
  [SkillCode.EI]: { en: 'Electrical Installation', zh: '电气安装' },
  [SkillCode.MD]: { en: 'Mechanical Design', zh: '机械设计' },
  [SkillCode.MI]: { en: 'Mechanical Installation', zh: '机械安装' },
  [SkillCode.HD]: { en: 'Hydraulics', zh: '液压系统' },
  [SkillCode.WD]: { en: 'Welding', zh: '焊接' },

  // Instrumentation
  [SkillCode.IS]: { en: 'Instrumentation', zh: '仪器仪表' },
  [SkillCode.NT]: { en: 'Networks', zh: '网络通讯' },
  [SkillCode.SC]: { en: 'Safety Systems', zh: '安全系统' },

  // Software
  [SkillCode.SW]: { en: 'Software Development', zh: '软件开发' },
  [SkillCode.AI]: { en: 'AI/Machine Learning', zh: 'AI/机器学习' },

  // Service
  [SkillCode.MN]: { en: 'Maintenance', zh: '维护保养' },
  [SkillCode.CM]: { en: 'Commissioning', zh: '调试' },
  [SkillCode.PM]: { en: 'Project Management', zh: '项目管理' },
};

/**
 * Work history verification status for expert credentials
 */
export enum WorkHistoryVerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

/**
 * Work history verification status display names
 */
export const WORK_HISTORY_VERIFICATION_STATUS_NAMES: Record<WorkHistoryVerificationStatus, { en: string; zh: string }> = {
  [WorkHistoryVerificationStatus.UNVERIFIED]: { en: 'Unverified', zh: '未验证' },
  [WorkHistoryVerificationStatus.PENDING_VERIFICATION]: { en: 'Pending Verification', zh: '验证中' },
  [WorkHistoryVerificationStatus.VERIFIED]: { en: 'Verified', zh: '已验证' },
  [WorkHistoryVerificationStatus.REJECTED]: { en: 'Rejected', zh: '已拒绝' },
};

// ============================================
// Expert Work Status & Membership Enums
// ============================================

/**
 * Expert work status for service matching
 */
export enum ExpertWorkStatus {
  RUSHING = 'RUSHING',       // 抢单中 - 急需订单，优先分配
  IDLE = 'IDLE',             // 空闲 - 一般等待分配
  BOOKED = 'BOOKED',         // 预定中 - 已分配订单，但当前空闲
  IN_SERVICE = 'IN_SERVICE', // 服务中 - 已出发或正在服务
  OFF_DUTY = 'OFF_DUTY',     // 休息中 - 暂不接单
}

/**
 * Expert work status display names
 */
export const EXPERT_WORK_STATUS_NAMES: Record<ExpertWorkStatus, { en: string; zh: string }> = {
  [ExpertWorkStatus.RUSHING]: { en: 'Rushing', zh: '抢单中' },
  [ExpertWorkStatus.IDLE]: { en: 'Idle', zh: '空闲' },
  [ExpertWorkStatus.BOOKED]: { en: 'Booked', zh: '预定中' },
  [ExpertWorkStatus.IN_SERVICE]: { en: 'In Service', zh: '服务中' },
  [ExpertWorkStatus.OFF_DUTY]: { en: 'Off Duty', zh: '休息中' },
};

/**
 * Expert membership level
 */
export enum ExpertMembershipLevel {
  STANDARD = 'STANDARD',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  DIAMOND = 'DIAMOND',
}

/**
 * Expert membership level display names
 */
export const EXPERT_MEMBERSHIP_LEVEL_NAMES: Record<ExpertMembershipLevel, { en: string; zh: string }> = {
  [ExpertMembershipLevel.STANDARD]: { en: 'Standard', zh: '标准版' },
  [ExpertMembershipLevel.SILVER]: { en: 'Silver', zh: '银牌会员' },
  [ExpertMembershipLevel.GOLD]: { en: 'Gold', zh: '金牌会员' },
  [ExpertMembershipLevel.DIAMOND]: { en: 'Diamond', zh: '钻石会员' },
};

// ============================================
// Service Request Category Enums
// ============================================

/**
 * Service request primary category (Level 1)
 */
export enum ServicePrimaryCategory {
  DEVICE = 'DEVICE',       // 设备服务
  LABOR = 'LABOR',         // 劳务服务
  CONSULTING = 'CONSULTING', // 咨询培训
}

/**
 * Primary category display names
 */
export const SERVICE_PRIMARY_CATEGORY_NAMES: Record<ServicePrimaryCategory, { en: string; zh: string; icon: string }> = {
  [ServicePrimaryCategory.DEVICE]: { en: 'Device Service', zh: '设备服务', icon: '🔧' },
  [ServicePrimaryCategory.LABOR]: { en: 'Labor Service', zh: '劳务服务', icon: '👷' },
  [ServicePrimaryCategory.CONSULTING]: { en: 'Consulting & Training', zh: '咨询培训', icon: '💼' },
};

/**
 * Service request sub-category (Level 2)
 */
export enum ServiceRequestCategory {
  // Device-related services (Primary: DEVICE)
  DEVICE_REPAIR = 'DEVICE_REPAIR',           // 故障维修
  DEVICE_MAINTENANCE = 'DEVICE_MAINTENANCE', // 定期保养
  DEVICE_INSTALLATION = 'DEVICE_INSTALLATION', // 设备安装
  DEVICE_INSPECTION = 'DEVICE_INSPECTION',   // 检测检验
  DEVICE_TAKEOVER = 'DEVICE_TAKEOVER',       // 设备接管/绑定旧设备

  // Labor services (Primary: LABOR)
  LABOR_ELECTRICAL = 'LABOR_ELECTRICAL',     // 电气工程
  LABOR_MECHANICAL = 'LABOR_MECHANICAL',     // 机械工程
  LABOR_PLUMBING = 'LABOR_PLUMBING',         // 管道工程
  LABOR_GENERAL = 'LABOR_GENERAL',           // 综合劳务

  // Consulting services (Primary: CONSULTING)
  CONSULTING_TECHNICAL = 'CONSULTING_TECHNICAL', // 技术咨询
  CONSULTING_TRAINING = 'CONSULTING_TRAINING',   // 操作培训
  CONSULTING_CERTIFICATION = 'CONSULTING_CERTIFICATION', // 认证辅导
}

/**
 * Mapping from sub-category to primary category
 */
export const CATEGORY_TO_PRIMARY: Record<ServiceRequestCategory, ServicePrimaryCategory> = {
  [ServiceRequestCategory.DEVICE_REPAIR]: ServicePrimaryCategory.DEVICE,
  [ServiceRequestCategory.DEVICE_MAINTENANCE]: ServicePrimaryCategory.DEVICE,
  [ServiceRequestCategory.DEVICE_INSTALLATION]: ServicePrimaryCategory.DEVICE,
  [ServiceRequestCategory.DEVICE_INSPECTION]: ServicePrimaryCategory.DEVICE,
  [ServiceRequestCategory.DEVICE_TAKEOVER]: ServicePrimaryCategory.DEVICE,
  [ServiceRequestCategory.LABOR_ELECTRICAL]: ServicePrimaryCategory.LABOR,
  [ServiceRequestCategory.LABOR_MECHANICAL]: ServicePrimaryCategory.LABOR,
  [ServiceRequestCategory.LABOR_PLUMBING]: ServicePrimaryCategory.LABOR,
  [ServiceRequestCategory.LABOR_GENERAL]: ServicePrimaryCategory.LABOR,
  [ServiceRequestCategory.CONSULTING_TECHNICAL]: ServicePrimaryCategory.CONSULTING,
  [ServiceRequestCategory.CONSULTING_TRAINING]: ServicePrimaryCategory.CONSULTING,
  [ServiceRequestCategory.CONSULTING_CERTIFICATION]: ServicePrimaryCategory.CONSULTING,
};

/**
 * Get sub-categories for a primary category
 */
export const PRIMARY_TO_CATEGORIES: Record<ServicePrimaryCategory, ServiceRequestCategory[]> = {
  [ServicePrimaryCategory.DEVICE]: [
    ServiceRequestCategory.DEVICE_REPAIR,
    ServiceRequestCategory.DEVICE_MAINTENANCE,
    ServiceRequestCategory.DEVICE_INSTALLATION,
    ServiceRequestCategory.DEVICE_INSPECTION,
    ServiceRequestCategory.DEVICE_TAKEOVER,
  ],
  [ServicePrimaryCategory.LABOR]: [
    ServiceRequestCategory.LABOR_ELECTRICAL,
    ServiceRequestCategory.LABOR_MECHANICAL,
    ServiceRequestCategory.LABOR_PLUMBING,
    ServiceRequestCategory.LABOR_GENERAL,
  ],
  [ServicePrimaryCategory.CONSULTING]: [
    ServiceRequestCategory.CONSULTING_TECHNICAL,
    ServiceRequestCategory.CONSULTING_TRAINING,
    ServiceRequestCategory.CONSULTING_CERTIFICATION,
  ],
};

/**
 * Service request category display names
 */
export const SERVICE_REQUEST_CATEGORY_NAMES: Record<ServiceRequestCategory, { en: string; zh: string }> = {
  [ServiceRequestCategory.DEVICE_REPAIR]: { en: 'Fault Repair', zh: '故障维修' },
  [ServiceRequestCategory.DEVICE_MAINTENANCE]: { en: 'Regular Maintenance', zh: '定期保养' },
  [ServiceRequestCategory.DEVICE_INSTALLATION]: { en: 'Device Installation', zh: '设备安装' },
  [ServiceRequestCategory.DEVICE_INSPECTION]: { en: 'Inspection & Testing', zh: '检测检验' },
  [ServiceRequestCategory.DEVICE_TAKEOVER]: { en: 'Device Registration', zh: '设备绑定' },
  [ServiceRequestCategory.LABOR_ELECTRICAL]: { en: 'Electrical Engineering', zh: '电气工程' },
  [ServiceRequestCategory.LABOR_MECHANICAL]: { en: 'Mechanical Engineering', zh: '机械工程' },
  [ServiceRequestCategory.LABOR_PLUMBING]: { en: 'Plumbing Engineering', zh: '管道工程' },
  [ServiceRequestCategory.LABOR_GENERAL]: { en: 'General Labor', zh: '综合劳务' },
  [ServiceRequestCategory.CONSULTING_TECHNICAL]: { en: 'Technical Consulting', zh: '技术咨询' },
  [ServiceRequestCategory.CONSULTING_TRAINING]: { en: 'Operation Training', zh: '操作培训' },
  [ServiceRequestCategory.CONSULTING_CERTIFICATION]: { en: 'Certification Support', zh: '认证辅导' },
};

/**
 * Categories that require device passport (recommended)
 */
export const DEVICE_REQUIRED_CATEGORIES = [
  ServiceRequestCategory.DEVICE_REPAIR,
  ServiceRequestCategory.DEVICE_MAINTENANCE,
  ServiceRequestCategory.DEVICE_INSPECTION,
];

/**
 * Categories that can generate new passport
 */
export const PASSPORT_GENERATABLE_CATEGORIES = [
  ServiceRequestCategory.DEVICE_TAKEOVER,
  ServiceRequestCategory.DEVICE_INSTALLATION,
];

/**
 * Common issue types for device services (predefined options)
 */
export enum CommonIssueType {
  // Repair issues
  CANNOT_START = 'CANNOT_START',           // 设备无法启动
  UNEXPECTED_STOP = 'UNEXPECTED_STOP',     // 运行中异常停机
  PRECISION_DROP = 'PRECISION_DROP',       // 精度下降/误差增大
  ABNORMAL_SOUND = 'ABNORMAL_SOUND',       // 异响/振动异常
  ALARM_CODE = 'ALARM_CODE',               // 报警/故障代码
  OVERHEATING = 'OVERHEATING',             // 过热
  LEAKAGE = 'LEAKAGE',                     // 泄漏

  // Maintenance types
  FIRST_MAINTENANCE = 'FIRST_MAINTENANCE', // 首次保养
  REGULAR_MAINTENANCE = 'REGULAR_MAINTENANCE', // 定期例行保养
  DEEP_MAINTENANCE = 'DEEP_MAINTENANCE',   // 深度保养/大修

  // Installation types
  NEW_INSTALL = 'NEW_INSTALL',             // 新设备开箱安装
  RELOCATION = 'RELOCATION',               // 设备移机安装
  UPGRADE_INSTALL = 'UPGRADE_INSTALL',     // 升级改造安装

  OTHER = 'OTHER',                         // 其他
}

/**
 * Common issue display names
 */
export const COMMON_ISSUE_NAMES: Record<CommonIssueType, { en: string; zh: string }> = {
  [CommonIssueType.CANNOT_START]: { en: 'Cannot Start', zh: '设备无法启动' },
  [CommonIssueType.UNEXPECTED_STOP]: { en: 'Unexpected Stop', zh: '运行中异常停机' },
  [CommonIssueType.PRECISION_DROP]: { en: 'Precision Drop', zh: '精度下降/误差增大' },
  [CommonIssueType.ABNORMAL_SOUND]: { en: 'Abnormal Sound/Vibration', zh: '异响/振动异常' },
  [CommonIssueType.ALARM_CODE]: { en: 'Alarm/Error Code', zh: '报警/故障代码' },
  [CommonIssueType.OVERHEATING]: { en: 'Overheating', zh: '过热' },
  [CommonIssueType.LEAKAGE]: { en: 'Leakage', zh: '泄漏' },
  [CommonIssueType.FIRST_MAINTENANCE]: { en: 'First Maintenance', zh: '首次保养' },
  [CommonIssueType.REGULAR_MAINTENANCE]: { en: 'Regular Maintenance', zh: '定期例行保养' },
  [CommonIssueType.DEEP_MAINTENANCE]: { en: 'Deep Maintenance', zh: '深度保养/大修' },
  [CommonIssueType.NEW_INSTALL]: { en: 'New Installation', zh: '新设备开箱安装' },
  [CommonIssueType.RELOCATION]: { en: 'Relocation', zh: '设备移机安装' },
  [CommonIssueType.UPGRADE_INSTALL]: { en: 'Upgrade Installation', zh: '升级改造安装' },
  [CommonIssueType.OTHER]: { en: 'Other', zh: '其他' },
};

/**
 * Issues applicable to each category
 */
export const CATEGORY_ISSUES: Record<ServiceRequestCategory, CommonIssueType[]> = {
  [ServiceRequestCategory.DEVICE_REPAIR]: [
    CommonIssueType.CANNOT_START,
    CommonIssueType.UNEXPECTED_STOP,
    CommonIssueType.PRECISION_DROP,
    CommonIssueType.ABNORMAL_SOUND,
    CommonIssueType.ALARM_CODE,
    CommonIssueType.OVERHEATING,
    CommonIssueType.LEAKAGE,
    CommonIssueType.OTHER,
  ],
  [ServiceRequestCategory.DEVICE_MAINTENANCE]: [
    CommonIssueType.FIRST_MAINTENANCE,
    CommonIssueType.REGULAR_MAINTENANCE,
    CommonIssueType.DEEP_MAINTENANCE,
    CommonIssueType.OTHER,
  ],
  [ServiceRequestCategory.DEVICE_INSTALLATION]: [
    CommonIssueType.NEW_INSTALL,
    CommonIssueType.RELOCATION,
    CommonIssueType.UPGRADE_INSTALL,
    CommonIssueType.OTHER,
  ],
  [ServiceRequestCategory.DEVICE_INSPECTION]: [CommonIssueType.OTHER],
  [ServiceRequestCategory.DEVICE_TAKEOVER]: [CommonIssueType.OTHER],
  [ServiceRequestCategory.LABOR_ELECTRICAL]: [CommonIssueType.OTHER],
  [ServiceRequestCategory.LABOR_MECHANICAL]: [CommonIssueType.OTHER],
  [ServiceRequestCategory.LABOR_PLUMBING]: [CommonIssueType.OTHER],
  [ServiceRequestCategory.LABOR_GENERAL]: [CommonIssueType.OTHER],
  [ServiceRequestCategory.CONSULTING_TECHNICAL]: [CommonIssueType.OTHER],
  [ServiceRequestCategory.CONSULTING_TRAINING]: [CommonIssueType.OTHER],
  [ServiceRequestCategory.CONSULTING_CERTIFICATION]: [CommonIssueType.OTHER],
};

/**
 * Preferred time options
 */
export enum PreferredTimeOption {
  ASAP = 'ASAP',           // 尽快
  THIS_WEEK = 'THIS_WEEK', // 本周内
  NEXT_WEEK = 'NEXT_WEEK', // 下周
  FLEXIBLE = 'FLEXIBLE',   // 灵活
  SPECIFIC = 'SPECIFIC',   // 指定日期
}

/**
 * Preferred time option display names
 */
export const PREFERRED_TIME_NAMES: Record<PreferredTimeOption, { en: string; zh: string }> = {
  [PreferredTimeOption.ASAP]: { en: 'ASAP', zh: '尽快' },
  [PreferredTimeOption.THIS_WEEK]: { en: 'This Week', zh: '本周内' },
  [PreferredTimeOption.NEXT_WEEK]: { en: 'Next Week', zh: '下周' },
  [PreferredTimeOption.FLEXIBLE]: { en: 'Flexible', zh: '灵活' },
  [PreferredTimeOption.SPECIFIC]: { en: 'Specific Date', zh: '指定日期' },
};

/**
 * Budget range options (in CNY)
 */
export enum BudgetRangeOption {
  NO_LIMIT = 'NO_LIMIT',   // 不限
  UNDER_500 = 'UNDER_500', // <500
  RANGE_500_2000 = 'RANGE_500_2000', // 500-2000
  RANGE_2000_5000 = 'RANGE_2000_5000', // 2000-5000
  OVER_5000 = 'OVER_5000', // >5000
  CUSTOM = 'CUSTOM',       // 自定义
}

/**
 * Budget range option display names
 */
export const BUDGET_RANGE_NAMES: Record<BudgetRangeOption, { en: string; zh: string }> = {
  [BudgetRangeOption.NO_LIMIT]: { en: 'No Limit', zh: '不限' },
  [BudgetRangeOption.UNDER_500]: { en: 'Under 500', zh: '500以下' },
  [BudgetRangeOption.RANGE_500_2000]: { en: '500 - 2,000', zh: '500-2000' },
  [BudgetRangeOption.RANGE_2000_5000]: { en: '2,000 - 5,000', zh: '2000-5000' },
  [BudgetRangeOption.OVER_5000]: { en: 'Over 5,000', zh: '5000以上' },
  [BudgetRangeOption.CUSTOM]: { en: 'Custom', zh: '自定义' },
};

// ============================================
// Device Takeover Enums
// ============================================

/**
 * Reason for device takeover
 */
export enum TakeoverReason {
  NEW_PURCHASE = 'NEW_PURCHASE',           // 新购设备
  TRANSFER = 'TRANSFER',                   // 设备转让
  NO_SUPPORT = 'NO_SUPPORT',               // 原厂商不再支持
  SYSTEM_MIGRATION = 'SYSTEM_MIGRATION',   // 系统迁移
  OTHER = 'OTHER',
}

/**
 * Takeover reason display names
 */
export const TAKEOVER_REASON_NAMES: Record<TakeoverReason, { en: string; zh: string }> = {
  [TakeoverReason.NEW_PURCHASE]: { en: 'New Purchase', zh: '新购设备' },
  [TakeoverReason.TRANSFER]: { en: 'Device Transfer', zh: '设备转让' },
  [TakeoverReason.NO_SUPPORT]: { en: 'No Vendor Support', zh: '原厂商不再支持' },
  [TakeoverReason.SYSTEM_MIGRATION]: { en: 'System Migration', zh: '系统迁移' },
  [TakeoverReason.OTHER]: { en: 'Other', zh: '其他' },
};

/**
 * Takeover request status
 */
export enum TakeoverStatus {
  PENDING = 'PENDING',         // 待处理
  INSPECTING = 'INSPECTING',   // 验机中
  REVIEWING = 'REVIEWING',     // 审核中
  APPROVED = 'APPROVED',       // 已批准
  REJECTED = 'REJECTED',       // 已拒绝
}

/**
 * Takeover status display names
 */
export const TAKEOVER_STATUS_NAMES: Record<TakeoverStatus, { en: string; zh: string }> = {
  [TakeoverStatus.PENDING]: { en: 'Pending', zh: '待处理' },
  [TakeoverStatus.INSPECTING]: { en: 'Inspecting', zh: '验机中' },
  [TakeoverStatus.REVIEWING]: { en: 'Reviewing', zh: '审核中' },
  [TakeoverStatus.APPROVED]: { en: 'Approved', zh: '已批准' },
  [TakeoverStatus.REJECTED]: { en: 'Rejected', zh: '已拒绝' },
};

// ============================================
// Maintenance Type Enums
// ============================================

/**
 * Maintenance type for service records
 */
export enum MaintenanceType {
  PREVENTIVE = 'PREVENTIVE',   // 预防性维护 (定期保养)
  CORRECTIVE = 'CORRECTIVE',   // 纠正性维护 (故障维修)
  EMERGENCY = 'EMERGENCY',     // 紧急维护 (突发故障)
  UPGRADE = 'UPGRADE',         // 升级改造
  INSPECTION = 'INSPECTION',   // 检测检验
}

/**
 * Maintenance type display names
 */
export const MAINTENANCE_TYPE_NAMES: Record<MaintenanceType, { en: string; zh: string }> = {
  [MaintenanceType.PREVENTIVE]: { en: 'Preventive', zh: '预防性维护' },
  [MaintenanceType.CORRECTIVE]: { en: 'Corrective', zh: '纠正性维护' },
  [MaintenanceType.EMERGENCY]: { en: 'Emergency', zh: '紧急维护' },
  [MaintenanceType.UPGRADE]: { en: 'Upgrade', zh: '升级改造' },
  [MaintenanceType.INSPECTION]: { en: 'Inspection', zh: '检测检验' },
};

// ============================================
// Points & Credit System Enums
// ============================================

/**
 * Point transaction type
 */
export enum PointType {
  REWARD = 'REWARD',     // 奖励积分 (可用于兑换)
  CREDIT = 'CREDIT',     // 信用分 (影响排名和权益)
  PENALTY = 'PENALTY',   // 惩罚扣分
}

/**
 * Point type display names
 */
export const POINT_TYPE_NAMES: Record<PointType, { en: string; zh: string }> = {
  [PointType.REWARD]: { en: 'Reward', zh: '奖励积分' },
  [PointType.CREDIT]: { en: 'Credit', zh: '信用分' },
  [PointType.PENALTY]: { en: 'Penalty', zh: '惩罚扣分' },
};

/**
 * User credit level based on credit score
 */
export enum CreditLevel {
  BRONZE = 'BRONZE',     // 青铜: 0-199
  SILVER = 'SILVER',     // 白银: 200-499
  GOLD = 'GOLD',         // 黄金: 500-999
  PLATINUM = 'PLATINUM', // 铂金: 1000-1999
  DIAMOND = 'DIAMOND',   // 钻石: 2000+
}

/**
 * Credit level display names
 */
export const CREDIT_LEVEL_NAMES: Record<CreditLevel, { en: string; zh: string }> = {
  [CreditLevel.BRONZE]: { en: 'Bronze', zh: '青铜' },
  [CreditLevel.SILVER]: { en: 'Silver', zh: '白银' },
  [CreditLevel.GOLD]: { en: 'Gold', zh: '黄金' },
  [CreditLevel.PLATINUM]: { en: 'Platinum', zh: '铂金' },
  [CreditLevel.DIAMOND]: { en: 'Diamond', zh: '钻石' },
};

/**
 * Credit level thresholds
 */
export const CREDIT_LEVEL_THRESHOLDS: Record<CreditLevel, { min: number; max: number }> = {
  [CreditLevel.BRONZE]: { min: 0, max: 199 },
  [CreditLevel.SILVER]: { min: 200, max: 499 },
  [CreditLevel.GOLD]: { min: 500, max: 999 },
  [CreditLevel.PLATINUM]: { min: 1000, max: 1999 },
  [CreditLevel.DIAMOND]: { min: 2000, max: Infinity },
};

/**
 * Get credit level from score
 */
export function getCreditLevelFromScore(score: number): CreditLevel {
  if (score >= 2000) return CreditLevel.DIAMOND;
  if (score >= 1000) return CreditLevel.PLATINUM;
  if (score >= 500) return CreditLevel.GOLD;
  if (score >= 200) return CreditLevel.SILVER;
  return CreditLevel.BRONZE;
}

/**
 * Point action codes for rules configuration
 */
export enum PointActionCode {
  // Reward actions
  PUBLISH_SERVICE = 'PUBLISH_SERVICE',           // 发布服务请求 +10
  FIRST_PUBLISH = 'FIRST_PUBLISH',               // 首次发布服务 +50
  SERVICE_MATCHED = 'SERVICE_MATCHED',           // 服务请求被成功匹配 +20
  SERVICE_COMPLETED = 'SERVICE_COMPLETED',       // 专家完成服务 +30
  FIVE_STAR_REVIEW = 'FIVE_STAR_REVIEW',         // 获得5星好评 +50
  ON_TIME_COMPLETION = 'ON_TIME_COMPLETION',     // 按时完成服务 +10
  CUSTOMER_CONFIRMED = 'CUSTOMER_CONFIRMED',     // 客户确认完成 +15
  CUSTOMER_REVIEWED = 'CUSTOMER_REVIEWED',       // 客户给出评价 +10
  INVITE_REGISTER = 'INVITE_REGISTER',           // 邀请新用户注册 +100
  INVITEE_FIRST_ORDER = 'INVITEE_FIRST_ORDER',   // 被邀请人首次交易 +200
  DEVICE_TAKEOVER = 'DEVICE_TAKEOVER',           // 成功接管设备 +50
  DEVICE_INSPECTION = 'DEVICE_INSPECTION',       // 专家完成验机 +30
  DAILY_LOGIN_STREAK_7 = 'DAILY_LOGIN_STREAK_7', // 连续7天登录 +20
  DAILY_LOGIN_STREAK_30 = 'DAILY_LOGIN_STREAK_30', // 连续30天活跃 +100
  IDENTITY_VERIFIED = 'IDENTITY_VERIFIED',       // 完成实名认证 +100
  CERTIFICATE_UPLOADED = 'CERTIFICATE_UPLOADED', // 上传证书 +30

  // Penalty actions
  CANCEL_ORDER_EXPERT = 'CANCEL_ORDER_EXPERT',   // 专家无故取消订单 -50
  CANCEL_ORDER_CUSTOMER = 'CANCEL_ORDER_CUSTOMER', // 客户无故取消已接单服务 -30
  SERVICE_TIMEOUT = 'SERVICE_TIMEOUT',           // 服务超时未完成 -20
  SERVICE_SEVERE_TIMEOUT = 'SERVICE_SEVERE_TIMEOUT', // 严重超时 -50
  VALID_COMPLAINT = 'VALID_COMPLAINT',           // 收到有效投诉 -30
  COMPLAINT_ESCALATED = 'COMPLAINT_ESCALATED',   // 投诉升级处理 -80
  MALICIOUS_COMPLAINT = 'MALICIOUS_COMPLAINT',   // 恶意投诉他人 -100
  ONE_STAR_REVIEW = 'ONE_STAR_REVIEW',           // 收到1星差评 -20
  FAKE_REVIEW = 'FAKE_REVIEW',                   // 虚假评价 -100
  HARASSMENT = 'HARASSMENT',                     // 辱骂/骚扰他人 -100
  ORDER_FRAUD = 'ORDER_FRAUD',                   // 恶意刷单 -200
  FRAUD = 'FRAUD',                               // 欺诈行为 -500
  FAKE_PROFILE = 'FAKE_PROFILE',                 // 虚假资料 -100
  NO_SHOW = 'NO_SHOW',                           // 预约后失约 -40
}
