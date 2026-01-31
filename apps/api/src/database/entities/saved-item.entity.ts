import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { SavedItemType } from '@device-passport/shared';
import { User } from './user.entity';

@Entity('saved_items')
@Index(['userId', 'itemType'])
@Unique(['userId', 'itemType', 'itemId'])
export class SavedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @Column({
    name: 'item_type',
    type: 'enum',
    enum: SavedItemType,
  })
  itemType: SavedItemType;

  @Column({ name: 'item_id' })
  itemId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
