import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { CompanyType, RegistrationStatus, PurchaseFrequency } from '@device-passport/shared';
import { Organization } from './organization.entity';

/**
 * Address stored as JSONB
 */
export interface AddressJson {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

@Entity('company_profiles')
export class CompanyProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', unique: true })
  organizationId: string;

  @OneToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // Roles
  @Column({ name: 'is_supplier', default: false })
  isSupplier: boolean;

  @Column({ name: 'is_buyer', default: false })
  isBuyer: boolean;

  // Business License Info (Section A)
  @Column({ name: 'registered_capital', type: 'decimal', precision: 15, scale: 2, nullable: true })
  registeredCapital: number;

  @Column({ name: 'capital_currency', length: 3, nullable: true })
  capitalCurrency: string;

  @Column({
    name: 'company_type',
    type: 'enum',
    enum: CompanyType,
    nullable: true,
  })
  companyType: CompanyType;

  @Column({ name: 'establishment_date', type: 'date', nullable: true })
  establishmentDate: Date;

  @Column({ name: 'legal_representative', nullable: true })
  legalRepresentative: string;

  @Column({ name: 'business_scope', type: 'text', nullable: true })
  businessScope: string;

  // Addresses (JSONB)
  @Column({ name: 'registered_address', type: 'jsonb', nullable: true })
  registeredAddress: AddressJson;

  @Column({ name: 'business_address', type: 'jsonb', nullable: true })
  businessAddress: AddressJson;

  // Invoice Info (Section C)
  @Column({ name: 'tax_number', nullable: true })
  taxNumber: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  @Column({ name: 'bank_account_number', nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'invoice_phone', nullable: true })
  invoicePhone: string;

  @Column({ name: 'invoice_address', nullable: true })
  invoiceAddress: string;

  // Buyer Requirements (Section E)
  @Column({ name: 'buyer_product_description', type: 'text', nullable: true })
  buyerProductDescription: string;

  @Column({
    name: 'purchase_frequency',
    type: 'enum',
    enum: PurchaseFrequency,
    nullable: true,
  })
  purchaseFrequency: PurchaseFrequency;

  @Column({ name: 'purchase_volume', nullable: true })
  purchaseVolume: string;

  @Column({ name: 'preferred_payment_terms', nullable: true })
  preferredPaymentTerms: string;

  // Registration Status
  @Column({
    name: 'registration_status',
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  registrationStatus: RegistrationStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
