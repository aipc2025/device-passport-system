import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { InquiryMessageType } from '@device-passport/shared';
import { Inquiry } from './inquiry.entity';
import { User } from './user.entity';

@Entity('inquiry_messages')
@Index(['inquiryId', 'createdAt'])
@Index(['senderUserId'])
export class InquiryMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inquiry_id' })
  inquiryId: string;

  @ManyToOne(() => Inquiry, (inquiry) => inquiry.messages)
  @JoinColumn({ name: 'inquiry_id' })
  inquiry: Inquiry;

  @Column({ name: 'sender_user_id' })
  senderUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sender_user_id' })
  senderUser: User;

  @Column({ name: 'sender_org_id' })
  senderOrgId: string;

  // Message type
  @Column({
    name: 'message_type',
    type: 'enum',
    enum: InquiryMessageType,
    default: InquiryMessageType.MESSAGE,
  })
  messageType: InquiryMessageType;

  // Content
  @Column({ type: 'text', nullable: true })
  content: string;

  // Quote details (when messageType is QUOTE or COUNTER_OFFER)
  @Column({ name: 'quote_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  quotePrice: number;

  @Column({ name: 'quote_currency', length: 3, nullable: true })
  quoteCurrency: string;

  @Column({ name: 'quote_valid_until', type: 'timestamp', nullable: true })
  quoteValidUntil: Date | null;

  @Column({ name: 'quoted_lead_time_days', type: 'int', nullable: true })
  quotedLeadTimeDays: number | null;

  // Read status
  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
