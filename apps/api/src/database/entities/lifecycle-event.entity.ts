import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DeviceStatus, LifecycleEventType } from '@device-passport/shared';
import { DevicePassport } from './device-passport.entity';
import { User } from './user.entity';

@Entity('lifecycle_events')
export class LifecycleEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'passport_id' })
  passportId: string;

  @ManyToOne(() => DevicePassport, (passport) => passport.lifecycleEvents)
  @JoinColumn({ name: 'passport_id' })
  passport: DevicePassport;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: LifecycleEventType,
  })
  eventType: LifecycleEventType;

  @Column({
    name: 'previous_status',
    type: 'enum',
    enum: DeviceStatus,
    nullable: true,
  })
  previousStatus: DeviceStatus;

  @Column({
    name: 'new_status',
    type: 'enum',
    enum: DeviceStatus,
    nullable: true,
  })
  newStatus: DeviceStatus;

  @Column({ name: 'previous_location', nullable: true })
  previousLocation: string;

  @Column({ name: 'new_location', nullable: true })
  newLocation: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ name: 'performed_by' })
  performedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performed_by' })
  performer: User;

  @Column({ name: 'performed_by_name' })
  performedByName: string;

  @Column({ name: 'performed_by_role' })
  performedByRole: string;

  @Column({ name: 'occurred_at', type: 'timestamp with time zone' })
  occurredAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'blockchain_hash', nullable: true })
  blockchainHash: string;

  @Column({ name: 'previous_event_hash', nullable: true })
  previousEventHash: string;
}
