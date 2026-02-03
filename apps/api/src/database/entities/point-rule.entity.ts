import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PointType } from '@device-passport/shared';

// Rule trigger conditions
export interface RuleConditions {
  minOrderAmount?: number; // Minimum order amount to trigger
  minRating?: number; // Minimum rating to trigger
  userLevels?: string[]; // Applicable user credit levels
  membershipLevels?: string[]; // Applicable membership levels
  timeRange?: {
    // Time window for the rule
    startTime?: string; // Start time (ISO format)
    endTime?: string; // End time (ISO format)
  };
  isFirstTime?: boolean; // Only applies to first-time actions
  requiredDays?: number; // Required consecutive days (for streaks)
}

@Entity('point_rules')
export class PointRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Unique action code identifier
  @Column({ name: 'action_code', type: 'varchar', length: 50, unique: true })
  actionCode: string;

  // Human readable action name
  @Column({ name: 'action_name', type: 'varchar', length: 100 })
  actionName: string;

  // Detailed description
  @Column({ type: 'text', nullable: true })
  description: string;

  // Action category for grouping
  @Column({ type: 'varchar', length: 50 })
  category: string;

  // ============================================
  // Point Configuration
  // ============================================

  // Point type (REWARD, CREDIT, PENALTY)
  @Column({ name: 'point_type', type: 'varchar', length: 20 })
  pointType: PointType;

  // Default points value (positive for reward, negative for penalty)
  @Column({ name: 'default_points', type: 'int' })
  defaultPoints: number;

  // Minimum allowed value (for admin adjustment)
  @Column({ name: 'min_points', type: 'int', nullable: true })
  minPoints: number;

  // Maximum allowed value (for admin adjustment)
  @Column({ name: 'max_points', type: 'int', nullable: true })
  maxPoints: number;

  // ============================================
  // Limits
  // ============================================

  // Daily limit for this action per user
  @Column({ name: 'daily_limit', type: 'int', nullable: true })
  dailyLimit: number;

  // Weekly limit for this action per user
  @Column({ name: 'weekly_limit', type: 'int', nullable: true })
  weeklyLimit: number;

  // Monthly limit for this action per user
  @Column({ name: 'monthly_limit', type: 'int', nullable: true })
  monthlyLimit: number;

  // Total limit (for one-time rewards)
  @Column({ name: 'total_limit', type: 'int', nullable: true })
  totalLimit: number;

  // ============================================
  // Conditions
  // ============================================

  // Trigger conditions (JSON)
  @Column({ type: 'jsonb', nullable: true })
  conditions: RuleConditions;

  // ============================================
  // Status and Configuration
  // ============================================

  // Whether this rule is active
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Sort order for display
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  // Display icon (for frontend)
  @Column({ type: 'varchar', length: 50, nullable: true })
  icon: string;

  // Display color (for frontend)
  @Column({ type: 'varchar', length: 20, nullable: true })
  color: string;

  // ============================================
  // Localization
  // ============================================

  // Name translations
  @Column({ name: 'name_i18n', type: 'jsonb', nullable: true })
  nameI18n: Record<string, string>;

  // Description translations
  @Column({ name: 'description_i18n', type: 'jsonb', nullable: true })
  descriptionI18n: Record<string, string>;

  // ============================================
  // Audit
  // ============================================

  // Last modified by admin
  @Column({ name: 'modified_by', nullable: true })
  modifiedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
