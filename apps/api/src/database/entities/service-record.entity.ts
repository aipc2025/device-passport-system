import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceRecordType, ServicePart, ServiceAttachment } from '@device-passport/shared';
import { ServiceOrder } from './service-order.entity';
import { User } from './user.entity';

@Entity('service_records')
export class ServiceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_order_id' })
  serviceOrderId: string;

  @ManyToOne(() => ServiceOrder, (order) => order.serviceRecords)
  @JoinColumn({ name: 'service_order_id' })
  serviceOrder: ServiceOrder;

  @Column({ name: 'work_performed', type: 'text' })
  workPerformed: string;

  @Column({ name: 'parts_used', type: 'jsonb', nullable: true })
  partsUsed: ServicePart[];

  @Column({ name: 'start_time', type: 'timestamp with time zone' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp with time zone' })
  endTime: Date;

  @Column({ name: 'travel_time', nullable: true })
  travelTime: number;

  @Column({ name: 'work_time' })
  workTime: number;

  @Column({
    name: 'record_type',
    type: 'enum',
    enum: ServiceRecordType,
  })
  recordType: ServiceRecordType;

  @Column({ type: 'jsonb', nullable: true })
  attachments: ServiceAttachment[];

  @Column({ name: 'engineer_signature', type: 'text', nullable: true })
  engineerSignature: string;

  @Column({ name: 'customer_signature', type: 'text', nullable: true })
  customerSignature: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ name: 'engineer_name' })
  engineerName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
