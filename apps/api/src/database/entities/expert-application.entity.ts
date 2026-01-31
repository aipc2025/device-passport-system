import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ExpertApplicationStatus } from '@device-passport/shared';
import { IndividualExpert } from './individual-expert.entity';
import { ServiceRequest } from './service-request.entity';

@Entity('expert_applications')
@Unique(['expertId', 'serviceRequestId'])
export class ExpertApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Expert applying
  @ManyToOne(() => IndividualExpert)
  @JoinColumn({ name: 'expert_id' })
  expert: IndividualExpert;

  @Column({ name: 'expert_id' })
  expertId: string;

  // Service request being applied to
  @ManyToOne(() => ServiceRequest)
  @JoinColumn({ name: 'service_request_id' })
  serviceRequest: ServiceRequest;

  @Column({ name: 'service_request_id' })
  serviceRequestId: string;

  // Application status
  @Column({
    type: 'varchar',
    length: 50,
    default: ExpertApplicationStatus.PENDING,
  })
  status: ExpertApplicationStatus;

  // Application message/cover letter
  @Column({ type: 'text', nullable: true })
  message: string;

  // Proposed price/budget
  @Column({ name: 'proposed_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  proposedPrice: number;

  @Column({ name: 'price_currency', length: 3, default: 'USD' })
  priceCurrency: string;

  // Estimated completion time (in days or hours)
  @Column({ name: 'estimated_duration', type: 'int', nullable: true })
  estimatedDuration: number;

  @Column({ name: 'duration_unit', length: 20, default: 'days' })
  durationUnit: string;

  // Availability
  @Column({ name: 'available_from', type: 'timestamp', nullable: true })
  availableFrom: Date;

  // Match info (if auto-matched)
  @Column({ name: 'match_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  matchScore: number;

  @Column({ name: 'match_source', length: 50, nullable: true })
  matchSource: string;

  // Status change tracking
  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ name: 'reviewed_by_user_id', nullable: true })
  reviewedByUserId: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
