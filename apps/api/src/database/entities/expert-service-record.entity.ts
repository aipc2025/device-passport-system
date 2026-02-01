import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import {
  ServiceRecordStatus,
  ServiceType,
  DeviceStatus,
  MaintenanceType,
} from '@device-passport/shared';
import { ServiceRequest } from './service-request.entity';
import { IndividualExpert } from './individual-expert.entity';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { DevicePassport } from './device-passport.entity';

@Entity('expert_service_records')
@Unique(['serviceRequestId', 'expertId'])
export class ExpertServiceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Record code (ESR-YYMM-NNNNNN)
  @Column({ name: 'record_code', unique: true })
  recordCode: string;

  // Service Request reference
  @ManyToOne(() => ServiceRequest)
  @JoinColumn({ name: 'service_request_id' })
  serviceRequest: ServiceRequest;

  @Column({ name: 'service_request_id' })
  serviceRequestId: string;

  // Expert who performed the service
  @ManyToOne(() => IndividualExpert)
  @JoinColumn({ name: 'expert_id' })
  expert: IndividualExpert;

  @Column({ name: 'expert_id' })
  expertId: string;

  // Customer organization
  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'customer_org_id' })
  customerOrg: Organization;

  @Column({ name: 'customer_org_id', nullable: true })
  customerOrgId: string;

  // Customer user who created the service request
  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_user_id' })
  customerUser: User;

  @Column({ name: 'customer_user_id' })
  customerUserId: string;

  // Service details
  @Column({
    name: 'service_type',
    type: 'varchar',
    length: 50,
  })
  serviceType: ServiceType;

  @Column({ name: 'service_title', length: 255 })
  serviceTitle: string;

  @Column({ name: 'service_description', type: 'text', nullable: true })
  serviceDescription: string;

  // ============================================
  // Device Association Fields
  // ============================================

  // Related device passport (inherited from service request)
  @ManyToOne(() => DevicePassport, { nullable: true })
  @JoinColumn({ name: 'passport_id' })
  passport: DevicePassport;

  @Column({ name: 'passport_id', nullable: true })
  passportId: string;

  // Redundant passport code for easier querying
  @Column({ name: 'passport_code', type: 'varchar', length: 50, nullable: true })
  passportCode: string;

  // Device status before service started
  @Column({ name: 'device_status_before', type: 'varchar', length: 30, nullable: true })
  deviceStatusBefore: DeviceStatus;

  // Device status after service completed
  @Column({ name: 'device_status_after', type: 'varchar', length: 30, nullable: true })
  deviceStatusAfter: DeviceStatus;

  // Maintenance type classification
  @Column({ name: 'maintenance_type', type: 'varchar', length: 30, nullable: true })
  maintenanceType: MaintenanceType;

  // Status
  @Column({
    type: 'varchar',
    length: 50,
    default: ServiceRecordStatus.PENDING,
  })
  status: ServiceRecordStatus;

  // Pricing
  @Column({ name: 'agreed_price', type: 'decimal', precision: 12, scale: 2 })
  agreedPrice: number;

  @Column({ name: 'final_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  finalPrice: number;

  @Column({ name: 'price_currency', length: 3, default: 'USD' })
  priceCurrency: string;

  // Timeline
  @Column({ name: 'estimated_duration', nullable: true })
  estimatedDuration: string;

  @Column({ name: 'actual_duration', nullable: true })
  actualDuration: string;

  @Column({ name: 'scheduled_start', type: 'timestamp', nullable: true })
  scheduledStart: Date;

  @Column({ name: 'scheduled_end', type: 'timestamp', nullable: true })
  scheduledEnd: Date;

  @Column({ name: 'actual_start', type: 'timestamp', nullable: true })
  actualStart: Date;

  @Column({ name: 'actual_end', type: 'timestamp', nullable: true })
  actualEnd: Date;

  // Location
  @Column({ name: 'service_location', length: 500, nullable: true })
  serviceLocation: string;

  // Notes and documentation
  @Column({ name: 'expert_notes', type: 'text', nullable: true })
  expertNotes: string;

  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes: string;

  @Column({ name: 'completion_notes', type: 'text', nullable: true })
  completionNotes: string;

  // Completion tracking
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'confirmed_by_customer', default: false })
  confirmedByCustomer: boolean;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date;

  // Cancellation
  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ name: 'cancelled_by', nullable: true })
  cancelledBy: string;

  // Review tracking
  @Column({ name: 'is_reviewed', default: false })
  isReviewed: boolean;

  @Column({ name: 'review_requested_at', type: 'timestamp', nullable: true })
  reviewRequestedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
