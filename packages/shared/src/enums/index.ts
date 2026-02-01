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
