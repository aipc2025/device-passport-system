import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import {
  ServiceOrderStatus,
  ServiceType,
  ServicePriority,
} from '@device-passport/shared';
import { DevicePassport } from './device-passport.entity';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { ServiceRecord } from './service-record.entity';

@Entity('service_orders')
export class ServiceOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @Index('idx_service_order_passport_id')
  @Column({ name: 'passport_id', type: 'uuid', nullable: true })
  passportId: string | null;

  @ManyToOne(() => DevicePassport, { nullable: true })
  @JoinColumn({ name: 'passport_id' })
  passport: DevicePassport;

  @Column({ name: 'passport_code', type: 'varchar', nullable: true })
  passportCode: string | null;

  @Column({
    name: 'service_type',
    type: 'enum',
    enum: ServiceType,
  })
  serviceType: ServiceType;

  @Index('idx_service_order_status')
  @Column({
    type: 'enum',
    enum: ServiceOrderStatus,
    default: ServiceOrderStatus.PENDING,
  })
  status: ServiceOrderStatus;

  @Column({
    type: 'enum',
    enum: ServicePriority,
    default: ServicePriority.MEDIUM,
  })
  priority: ServicePriority;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Index('idx_service_order_customer_id')
  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId: string | null;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Organization;

  @Column({ name: 'customer_name', type: 'varchar', nullable: true })
  customerName: string;

  @Column({ name: 'contact_name' })
  contactName: string;

  @Column({ name: 'contact_phone' })
  contactPhone: string;

  @Column({ name: 'contact_email', nullable: true })
  contactEmail: string;

  @Column({ name: 'service_address' })
  serviceAddress: string;

  @Column({ name: 'service_city', nullable: true })
  serviceCity: string;

  @Column({ name: 'service_country', nullable: true })
  serviceCountry: string;

  @Index('idx_service_order_assigned_engineer')
  @Column({ name: 'assigned_engineer_id', nullable: true })
  assignedEngineerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_engineer_id' })
  assignedEngineer: User;

  @Column({ name: 'assigned_engineer_name', nullable: true })
  assignedEngineerName: string;

  @Column({ name: 'requested_date', type: 'date', nullable: true })
  requestedDate: Date;

  @Column({ name: 'scheduled_date', type: 'date', nullable: true })
  scheduledDate: Date;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate: Date;

  @Column({ name: 'estimated_duration', nullable: true })
  estimatedDuration: number;

  @Column({ name: 'actual_duration', nullable: true })
  actualDuration: number;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes: string;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string;

  // Location from map selection
  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLat: number | null;

  @Column({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLng: number | null;

  // Preferred service date from public request
  @Column({ name: 'preferred_date', type: 'date', nullable: true })
  preferredDate: Date | null;

  // Attachment file IDs
  @Column({ name: 'attachment_file_ids', type: 'jsonb', nullable: true })
  attachmentFileIds: string[] | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  // For public requests where there's no user
  @Column({ name: 'created_by_source', type: 'varchar', nullable: true })
  createdBySource: string | null;

  // Urgent service flag
  @Column({ name: 'is_urgent', default: false })
  isUrgent: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ServiceRecord, (record) => record.serviceOrder)
  serviceRecords: ServiceRecord[];
}
