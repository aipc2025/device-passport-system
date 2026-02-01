import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export type InviterType = 'CUSTOMER' | 'EXPERT';

@Entity('invitation_codes')
@Index(['code'])
@Index(['inviterId'])
export class InvitationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Inviter (user who created the code)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'inviter_id' })
  inviter: User;

  @Column({ name: 'inviter_id' })
  inviterId: string;

  // Inviter type
  @Column({ name: 'inviter_type', type: 'varchar', length: 20 })
  inviterType: InviterType;

  // Unique invitation code (INV-XXXXXX)
  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  // ============================================
  // Usage Tracking
  // ============================================

  // How many times this code has been used
  @Column({ name: 'used_count', type: 'int', default: 0 })
  usedCount: number;

  // Maximum uses allowed (null = unlimited)
  @Column({ name: 'max_uses', type: 'int', nullable: true })
  maxUses: number;

  // ============================================
  // Validity
  // ============================================

  // Expiration date (null = never expires)
  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  // Whether the code is still active
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // ============================================
  // Campaign/Promotion Tracking
  // ============================================

  // Campaign name (for tracking)
  @Column({ type: 'varchar', length: 100, nullable: true })
  campaign: string;

  // Source channel (e.g., 'wechat', 'email', 'website')
  @Column({ type: 'varchar', length: 50, nullable: true })
  channel: string;

  // Additional metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
