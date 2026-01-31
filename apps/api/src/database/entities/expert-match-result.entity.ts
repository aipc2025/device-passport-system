import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ExpertMatchType, ExpertMatchStatus, MatchSource } from '@device-passport/shared';
import { IndividualExpert } from './individual-expert.entity';
import { ServiceRequest } from './service-request.entity';

@Entity('expert_match_results')
@Unique(['expertId', 'serviceRequestId'])
export class ExpertMatchResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Match type
  @Column({
    name: 'match_type',
    type: 'varchar',
    length: 50,
    default: ExpertMatchType.SERVICE_TO_EXPERT,
  })
  matchType: ExpertMatchType;

  // Expert being matched
  @ManyToOne(() => IndividualExpert)
  @JoinColumn({ name: 'expert_id' })
  expert: IndividualExpert;

  @Column({ name: 'expert_id' })
  expertId: string;

  // Service request being matched
  @ManyToOne(() => ServiceRequest)
  @JoinColumn({ name: 'service_request_id' })
  serviceRequest: ServiceRequest;

  @Column({ name: 'service_request_id' })
  serviceRequestId: string;

  // Match source
  @Column({
    name: 'match_source',
    type: 'varchar',
    length: 50,
    default: MatchSource.AI_MATCHED,
  })
  matchSource: MatchSource;

  // Total score (0-100)
  @Column({ name: 'total_score', type: 'decimal', precision: 5, scale: 2 })
  totalScore: number;

  // Score breakdown (JSONB)
  @Column({ name: 'score_breakdown', type: 'jsonb', default: '{}' })
  scoreBreakdown: {
    locationScore?: number;      // 30% - Distance-based
    skillScore?: number;         // 25% - Skills match
    experienceScore?: number;    // 15% - Years of experience
    availabilityScore?: number;  // 15% - Availability match
    ratingScore?: number;        // 15% - Expert rating
  };

  // Distance in km
  @Column({ name: 'distance_km', type: 'decimal', precision: 10, scale: 2, nullable: true })
  distanceKm: number;

  // Match status
  @Column({
    type: 'varchar',
    length: 50,
    default: ExpertMatchStatus.NEW,
  })
  status: ExpertMatchStatus;

  // Notification tracking
  @Column({ name: 'expert_notified', default: false })
  expertNotified: boolean;

  @Column({ name: 'expert_notified_at', type: 'timestamp', nullable: true })
  expertNotifiedAt: Date;

  @Column({ name: 'customer_notified', default: false })
  customerNotified: boolean;

  @Column({ name: 'customer_notified_at', type: 'timestamp', nullable: true })
  customerNotifiedAt: Date;

  // View tracking
  @Column({ name: 'expert_viewed_at', type: 'timestamp', nullable: true })
  expertViewedAt: Date;

  @Column({ name: 'customer_viewed_at', type: 'timestamp', nullable: true })
  customerViewedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
