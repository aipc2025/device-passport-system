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
import { ReviewStatus } from '@device-passport/shared';
import { ExpertServiceRecord } from './expert-service-record.entity';
import { IndividualExpert } from './individual-expert.entity';
import { User } from './user.entity';

@Entity('expert_reviews')
@Unique(['serviceRecordId']) // One review per service record
export class ExpertReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Service record reference
  @OneToOne(() => ExpertServiceRecord)
  @JoinColumn({ name: 'service_record_id' })
  serviceRecord: ExpertServiceRecord;

  @Column({ name: 'service_record_id' })
  serviceRecordId: string;

  // Expert being reviewed
  @ManyToOne(() => IndividualExpert)
  @JoinColumn({ name: 'expert_id' })
  expert: IndividualExpert;

  @Column({ name: 'expert_id' })
  expertId: string;

  // Reviewer (customer)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Column({ name: 'reviewer_id' })
  reviewerId: string;

  // Rating scores (1-5)
  @Column({ name: 'overall_rating', type: 'int' })
  overallRating: number; // Main rating (1-5)

  @Column({ name: 'quality_rating', type: 'int', nullable: true })
  qualityRating: number; // Quality of work (1-5)

  @Column({ name: 'communication_rating', type: 'int', nullable: true })
  communicationRating: number; // Communication (1-5)

  @Column({ name: 'punctuality_rating', type: 'int', nullable: true })
  punctualityRating: number; // Timeliness (1-5)

  @Column({ name: 'professionalism_rating', type: 'int', nullable: true })
  professionalismRating: number; // Professionalism (1-5)

  @Column({ name: 'value_rating', type: 'int', nullable: true })
  valueRating: number; // Value for money (1-5)

  // Review content
  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'jsonb', default: '[]' })
  pros: string[]; // List of positive aspects

  @Column({ type: 'jsonb', default: '[]' })
  cons: string[]; // List of negative aspects

  // Verification
  @Column({ name: 'is_verified', default: true })
  isVerified: boolean; // Verified through service record

  // Expert response
  @Column({ name: 'expert_response', type: 'text', nullable: true })
  expertResponse: string;

  @Column({ name: 'expert_responded_at', type: 'timestamp', nullable: true })
  expertRespondedAt: Date;

  // Status
  @Column({
    type: 'varchar',
    length: 50,
    default: ReviewStatus.PUBLISHED,
  })
  status: ReviewStatus;

  // Moderation
  @Column({ name: 'flagged_reason', type: 'text', nullable: true })
  flaggedReason: string;

  @Column({ name: 'hidden_reason', type: 'text', nullable: true })
  hiddenReason: string;

  @Column({ name: 'moderated_by', nullable: true })
  moderatedBy: string;

  @Column({ name: 'moderated_at', type: 'timestamp', nullable: true })
  moderatedAt: Date;

  // Helpfulness votes
  @Column({ name: 'helpful_count', type: 'int', default: 0 })
  helpfulCount: number;

  @Column({ name: 'not_helpful_count', type: 'int', default: 0 })
  notHelpfulCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
