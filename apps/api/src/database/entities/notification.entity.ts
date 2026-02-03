import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum NotificationType {
  SERVICE_REQUEST_CREATED = 'service_request_created',
  SERVICE_REQUEST_ASSIGNED = 'service_request_assigned',
  SERVICE_REQUEST_COMPLETED = 'service_request_completed',
  EXPERT_MATCHED = 'expert_matched',
  INQUIRY_RECEIVED = 'inquiry_received',
  INQUIRY_REPLIED = 'inquiry_replied',
  MATCH_RESULT_NEW = 'match_result_new',
  ORDER_STATUS_UPDATED = 'order_status_updated',
  DEVICE_STATUS_UPDATED = 'device_status_updated',
  EXPERT_STATUS_CHANGED = 'expert_status_changed',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_notification_user_id')
  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index('idx_notification_type')
  @Column({
    type: 'varchar',
    length: 50,
  })
  type: NotificationType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ name: 'action_url', length: 500, nullable: true })
  actionUrl: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Index('idx_notification_is_read')
  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', nullable: true })
  readAt: Date;

  @Index('idx_notification_created_at')
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
