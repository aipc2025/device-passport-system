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
import { RFQStatus, ProductLine, PurchaseFrequency } from '@device-passport/shared';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity('buyer_requirements')
@Index(['status', 'validUntil'])
@Index(['productCategory'])
@Index(['organizationId'])
export class BuyerRequirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'created_by_user_id' })
  createdByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_user_id' })
  createdByUser: User;

  // RFQ Info
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'product_category',
    type: 'enum',
    enum: ProductLine,
    nullable: true,
  })
  productCategory: ProductLine;

  @Column({ name: 'hs_code', nullable: true })
  hsCode: string;

  // Quantity
  @Column({ type: 'int', nullable: true })
  quantity: number;

  @Column({ name: 'quantity_unit', nullable: true })
  quantityUnit: string; // units, sets, kg, etc.

  @Column({
    name: 'purchase_frequency',
    type: 'enum',
    enum: PurchaseFrequency,
    nullable: true,
  })
  purchaseFrequency: PurchaseFrequency;

  // Budget
  @Column({ name: 'budget_min', type: 'decimal', precision: 12, scale: 2, nullable: true })
  budgetMin: number;

  @Column({ name: 'budget_max', type: 'decimal', precision: 12, scale: 2, nullable: true })
  budgetMax: number;

  @Column({ name: 'budget_currency', length: 3, default: 'USD' })
  budgetCurrency: string;

  // Location Preferences
  @Column({ name: 'preferred_regions', type: 'jsonb', nullable: true })
  preferredRegions: string[]; // Array of country codes or region names

  @Column({ name: 'buyer_location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  buyerLocationLat: number;

  @Column({ name: 'buyer_location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  buyerLocationLng: number;

  // Deadlines
  @Column({ name: 'delivery_deadline', type: 'timestamp', nullable: true })
  deliveryDeadline: Date | null;

  @Column({ name: 'valid_until', type: 'timestamp', nullable: true })
  validUntil: Date | null;

  // Visibility
  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ name: 'show_company_info', default: true })
  showCompanyInfo: boolean;

  // Status
  @Column({
    type: 'enum',
    enum: RFQStatus,
    default: RFQStatus.DRAFT,
  })
  status: RFQStatus;

  // Metrics
  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'quote_count', type: 'int', default: 0 })
  quoteCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
