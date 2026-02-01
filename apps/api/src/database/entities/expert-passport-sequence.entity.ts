import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { IndustryCode, SkillCode } from '@device-passport/shared';

/**
 * Sequence counter for Expert Passport codes
 * Sequence is incremented per combination of: industry + skill + nationality
 */
@Entity('expert_passport_sequences')
@Unique(['industryCode', 'skillCode', 'nationalityCode'])
export class ExpertPassportSequence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'industry_code',
    type: 'varchar',
    length: 1,
  })
  industryCode: IndustryCode;

  @Column({
    name: 'skill_code',
    type: 'varchar',
    length: 2,
  })
  skillCode: SkillCode;

  @Column({
    name: 'nationality_code',
    type: 'varchar',
    length: 2,
  })
  nationalityCode: string;

  @Column({
    name: 'current_sequence',
    type: 'int',
    default: 0,
  })
  currentSequence: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
