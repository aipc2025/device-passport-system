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
import { MarketplaceListingStatus, ProductLine } from '@device-passport/shared';
import { Organization } from './organization.entity';
import { SupplierProduct } from './supplier-product.entity';

@Entity('marketplace_products')
@Index(['status', 'expiresAt'])
@Index(['productCategory'])
@Index(['supplyRegion'])
export class MarketplaceProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'supplier_product_id', nullable: true })
  supplierProductId: string;

  @ManyToOne(() => SupplierProduct, { nullable: true })
  @JoinColumn({ name: 'supplier_product_id' })
  supplierProduct: SupplierProduct;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // Listing Info
  @Column({ name: 'listing_title' })
  listingTitle: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'hs_code', nullable: true })
  hsCode: string;

  @Column({
    name: 'product_category',
    type: 'enum',
    enum: ProductLine,
    nullable: true,
  })
  productCategory: ProductLine;

  // Pricing
  @Column({ name: 'show_price', default: true })
  showPrice: boolean;

  @Column({ name: 'min_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  minPrice: number;

  @Column({ name: 'max_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxPrice: number;

  @Column({ name: 'price_currency', length: 3, default: 'USD' })
  priceCurrency: string;

  @Column({ name: 'price_unit', nullable: true })
  priceUnit: string; // per unit, per set, per kg, etc.

  // Order Requirements
  @Column({ name: 'min_order_quantity', type: 'int', nullable: true })
  minOrderQuantity: number;

  // Location
  @Column({ name: 'supply_region', nullable: true })
  supplyRegion: string; // Country code or region name

  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLat: number;

  @Column({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLng: number;

  // Supply Info
  @Column({ name: 'lead_time_days', type: 'int', nullable: true })
  leadTimeDays: number;

  @Column({ name: 'shipping_terms', type: 'jsonb', nullable: true })
  shippingTerms: Record<string, unknown>; // FOB, CIF, etc.

  // Status & Visibility
  @Column({
    type: 'enum',
    enum: MarketplaceListingStatus,
    default: MarketplaceListingStatus.DRAFT,
  })
  status: MarketplaceListingStatus;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  // Metrics
  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @Column({ name: 'inquiry_count', type: 'int', default: 0 })
  inquiryCount: number;

  // Timestamps
  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
