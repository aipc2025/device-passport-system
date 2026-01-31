import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ExpertType, RegistrationStatus } from '@device-passport/shared';
import { User } from './user.entity';

@Entity('individual_experts')
export class IndividualExpert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'expert_type',
    type: 'enum',
    enum: ExpertType,
  })
  expertType: ExpertType;

  // Personal Info (Section F)
  @Column({ name: 'personal_name' })
  personalName: string;

  @Column({ name: 'id_number', nullable: true })
  idNumber: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: Date;

  // Emergency Contact
  @Column({ name: 'emergency_contact_name', nullable: true })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone', nullable: true })
  emergencyContactPhone: string;

  @Column({ name: 'emergency_contact_relationship', nullable: true })
  emergencyContactRelationship: string;

  // Professional Info
  @Column({ name: 'professional_field', nullable: true })
  professionalField: string;

  @Column({ name: 'services_offered', type: 'text', nullable: true })
  servicesOffered: string;

  @Column({ name: 'years_of_experience', type: 'int', nullable: true })
  yearsOfExperience: number;

  @Column({ type: 'jsonb', nullable: true })
  certifications: string[];

  // Location
  @Column({ name: 'current_location', nullable: true })
  currentLocation: string;

  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLat: number;

  @Column({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLng: number;

  // Admin fields
  @Column({ name: 'personal_notes', type: 'text', nullable: true })
  personalNotes: string;

  @Column({
    name: 'registration_status',
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  registrationStatus: RegistrationStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @Column({ name: 'reviewed_at', nullable: true })
  reviewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
