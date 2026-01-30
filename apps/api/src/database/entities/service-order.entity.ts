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
import {
  ServiceOrderStatus,
  ServiceType,
  ServicePriority,
} from '@device-passport/shared';
import { DevicePassport } from './device-passport.entity';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { ServiceRecord } from './service-record.entity';

@Entity('service_orders')
export class ServiceOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @Column({ name: 'passport_id' })
  passportId: string;

  @ManyToOne(() => DevicePassport)
  @JoinColumn({ name: 'passport_id' })
  passport: DevicePassport;

  @Column({ name: 'passport_code' })
  passportCode: string;

  @Column({
    name: 'service_type',
    type: 'enum',
    enum: ServiceType,
  })
  serviceType: ServiceType;

  @Column({
    type: 'enum',
    enum: ServiceOrderStatus,
    default: ServiceOrderStatus.PENDING,
  })
  status: ServiceOrderStatus;

  @Column({
    type: 'enum',
    enum: ServicePriority,
    default: ServicePriority.MEDIUM,
  })
  priority: ServicePriority;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'customer_id' })
  customer: Organization;

  @Column({ name: 'customer_name' })
  customerName: string;

  @Column({ name: 'contact_name' })
  contactName: string;

  @Column({ name: 'contact_phone' })
  contactPhone: string;

  @Column({ name: 'contact_email', nullable: true })
  contactEmail: string;

  @Column({ name: 'service_address' })
  serviceAddress: string;

  @Column({ name: 'service_city', nullable: true })
  serviceCity: string;

  @Column({ name: 'service_country', nullable: true })
  serviceCountry: string;

  @Column({ name: 'assigned_engineer_id', nullable: true })
  assignedEngineerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_engineer_id' })
  assignedEngineer: User;

  @Column({ name: 'assigned_engineer_name', nullable: true })
  assignedEngineerName: string;

  @Column({ name: 'requested_date', type: 'date', nullable: true })
  requestedDate: Date;

  @Column({ name: 'scheduled_date', type: 'date', nullable: true })
  scheduledDate: Date;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate: Date;

  @Column({ name: 'estimated_duration', nullable: true })
  estimatedDuration: number;

  @Column({ name: 'actual_duration', nullable: true })
  actualDuration: number;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes: string;

  @Column({ name: 'customer_notes', type: 'text', nullable: true })
  customerNotes: string;

  @Column({ name: 'resolution_notes', type: 'text', nullable: true })
  resolutionNotes: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ServiceRecord, (record) => record.serviceOrder)
  serviceRecords: ServiceRecord[];
}
