import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import {
  ExpertType,
  RegistrationStatus,
  IndustryCode,
  SkillCode,
  ExpertTypeCode,
} from '@device-passport/shared';
import { User } from './user.entity';
import { ExpertWorkHistory } from './expert-work-history.entity';

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
    name: 'expert_types',
    type: 'jsonb',
    default: '[]',
  })
  expertTypes: ExpertType[];

  // Expert Passport Code fields (new format)
  @Column({
    name: 'expert_type_code',
    type: 'varchar',
    length: 1,
    nullable: true,
  })
  expertTypeCode: ExpertTypeCode;

  // Industries (first one is primary for passport code)
  @Column({
    name: 'industries',
    type: 'jsonb',
    default: '[]',
  })
  industries: IndustryCode[];

  // Skills (first one is primary for passport code)
  @Column({
    name: 'skills',
    type: 'jsonb',
    default: '[]',
  })
  skills: SkillCode[];

  // Nationality (ISO 3166-1 Alpha-2)
  @Column({ name: 'nationality', length: 2, nullable: true })
  nationality: string;

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

  // Expert Passport Code (EP-TECH-2501-000001-A7)
  @Column({ name: 'expert_code', unique: true, nullable: true })
  expertCode: string;

  @Column({ name: 'expert_code_generated_at', nullable: true })
  expertCodeGeneratedAt: Date;

  // Service Availability
  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'skill_tags', type: 'jsonb', default: '[]' })
  skillTags: string[];

  @Column({ name: 'service_radius', type: 'int', default: 50 })
  serviceRadius: number; // Service radius in km

  // Location
  @Column({ name: 'current_location', nullable: true })
  currentLocation: string;

  @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLat: number;

  @Column({ name: 'location_lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  locationLng: number;

  @Column({ name: 'last_location_update_at', nullable: true })
  lastLocationUpdateAt: Date;

  // Rating (aggregated from service records)
  @Column({ name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, nullable: true })
  avgRating: number;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @Column({ name: 'completed_services', type: 'int', default: 0 })
  completedServices: number;

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

  // Profile visibility
  @Column({ name: 'is_profile_public', default: true })
  isProfilePublic: boolean;

  // Bio/Introduction for public profile
  @Column({ name: 'bio', type: 'text', nullable: true })
  bio: string;

  // Work history relation
  @OneToMany(() => ExpertWorkHistory, (workHistory) => workHistory.expert)
  workHistories: ExpertWorkHistory[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
