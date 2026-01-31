import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

/**
 * Expert Sequence Counter
 * Tracks the sequence number for expert passport codes
 * Format: EP-{TYPE}-{YYMM}-{SEQUENCE}-{CHECKSUM}
 * Example: EP-TECH-2501-000001-A7
 */
@Entity('expert_sequence_counters')
@Unique(['expertType', 'yearMonth'])
export class ExpertSequenceCounter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'expert_type', length: 10 })
  expertType: string; // 'TECH' or 'BIZ'

  @Column({ name: 'year_month', length: 4 })
  yearMonth: string; // 'YYMM' format, e.g., '2501'

  @Column({ name: 'current_sequence', type: 'int', default: 0 })
  currentSequence: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
