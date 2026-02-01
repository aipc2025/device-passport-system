import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkHistoryVerificationStatus } from '@device-passport/shared';
import { IndividualExpert } from './individual-expert.entity';

@Entity('expert_work_histories')
export class ExpertWorkHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'expert_id' })
  expertId: string;

  @ManyToOne(() => IndividualExpert, (expert) => expert.workHistories)
  @JoinColumn({ name: 'expert_id' })
  expert: IndividualExpert;

  // Company/Organization info
  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ name: 'company_contact_email', nullable: true })
  companyContactEmail: string;

  @Column({ name: 'company_contact_phone', nullable: true })
  companyContactPhone: string;

  @Column({ name: 'company_address', nullable: true })
  companyAddress: string;

  // Position info
  @Column()
  position: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Duration
  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'is_current', default: false })
  isCurrent: boolean;

  // Visibility
  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  // Verification
  @Column({
    name: 'verification_status',
    type: 'varchar',
    length: 30,
    default: WorkHistoryVerificationStatus.UNVERIFIED,
  })
  verificationStatus: WorkHistoryVerificationStatus;

  // When user requests verification
  @Column({ name: 'verification_requested_at', nullable: true })
  verificationRequestedAt: Date;

  // Admin who processed the verification
  @Column({ name: 'verified_by', nullable: true })
  verifiedBy: string;

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt: Date;

  // Proof document (file ID)
  @Column({ name: 'proof_document_id', nullable: true })
  proofDocumentId: string;

  // Admin notes about verification
  @Column({ name: 'verification_notes', type: 'text', nullable: true })
  verificationNotes: string;

  // Rejection reason if rejected
  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
