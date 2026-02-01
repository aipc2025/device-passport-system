import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TakeoverReason, TakeoverStatus } from '@device-passport/shared';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { IndividualExpert } from './individual-expert.entity';
import { DevicePassport } from './device-passport.entity';

// Inspection report from expert verification
export interface InspectionReport {
  overallCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  functionalStatus: string;
  notes: string;
  photos: string[];
  inspectedAt: Date;
}

@Entity('device_takeover_requests')
export class DeviceTakeoverRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Request code (TK-YYMM-NNNNNN)
  @Column({ name: 'request_code', unique: true })
  requestCode: string;

  // Customer who initiated the takeover
  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_user_id' })
  customerUser: User;

  @Column({ name: 'customer_user_id' })
  customerUserId: string;

  // Customer organization (optional)
  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'customer_org_id' })
  customerOrg: Organization;

  @Column({ name: 'customer_org_id', nullable: true })
  customerOrgId: string;

  // ============================================
  // Device Information
  // ============================================

  @Column({ name: 'device_name', type: 'varchar', length: 100 })
  deviceName: string;

  @Column({ name: 'device_model', type: 'varchar', length: 100, nullable: true })
  deviceModel: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer: string;

  @Column({ name: 'serial_number', type: 'varchar', length: 100, nullable: true })
  serialNumber: string;

  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchaseDate: Date;

  @Column({ name: 'warranty_expiry', type: 'date', nullable: true })
  warrantyExpiry: Date;

  // ============================================
  // Takeover Details
  // ============================================

  @Column({
    name: 'takeover_reason',
    type: 'varchar',
    length: 50,
  })
  takeoverReason: TakeoverReason;

  @Column({ name: 'reason_description', type: 'text', nullable: true })
  reasonDescription: string;

  // ============================================
  // Uploaded Materials
  // ============================================

  // Device photos (URLs)
  @Column({ type: 'jsonb', default: '[]' })
  photos: string[];

  // Supporting documents (purchase receipts, etc.)
  @Column({ type: 'jsonb', default: '[]' })
  documents: string[];

  // Nameplate/label photos
  @Column({ name: 'nameplate_photos', type: 'jsonb', default: '[]' })
  nameplatePhotos: string[];

  // ============================================
  // Inspection Information
  // ============================================

  // Expert who performed inspection (if required)
  @ManyToOne(() => IndividualExpert, { nullable: true })
  @JoinColumn({ name: 'inspection_expert_id' })
  inspectionExpert: IndividualExpert;

  @Column({ name: 'inspection_expert_id', nullable: true })
  inspectionExpertId: string;

  // Inspection report from expert
  @Column({ name: 'inspection_report', type: 'jsonb', nullable: true })
  inspectionReport: InspectionReport;

  // Whether inspection is required for this device
  @Column({ name: 'inspection_required', default: false })
  inspectionRequired: boolean;

  // ============================================
  // Status and Workflow
  // ============================================

  @Column({
    type: 'varchar',
    length: 30,
    default: TakeoverStatus.PENDING,
  })
  status: TakeoverStatus;

  // Admin reviewer
  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  reviewNotes: string | null;

  // Rejection reason (if rejected)
  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  // ============================================
  // Generated Passport
  // ============================================

  // Generated passport after approval
  @ManyToOne(() => DevicePassport, { nullable: true })
  @JoinColumn({ name: 'generated_passport_id' })
  generatedPassport: DevicePassport;

  @Column({ name: 'generated_passport_id', nullable: true })
  generatedPassportId: string;

  @Column({ name: 'generated_passport_code', type: 'varchar', length: 50, nullable: true })
  generatedPassportCode: string;

  // ============================================
  // Additional Information
  // ============================================

  // Estimated device value
  @Column({ name: 'estimated_value', type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedValue: number;

  @Column({ name: 'value_currency', type: 'varchar', length: 3, default: 'USD' })
  valueCurrency: string;

  // Current device location
  @Column({ name: 'device_location', type: 'varchar', length: 500, nullable: true })
  deviceLocation: string;

  // Industry/use case for the device
  @Column({ type: 'varchar', length: 100, nullable: true })
  industry: string;

  // Additional notes from customer
  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
