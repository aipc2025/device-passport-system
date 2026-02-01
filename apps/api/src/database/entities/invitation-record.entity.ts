import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { InvitationCode } from './invitation-code.entity';

export type InviteeType = 'CUSTOMER' | 'EXPERT';

@Entity('invitation_records')
@Unique(['inviteeId']) // One user can only be invited once
@Index(['inviterId', 'createdAt'])
@Index(['inviteeId'])
export class InvitationRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Invitation code used
  @ManyToOne(() => InvitationCode)
  @JoinColumn({ name: 'invitation_code_id' })
  invitationCode: InvitationCode;

  @Column({ name: 'invitation_code_id' })
  invitationCodeId: string;

  // Inviter (user who shared the code)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'inviter_id' })
  inviter: User;

  @Column({ name: 'inviter_id' })
  inviterId: string;

  // Invitee (user who registered using the code)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'invitee_id' })
  invitee: User;

  @Column({ name: 'invitee_id' })
  inviteeId: string;

  // Invitee type
  @Column({ name: 'invitee_type', type: 'varchar', length: 20 })
  inviteeType: InviteeType;

  // ============================================
  // Reward Status Tracking
  // ============================================

  // Registration reward claimed by inviter
  @Column({ name: 'register_reward_claimed', default: false })
  registerRewardClaimed: boolean;

  @Column({ name: 'register_reward_claimed_at', type: 'timestamp', nullable: true })
  registerRewardClaimedAt: Date;

  // First order reward claimed by inviter
  @Column({ name: 'first_order_reward_claimed', default: false })
  firstOrderRewardClaimed: boolean;

  @Column({ name: 'first_order_reward_claimed_at', type: 'timestamp', nullable: true })
  firstOrderRewardClaimedAt: Date;

  // First order information
  @Column({ name: 'first_order_at', type: 'timestamp', nullable: true })
  firstOrderAt: Date;

  @Column({ name: 'first_order_id', nullable: true })
  firstOrderId: string;

  // ============================================
  // Invitee Rewards
  // ============================================

  // Welcome reward claimed by invitee
  @Column({ name: 'welcome_reward_claimed', default: false })
  welcomeRewardClaimed: boolean;

  @Column({ name: 'welcome_reward_claimed_at', type: 'timestamp', nullable: true })
  welcomeRewardClaimedAt: Date;

  // ============================================
  // Verification
  // ============================================

  // Whether invitee completed verification (real name, etc.)
  @Column({ name: 'invitee_verified', default: false })
  inviteeVerified: boolean;

  @Column({ name: 'invitee_verified_at', type: 'timestamp', nullable: true })
  inviteeVerifiedAt: Date;

  // ============================================
  // Anti-Fraud Tracking
  // ============================================

  // IP address used during registration
  @Column({ name: 'registration_ip', type: 'varchar', length: 45, nullable: true })
  registrationIp: string;

  // Device fingerprint
  @Column({ name: 'device_fingerprint', type: 'varchar', length: 100, nullable: true })
  deviceFingerprint: string;

  // Flagged as suspicious
  @Column({ name: 'is_suspicious', default: false })
  isSuspicious: boolean;

  @Column({ name: 'suspicious_reason', type: 'varchar', length: 200, nullable: true })
  suspiciousReason: string;

  // Reviewed by admin
  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
