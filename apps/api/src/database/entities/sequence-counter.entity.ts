import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { ProductLine, OriginCode } from '@device-passport/shared';

@Entity('sequence_counters')
@Unique(['companyCode', 'year', 'productLine', 'originCode'])
export class SequenceCounter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_code', length: 3 })
  companyCode: string;

  @Column()
  year: number;

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

  @Column({ name: 'current_sequence', default: 0 })
  currentSequence: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
