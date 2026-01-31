import { DeviceStatus, ProductLine, OriginCode } from '../enums';

/**
 * Device passport code structure
 * Format: DP-{COMPANY}-{YYMM}-{PRODUCT_TYPE}-{ORIGIN}-{SEQUENCE}-{CHECKSUM}
 * Example: DP-MED-2601-PKG-CN-000001-A7
 * YYMM = Year (last 2 digits) + Month (2 digits), e.g., 2601 for Jan 2026
 */
export interface PassportCodeParts {
  prefix: 'DP';
  companyCode: string;
  yearMonth: string; // Format: YYMM (e.g., "2601" for Jan 2026)
  productType: ProductLine;
  originCode: OriginCode;
  sequence: number;
  checksum: string;
}

/**
 * Device passport base interface
 */
export interface DevicePassport {
  id: string;
  passportCode: string;
  productLine: ProductLine;
  originCode: OriginCode;
  status: DeviceStatus;

  // Device information
  deviceName: string;
  deviceModel: string;
  manufacturer: string;
  manufacturerPartNumber?: string;
  serialNumber?: string;

  // Specifications (flexible JSON)
  specifications?: Record<string, unknown>;

  // Dates
  manufactureDate?: Date;
  warrantyExpiryDate?: Date;

  // Organization references
  supplierId?: string;
  customerId?: string;

  // Current location
  currentLocation?: string;

  // Blockchain preparation
  blockchainHash?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * Create device passport DTO
 */
export interface CreatePassportDto {
  productLine: ProductLine;
  originCode: OriginCode;
  deviceName: string;
  deviceModel: string;
  manufacturer: string;
  manufacturerPartNumber?: string;
  serialNumber?: string;
  specifications?: Record<string, unknown>;
  manufactureDate?: string;
  warrantyExpiryDate?: string;
  supplierId?: string;
  currentLocation?: string;
}

/**
 * Update device passport DTO
 */
export interface UpdatePassportDto {
  deviceName?: string;
  deviceModel?: string;
  specifications?: Record<string, unknown>;
  warrantyExpiryDate?: string;
  customerId?: string;
  currentLocation?: string;
}

/**
 * Update device status DTO
 */
export interface UpdateStatusDto {
  status: DeviceStatus;
  note?: string;
  location?: string;
}

/**
 * Public device information (returned from scan endpoint)
 */
export interface PublicDeviceInfo {
  passportCode: string;
  deviceName: string;
  deviceModel: string;
  manufacturer: string;
  productLine: ProductLine;
  originCode: OriginCode;
  status: DeviceStatus;
  manufactureDate?: Date;
  warrantyExpiryDate?: Date;
  isUnderWarranty: boolean;
}

/**
 * Device passport list item
 */
export interface PassportListItem {
  id: string;
  passportCode: string;
  deviceName: string;
  deviceModel: string;
  manufacturer: string;
  productLine: ProductLine;
  status: DeviceStatus;
  currentLocation?: string;
  createdAt: Date;
}

/**
 * Passport query filters
 */
export interface PassportQueryFilters {
  search?: string;
  productLine?: ProductLine;
  status?: DeviceStatus;
  supplierId?: string;
  customerId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
