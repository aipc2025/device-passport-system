import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PackagingType } from '@device-passport/shared';
import { Organization } from './organization.entity';

@Entity('supplier_products')
export class SupplierProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // Basic Info
  @Column()
  name: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ name: 'hs_code', nullable: true })
  hsCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Pricing
  @Column({ name: 'cost_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  costPrice: number;

  @Column({ name: 'selling_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  sellingPrice: number;

  @Column({ name: 'price_currency', length: 3, default: 'USD' })
  priceCurrency: string;

  // Packaging & Dimensions
  @Column({
    name: 'packaging_type',
    type: 'enum',
    enum: PackagingType,
    nullable: true,
  })
  packagingType: PackagingType;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  length: number; // cm

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  width: number; // cm

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  height: number; // cm

  @Column({ name: 'net_weight', type: 'decimal', precision: 10, scale: 3, nullable: true })
  netWeight: number; // kg

  @Column({ name: 'gross_weight', type: 'decimal', precision: 10, scale: 3, nullable: true })
  grossWeight: number; // kg

  // Status
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
