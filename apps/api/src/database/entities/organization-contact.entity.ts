import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContactType, Gender } from '@device-passport/shared';
import { Organization } from './organization.entity';

@Entity('organization_contacts')
export class OrganizationContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({
    name: 'contact_type',
    type: 'enum',
    enum: ContactType,
  })
  contactType: ContactType;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  department: string;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ name: 'personal_notes', type: 'text', nullable: true })
  personalNotes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
