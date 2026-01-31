import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { InquiryStatus } from '@device-passport/shared';
import { MarketplaceProduct } from './marketplace-product.entity';
import { BuyerRequirement } from './buyer-requirement.entity';
import { MatchResult } from './match-result.entity';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { InquiryMessage } from './inquiry-message.entity';

@Entity('inquiries')
@Index(['status'])
@Index(['buyerOrgId', 'status'])
@Index(['supplierOrgId', 'status'])
@Index(['inquiryCode'], { unique: true })
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inquiry_code', unique: true })
  inquiryCode: string; // INQ-{YEAR}-{SEQ}

  // Related entities (optional - can be from product, RFQ, or direct)
  @Column({ name: 'marketplace_product_id', nullable: true })
  marketplaceProductId: string;

  @ManyToOne(() => MarketplaceProduct, { nullable: true })
  @JoinColumn({ name: 'marketplace_product_id' })
  marketplaceProduct: MarketplaceProduct;

  @Column({ name: 'buyer_requirement_id', nullable: true })
  buyerRequirementId: string;

  @ManyToOne(() => BuyerRequirement, { nullable: true })
  @JoinColumn({ name: 'buyer_requirement_id' })
  buyerRequirement: BuyerRequirement;

  @Column({ name: 'match_result_id', nullable: true })
  matchResultId: string;

  @ManyToOne(() => MatchResult, { nullable: true })
  @JoinColumn({ name: 'match_result_id' })
  matchResult: MatchResult;

  // Parties
  @Column({ name: 'buyer_org_id' })
  buyerOrgId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'buyer_org_id' })
  buyerOrg: Organization;

  @Column({ name: 'supplier_org_id' })
  supplierOrgId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'supplier_org_id' })
  supplierOrg: Organization;

  @Column({ name: 'initiated_by_user_id' })
  initiatedByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'initiated_by_user_id' })
  initiatedByUser: User;

  // Inquiry details
  @Column()
  subject: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'int', nullable: true })
  quantity: number;

  @Column({ name: 'target_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  targetPrice: number;

  @Column({ name: 'target_currency', length: 3, default: 'USD' })
  targetCurrency: string;

  @Column({ name: 'required_delivery_date', type: 'timestamp', nullable: true })
  requiredDeliveryDate: Date | null;

  // Status
  @Column({
    type: 'enum',
    enum: InquiryStatus,
    default: InquiryStatus.PENDING,
  })
  status: InquiryStatus;

  @Column({ name: 'responded_at', type: 'timestamp', nullable: true })
  respondedAt: Date | null;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @Column({ name: 'close_reason', nullable: true })
  closeReason: string;

  // Messages relation
  @OneToMany(() => InquiryMessage, (message) => message.inquiry)
  messages: InquiryMessage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
