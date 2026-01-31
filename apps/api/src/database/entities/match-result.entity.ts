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
import { MatchType, MatchStatus, MatchSource } from '@device-passport/shared';
import { MarketplaceProduct } from './marketplace-product.entity';
import { BuyerRequirement } from './buyer-requirement.entity';
import { Organization } from './organization.entity';

export interface ScoreBreakdown {
  categoryMatch: number;      // 0-20 points
  hsCodeMatch: number;        // 0-20 points
  priceRangeMatch: number;    // 0-15 points
  locationProximity: number;  // 0-25 points (highest weight)
  textSimilarity: number;     // 0-10 points
  frequencyMatch: number;     // 0-10 points
}

@Entity('match_results')
@Index(['matchType', 'status'])
@Index(['supplierOrgId', 'status'])
@Index(['buyerOrgId', 'status'])
@Index(['totalScore'])
export class MatchResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'match_type',
    type: 'enum',
    enum: MatchType,
  })
  matchType: MatchType;

  // Product side
  @Column({ name: 'marketplace_product_id', nullable: true })
  marketplaceProductId: string;

  @ManyToOne(() => MarketplaceProduct, { nullable: true })
  @JoinColumn({ name: 'marketplace_product_id' })
  marketplaceProduct: MarketplaceProduct;

  @Column({ name: 'supplier_org_id', nullable: true })
  supplierOrgId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'supplier_org_id' })
  supplierOrg: Organization;

  // Requirement side
  @Column({ name: 'buyer_requirement_id', nullable: true })
  buyerRequirementId: string;

  @ManyToOne(() => BuyerRequirement, { nullable: true })
  @JoinColumn({ name: 'buyer_requirement_id' })
  buyerRequirement: BuyerRequirement;

  @Column({ name: 'buyer_org_id', nullable: true })
  buyerOrgId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'buyer_org_id' })
  buyerOrg: Organization;

  // Scoring
  @Column({ name: 'total_score', type: 'int', default: 0 })
  totalScore: number; // 0-100

  @Column({ name: 'score_breakdown', type: 'jsonb', nullable: true })
  scoreBreakdown: ScoreBreakdown;

  @Column({ name: 'distance_km', type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanceKm: number | null;

  // Status
  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.NEW,
  })
  status: MatchStatus;

  // Match source - how this match was created
  @Column({
    name: 'match_source',
    type: 'enum',
    enum: MatchSource,
    default: MatchSource.AI_MATCHED,
  })
  matchSource: MatchSource;

  // Notification tracking
  @Column({ name: 'supplier_notified', default: false })
  supplierNotified: boolean;

  @Column({ name: 'buyer_notified', default: false })
  buyerNotified: boolean;

  @Column({ name: 'supplier_viewed_at', type: 'timestamp', nullable: true })
  supplierViewedAt: Date | null;

  @Column({ name: 'buyer_viewed_at', type: 'timestamp', nullable: true })
  buyerViewedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
