import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { DeviceStatus, ProductLine, OriginCode } from '@device-passport/shared';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { LifecycleEvent } from './lifecycle-event.entity';

@Entity('device_passports')
export class DevicePassport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'passport_code', unique: true })
  passportCode: string;

  @Column({
    name: 'product_line',
    type: 'enum',
    enum: ProductLine,
  })
  productLine: ProductLine;

  @Column({
    name: 'origin_code',
    type: 'enum',
    enum: OriginCode,
  })
  originCode: OriginCode;

  @Column({ name: 'custom_origin_code', length: 2, nullable: true })
  customOriginCode: string;

  @Column({
    type: 'enum',
    enum: DeviceStatus,
    default: DeviceStatus.CREATED,
  })
  status: DeviceStatus;

  @Column({ name: 'device_name' })
  deviceName: string;

  @Column({ name: 'device_model' })
  deviceModel: string;

  @Column()
  manufacturer: string;

  @Column({ name: 'manufacturer_part_number', nullable: true })
  manufacturerPartNumber: string;

  @Column({ name: 'serial_number', nullable: true })
  serialNumber: string;

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, unknown>;

  @Column({ name: 'manufacture_date', type: 'date', nullable: true })
  manufactureDate: Date;

  @Column({ name: 'warranty_expiry_date', type: 'date', nullable: true })
  warrantyExpiryDate: Date;

  @Column({ name: 'supplier_id', nullable: true })
  supplierId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Organization;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Organization;

  @Column({ name: 'current_location', nullable: true })
  currentLocation: string;

  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLat: number;

  @Column({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLng: number;

  @Column({ name: 'location_updated_at', type: 'timestamp', nullable: true })
  locationUpdatedAt: Date;

  // Buyer information fields
  @Column({ name: 'buyer_company', nullable: true })
  buyerCompany: string;

  @Column({ name: 'buyer_contact', nullable: true })
  buyerContact: string;

  @Column({ name: 'buyer_phone', nullable: true })
  buyerPhone: string;

  @Column({ name: 'buyer_country', nullable: true })
  buyerCountry: string;

  @Column({ name: 'buyer_address', nullable: true })
  buyerAddress: string;

  @Column({ name: 'buyer_address_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  buyerAddressLat: number;

  @Column({ name: 'buyer_address_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  buyerAddressLng: number;

  @Column({ name: 'buyer_email', nullable: true })
  buyerEmail: string;

  @Column({ name: 'blockchain_hash', nullable: true })
  blockchainHash: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'updated_by' })
  updatedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => LifecycleEvent, (event) => event.passport)
  lifecycleEvents: LifecycleEvent[];
}
