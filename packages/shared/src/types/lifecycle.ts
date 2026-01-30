import { DeviceStatus, LifecycleEventType } from '../enums';

/**
 * Lifecycle event record
 * Immutable record of device lifecycle changes (blockchain-ready)
 */
export interface LifecycleEvent {
  id: string;
  passportId: string;
  eventType: LifecycleEventType;

  // Status change details
  previousStatus?: DeviceStatus;
  newStatus?: DeviceStatus;

  // Location change details
  previousLocation?: string;
  newLocation?: string;

  // Event metadata
  description?: string;
  note?: string;

  // Flexible data for different event types
  metadata?: Record<string, unknown>;

  // Actor information
  performedBy: string;
  performedByName: string;
  performedByRole: string;

  // Timestamps (immutable)
  occurredAt: Date;
  createdAt: Date;

  // Blockchain preparation
  blockchainHash?: string;
  previousEventHash?: string;
}

/**
 * Create lifecycle event DTO
 */
export interface CreateLifecycleEventDto {
  passportId: string;
  eventType: LifecycleEventType;
  previousStatus?: DeviceStatus;
  newStatus?: DeviceStatus;
  previousLocation?: string;
  newLocation?: string;
  description?: string;
  note?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Lifecycle event query filters
 */
export interface LifecycleEventFilters {
  passportId?: string;
  eventType?: LifecycleEventType;
  fromDate?: string;
  toDate?: string;
  performedBy?: string;
  page?: number;
  limit?: number;
}

/**
 * Lifecycle timeline item (for display)
 */
export interface LifecycleTimelineItem {
  id: string;
  eventType: LifecycleEventType;
  title: string;
  description?: string;
  previousStatus?: DeviceStatus;
  newStatus?: DeviceStatus;
  location?: string;
  performedByName: string;
  occurredAt: Date;
}

/**
 * QC Inspection result data
 */
export interface QCInspectionData {
  inspectionType: string;
  result: 'PASS' | 'FAIL' | 'CONDITIONAL';
  checklist: QCChecklistItem[];
  notes?: string;
  attachments?: string[];
}

/**
 * QC Checklist item
 */
export interface QCChecklistItem {
  item: string;
  passed: boolean;
  notes?: string;
}

/**
 * Test result data
 */
export interface TestResultData {
  testType: string;
  result: 'PASS' | 'FAIL';
  parameters: TestParameter[];
  duration?: number; // in minutes
  notes?: string;
  attachments?: string[];
}

/**
 * Test parameter
 */
export interface TestParameter {
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
  unit?: string;
}
