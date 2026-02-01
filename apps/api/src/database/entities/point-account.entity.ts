import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CreditLevel } from '@device-passport/shared';
import { User } from './user.entity';

export type PointUserType = 'CUSTOMER' | 'EXPERT';

@Entity('point_accounts')
export class PointAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User associated with this account
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  // User type (CUSTOMER or EXPERT)
  @Column({ name: 'user_type', type: 'varchar', length: 20 })
  userType: PointUserType;

  // ============================================
  // Reward Points (spendable)
  // ============================================

  // Current reward points balance
  @Column({ name: 'reward_points', type: 'int', default: 0 })
  rewardPoints: number;

  // Total earned points (historical)
  @Column({ name: 'total_earned_points', type: 'int', default: 0 })
  totalEarnedPoints: number;

  // Total spent points (historical)
  @Column({ name: 'total_spent_points', type: 'int', default: 0 })
  totalSpentPoints: number;

  // ============================================
  // Credit Score System
  // ============================================

  // Credit score (affects ranking and privileges)
  @Column({ name: 'credit_score', type: 'int', default: 100 })
  creditScore: number;

  // Credit level (calculated from credit_score)
  @Column({
    name: 'credit_level',
    type: 'varchar',
    length: 20,
    default: CreditLevel.BRONZE,
  })
  creditLevel: CreditLevel;

  // Total penalty points (historical)
  @Column({ name: 'total_penalty_points', type: 'int', default: 0 })
  totalPenaltyPoints: number;

  // ============================================
  // Statistics
  // ============================================

  // Consecutive login days
  @Column({ name: 'consecutive_login_days', type: 'int', default: 0 })
  consecutiveLoginDays: number;

  // Last login date for tracking streaks
  @Column({ name: 'last_login_date', type: 'date', nullable: true })
  lastLoginDate: Date;

  // Last activity date
  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  lastActivityAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
