import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PointType } from '@device-passport/shared';
import { User } from './user.entity';
import { PointUserType } from './point-account.entity';

@Entity('point_transactions')
@Index(['userId', 'createdAt'])
@Index(['actionCode', 'createdAt'])
export class PointTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Transaction code (PT-YYMM-NNNNNN)
  @Column({ name: 'transaction_code', unique: true })
  transactionCode: string;

  // User who received/lost points
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  // User type
  @Column({ name: 'user_type', type: 'varchar', length: 20 })
  userType: PointUserType;

  // ============================================
  // Point Details
  // ============================================

  // Point type (REWARD, CREDIT, PENALTY)
  @Column({ name: 'point_type', type: 'varchar', length: 20 })
  pointType: PointType;

  // Action code from PointRule configuration
  @Column({ name: 'action_code', type: 'varchar', length: 50 })
  actionCode: string;

  // Points amount (positive for add, negative for deduct)
  @Column({ type: 'int' })
  points: number;

  // Balance before transaction
  @Column({ name: 'balance_before', type: 'int' })
  balanceBefore: number;

  // Balance after transaction
  @Column({ name: 'balance_after', type: 'int' })
  balanceAfter: number;

  // Human readable description
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  // ============================================
  // Related Business Objects
  // ============================================

  // Related service record (if applicable)
  @Column({ name: 'related_service_record_id', nullable: true })
  relatedServiceRecordId: string;

  // Related service request (if applicable)
  @Column({ name: 'related_service_request_id', nullable: true })
  relatedServiceRequestId: string;

  // Related user (e.g., inviter for referral bonuses)
  @Column({ name: 'related_user_id', nullable: true })
  relatedUserId: string;

  // Related takeover request (if applicable)
  @Column({ name: 'related_takeover_id', nullable: true })
  relatedTakeoverId: string;

  // Related review (if applicable)
  @Column({ name: 'related_review_id', nullable: true })
  relatedReviewId: string;

  // Additional metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // ============================================
  // Processing Information
  // ============================================

  // Whether this transaction has been applied
  @Column({ name: 'is_applied', default: true })
  isApplied: boolean;

  // Reason if not applied
  @Column({ name: 'not_applied_reason', type: 'varchar', length: 200, nullable: true })
  notAppliedReason: string;

  // Operator who processed this (for admin adjustments)
  @Column({ name: 'processed_by', nullable: true })
  processedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
