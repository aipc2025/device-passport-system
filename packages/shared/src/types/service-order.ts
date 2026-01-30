import { ServiceOrderStatus, ServiceType } from '../enums';

/**
 * Service order interface
 */
export interface ServiceOrder {
  id: string;
  orderNumber: string;
  passportId: string;
  passportCode: string;

  // Service details
  serviceType: ServiceType;
  status: ServiceOrderStatus;
  priority: ServicePriority;

  // Description
  title: string;
  description: string;

  // Customer information
  customerId: string;
  customerName: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;

  // Location
  serviceAddress: string;
  serviceCity?: string;
  serviceCountry?: string;

  // Assignment
  assignedEngineerId?: string;
  assignedEngineerName?: string;

  // Scheduling
  requestedDate?: Date;
  scheduledDate?: Date;
  completedDate?: Date;

  // Estimated and actual
  estimatedDuration?: number; // in hours
  actualDuration?: number;

  // Notes
  internalNotes?: string;
  customerNotes?: string;
  resolutionNotes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * Service priority levels
 */
export enum ServicePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * Service record (engineer's work log)
 */
export interface ServiceRecord {
  id: string;
  serviceOrderId: string;

  // Work details
  workPerformed: string;
  partsUsed?: ServicePart[];

  // Time tracking
  startTime: Date;
  endTime: Date;
  travelTime?: number; // in minutes
  workTime: number; // in minutes

  // Status
  recordType: ServiceRecordType;

  // Attachments (photos, documents)
  attachments?: ServiceAttachment[];

  // Signatures
  engineerSignature?: string;
  customerSignature?: string;

  // Timestamps
  createdAt: Date;
  createdBy: string;
  engineerName: string;
}

/**
 * Service record types
 */
export enum ServiceRecordType {
  DIAGNOSIS = 'DIAGNOSIS',
  REPAIR = 'REPAIR',
  MAINTENANCE = 'MAINTENANCE',
  INSPECTION = 'INSPECTION',
  FOLLOW_UP = 'FOLLOW_UP',
}

/**
 * Parts used in service
 */
export interface ServicePart {
  partNumber: string;
  partName: string;
  quantity: number;
  unitPrice?: number;
}

/**
 * Service attachment
 */
export interface ServiceAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * Create service order DTO
 */
export interface CreateServiceOrderDto {
  passportCode: string;
  serviceType: ServiceType;
  priority: ServicePriority;
  title: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  serviceAddress: string;
  serviceCity?: string;
  serviceCountry?: string;
  requestedDate?: string;
  customerNotes?: string;
}

/**
 * Update service order DTO
 */
export interface UpdateServiceOrderDto {
  status?: ServiceOrderStatus;
  priority?: ServicePriority;
  assignedEngineerId?: string;
  scheduledDate?: string;
  estimatedDuration?: number;
  internalNotes?: string;
  resolutionNotes?: string;
}

/**
 * Create service record DTO
 */
export interface CreateServiceRecordDto {
  serviceOrderId: string;
  workPerformed: string;
  partsUsed?: ServicePart[];
  startTime: string;
  endTime: string;
  travelTime?: number;
  recordType: ServiceRecordType;
  attachments?: Omit<ServiceAttachment, 'id' | 'uploadedAt' | 'uploadedBy'>[];
  engineerSignature?: string;
  customerSignature?: string;
}

/**
 * Service order query filters
 */
export interface ServiceOrderFilters {
  search?: string;
  status?: ServiceOrderStatus;
  serviceType?: ServiceType;
  priority?: ServicePriority;
  customerId?: string;
  assignedEngineerId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Public service request DTO (for unauthenticated users)
 */
export interface PublicServiceRequestDto {
  passportCode: string;
  serviceType: ServiceType;
  title: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  serviceAddress: string;
  serviceCity?: string;
  preferredDate?: string;
}

/**
 * Service order list item
 */
export interface ServiceOrderListItem {
  id: string;
  orderNumber: string;
  passportCode: string;
  serviceType: ServiceType;
  status: ServiceOrderStatus;
  priority: ServicePriority;
  title: string;
  customerName: string;
  assignedEngineerName?: string;
  scheduledDate?: Date;
  createdAt: Date;
}
