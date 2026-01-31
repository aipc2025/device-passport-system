import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ServiceType, ServiceRequestStatus, ServiceUrgency } from '@device-passport/shared';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Request code (SR-YYMM-NNNNNN)
  @Column({ name: 'request_code', unique: true })
  requestCode: string;

  // Requesting organization/customer
  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  // Created by user
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User;

  @Column({ name: 'created_by_user_id' })
  createdByUserId: string;

  // Basic information
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    name: 'service_type',
    type: 'varchar',
    length: 50,
  })
  serviceType: ServiceType;

  @Column({
    type: 'varchar',
    length: 50,
    default: ServiceRequestStatus.DRAFT,
  })
  status: ServiceRequestStatus;

  @Column({
    type: 'varchar',
    length: 20,
    default: ServiceUrgency.NORMAL,
  })
  urgency: ServiceUrgency;

  // Location information
  @Column({ name: 'service_location', length: 500, nullable: true })
  serviceLocation: string;

  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLat: number;

  @Column({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLng: number;

  // Contact information
  @Column({ name: 'contact_name', length: 100 })
  contactName: string;

  @Column({ name: 'contact_phone', length: 50 })
  contactPhone: string;

  @Column({ name: 'contact_email', length: 255, nullable: true })
  contactEmail: string;

  // Budget and timeline
  @Column({ name: 'budget_min', type: 'decimal', precision: 12, scale: 2, nullable: true })
  budgetMin: number;

  @Column({ name: 'budget_max', type: 'decimal', precision: 12, scale: 2, nullable: true })
  budgetMax: number;

  @Column({ name: 'budget_currency', length: 3, default: 'USD' })
  budgetCurrency: string;

  @Column({ name: 'preferred_date', type: 'timestamp', nullable: true })
  preferredDate: Date;

  @Column({ name: 'deadline', type: 'timestamp', nullable: true })
  deadline: Date;

  // Required skills
  @Column({ name: 'required_skills', type: 'jsonb', default: '[]' })
  requiredSkills: string[];

  // Visibility
  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ name: 'show_company_info', default: true })
  showCompanyInfo: boolean;

  // Assigned expert (when accepted)
  @Column({ name: 'assigned_expert_id', nullable: true })
  assignedExpertId: string;

  @Column({ name: 'assigned_at', type: 'timestamp', nullable: true })
  assignedAt: Date;

  // Stats
  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'application_count', type: 'int', default: 0 })
  applicationCount: number;

  // Completion
  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
