import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { ServiceRequest, IndividualExpert, ExpertMatchResult } from '../../database/entities';
import {
  ServiceRequestStatus,
  ExpertMatchType,
  ExpertMatchStatus,
  MatchSource,
  RegistrationStatus,
  ExpertWorkStatus,
  ExpertMembershipLevel,
} from '@device-passport/shared';

export interface ScoreBreakdown {
  locationScore: number;
  skillScore: number;
  experienceScore: number;
  availabilityScore: number;
  ratingScore: number;
  keywordScore?: number;
  workStatusBonus?: number;
}

// Matching weights (total 100)
const WEIGHTS = {
  LOCATION: 25,
  SKILLS: 20,
  EXPERIENCE: 10,
  AVAILABILITY: 15,
  RATING: 10,
  KEYWORD: 20, // New: Keyword matching
};

// Work status bonus points (added on top of base score)
const WORK_STATUS_BONUS = {
  [ExpertWorkStatus.RUSHING]: 15, // Highest priority
  [ExpertWorkStatus.IDLE]: 5, // Normal priority
  [ExpertWorkStatus.BOOKED]: 0, // Already has work
  [ExpertWorkStatus.IN_SERVICE]: -5, // Currently busy
  [ExpertWorkStatus.OFF_DUTY]: -100, // Not available
};

// Membership level bonus
const MEMBERSHIP_BONUS = {
  [ExpertMembershipLevel.DIAMOND]: 10,
  [ExpertMembershipLevel.GOLD]: 5,
  [ExpertMembershipLevel.SILVER]: 2,
  [ExpertMembershipLevel.STANDARD]: 0,
};

// Minimum score threshold for creating a match
const MINIMUM_MATCH_SCORE = 35;

@Injectable()
export class ExpertMatchingService {
  constructor(
    @InjectRepository(ServiceRequest)
    private serviceRequestRepository: Repository<ServiceRequest>,
    @InjectRepository(IndividualExpert)
    private expertRepository: Repository<IndividualExpert>,
    @InjectRepository(ExpertMatchResult)
    private matchResultRepository: Repository<ExpertMatchResult>
  ) {}

  /**
   * Run matching for a specific service request
   */
  async matchExpertsToServiceRequest(serviceRequestId: string): Promise<ExpertMatchResult[]> {
    const serviceRequest = await this.serviceRequestRepository.findOne({
      where: { id: serviceRequestId },
    });

    if (!serviceRequest || serviceRequest.status !== ServiceRequestStatus.OPEN) {
      return [];
    }

    // Get all approved, available experts
    const experts = await this.expertRepository.find({
      where: {
        registrationStatus: RegistrationStatus.APPROVED,
        isAvailable: true,
      },
    });

    const matchResults: ExpertMatchResult[] = [];

    for (const expert of experts) {
      // Check if match already exists
      const existing = await this.matchResultRepository.findOne({
        where: { expertId: expert.id, serviceRequestId },
      });

      if (existing) {
        continue; // Skip if already matched
      }

      // Calculate match score
      const { totalScore, breakdown, distanceKm } = this.calculateMatchScore(
        expert,
        serviceRequest
      );

      // Only create match if score meets threshold
      if (totalScore >= MINIMUM_MATCH_SCORE) {
        const matchResult = this.matchResultRepository.create({
          matchType: ExpertMatchType.SERVICE_TO_EXPERT,
          expertId: expert.id,
          serviceRequestId,
          matchSource: MatchSource.AI_MATCHED,
          totalScore,
          scoreBreakdown: breakdown,
          distanceKm: distanceKm ?? undefined,
          status: ExpertMatchStatus.NEW,
        });

        const saved = await this.matchResultRepository.save(matchResult);
        matchResults.push(saved);
      }
    }

    return matchResults;
  }

  /**
   * Calculate match score between an expert and a service request
   */
  calculateMatchScore(
    expert: IndividualExpert,
    serviceRequest: ServiceRequest
  ): { totalScore: number; breakdown: ScoreBreakdown; distanceKm: number | null } {
    // 1. Location Score (25%)
    const { locationScore, distanceKm } = this.calculateLocationScore(expert, serviceRequest);

    // 2. Skills Score (20%)
    const skillScore = this.calculateSkillScore(expert, serviceRequest);

    // 3. Experience Score (10%)
    const experienceScore = this.calculateExperienceScore(expert);

    // 4. Availability Score (15%)
    const availabilityScore = this.calculateAvailabilityScore(expert);

    // 5. Rating Score (10%)
    const ratingScore = this.calculateRatingScore(expert);

    // 6. Keyword Score (20%) - NEW: Match title/description with expert profile
    const keywordScore = this.calculateKeywordScore(expert, serviceRequest);

    // Calculate base weighted score
    const baseScore =
      (locationScore * WEIGHTS.LOCATION +
        skillScore * WEIGHTS.SKILLS +
        experienceScore * WEIGHTS.EXPERIENCE +
        availabilityScore * WEIGHTS.AVAILABILITY +
        ratingScore * WEIGHTS.RATING +
        keywordScore * WEIGHTS.KEYWORD) /
      100;

    // 7. Work Status Bonus - RUSHING experts get priority
    const workStatusBonus = WORK_STATUS_BONUS[expert.workStatus as ExpertWorkStatus] || 0;

    // 8. Membership Bonus
    const membershipBonus = MEMBERSHIP_BONUS[expert.membershipLevel as ExpertMembershipLevel] || 0;

    // Add bonuses (capped at 100)
    const totalScore = Math.min(100, baseScore + workStatusBonus + membershipBonus);

    const breakdown: ScoreBreakdown = {
      locationScore: Math.round(locationScore * WEIGHTS.LOCATION) / 100,
      skillScore: Math.round(skillScore * WEIGHTS.SKILLS) / 100,
      experienceScore: Math.round(experienceScore * WEIGHTS.EXPERIENCE) / 100,
      availabilityScore: Math.round(availabilityScore * WEIGHTS.AVAILABILITY) / 100,
      ratingScore: Math.round(ratingScore * WEIGHTS.RATING) / 100,
      keywordScore: Math.round(keywordScore * WEIGHTS.KEYWORD) / 100,
      workStatusBonus: workStatusBonus,
    };

    return {
      totalScore: Math.round(totalScore * 100) / 100,
      breakdown,
      distanceKm,
    };
  }

  /**
   * Calculate keyword match score
   * Matches service request title/description with expert's skills, tags, and professional field
   */
  private calculateKeywordScore(expert: IndividualExpert, serviceRequest: ServiceRequest): number {
    // Build search text from service request
    const searchText = [
      serviceRequest.title || '',
      serviceRequest.description || '',
      ...(serviceRequest.requiredSkills || []),
    ]
      .join(' ')
      .toLowerCase();

    if (!searchText.trim()) {
      return 50; // Default if no searchable text
    }

    // Build expert keywords from profile
    const expertKeywords: string[] = [
      ...(expert.skillTags || []),
      expert.professionalField || '',
      expert.servicesOffered || '',
      ...(expert.certifications || []),
    ]
      .map((k) => k.toLowerCase())
      .filter((k) => k.length > 0);

    if (expertKeywords.length === 0) {
      return 30; // Expert has no keywords
    }

    // Count matching keywords
    let matchCount = 0;
    let totalWeight = 0;

    for (const keyword of expertKeywords) {
      // Split compound keywords
      const words = keyword.split(/[\s,;]+/).filter((w) => w.length > 2);
      for (const word of words) {
        totalWeight++;
        if (searchText.includes(word)) {
          matchCount++;
        }
      }
    }

    if (totalWeight === 0) {
      return 50;
    }

    // Calculate match percentage with minimum floor
    const matchPercentage = matchCount / totalWeight;
    return Math.max(20, Math.round(matchPercentage * 100));
  }

  /**
   * Calculate location-based score
   * <50km = 100, <100km = 90, <200km = 70, <500km = 50, <1000km = 30, >1000km = 10
   */
  private calculateLocationScore(
    expert: IndividualExpert,
    serviceRequest: ServiceRequest
  ): { locationScore: number; distanceKm: number | null } {
    if (
      !expert.locationLat ||
      !expert.locationLng ||
      !serviceRequest.locationLat ||
      !serviceRequest.locationLng
    ) {
      return { locationScore: 50, distanceKm: null }; // Default if no location data
    }

    const distanceKm = this.calculateDistance(
      Number(expert.locationLat),
      Number(expert.locationLng),
      Number(serviceRequest.locationLat),
      Number(serviceRequest.locationLng)
    );

    // Check if within service radius
    if (expert.serviceRadius && distanceKm > expert.serviceRadius) {
      return { locationScore: 0, distanceKm }; // Out of service range
    }

    let locationScore: number;
    if (distanceKm < 50) {
      locationScore = 100;
    } else if (distanceKm < 100) {
      locationScore = 90;
    } else if (distanceKm < 200) {
      locationScore = 70;
    } else if (distanceKm < 500) {
      locationScore = 50;
    } else if (distanceKm < 1000) {
      locationScore = 30;
    } else {
      locationScore = 10;
    }

    return { locationScore, distanceKm };
  }

  /**
   * Calculate skill match score
   */
  private calculateSkillScore(expert: IndividualExpert, serviceRequest: ServiceRequest): number {
    if (!serviceRequest.requiredSkills || serviceRequest.requiredSkills.length === 0) {
      return 70; // No specific skills required
    }

    if (!expert.skillTags || expert.skillTags.length === 0) {
      return 30; // Expert has no skills listed
    }

    // Calculate matching percentage
    const requiredSkills = serviceRequest.requiredSkills.map((s) => s.toLowerCase());
    const expertSkills = expert.skillTags.map((s) => s.toLowerCase());

    let matchCount = 0;
    for (const required of requiredSkills) {
      // Check for exact match or partial match
      if (expertSkills.some((skill) => skill.includes(required) || required.includes(skill))) {
        matchCount++;
      }
    }

    const matchPercentage = matchCount / requiredSkills.length;
    return Math.round(matchPercentage * 100);
  }

  /**
   * Calculate experience score
   * Based on years of experience
   */
  private calculateExperienceScore(expert: IndividualExpert): number {
    const years = expert.yearsOfExperience || 0;

    if (years >= 10) return 100;
    if (years >= 7) return 90;
    if (years >= 5) return 80;
    if (years >= 3) return 60;
    if (years >= 1) return 40;
    return 20;
  }

  /**
   * Calculate availability score
   */
  private calculateAvailabilityScore(expert: IndividualExpert): number {
    if (!expert.isAvailable) {
      return 0;
    }

    // Check last location update freshness
    if (expert.lastLocationUpdateAt) {
      const hoursSinceUpdate =
        (Date.now() - new Date(expert.lastLocationUpdateAt).getTime()) / (1000 * 60 * 60);

      if (hoursSinceUpdate < 1) return 100; // Updated within last hour
      if (hoursSinceUpdate < 4) return 90;
      if (hoursSinceUpdate < 12) return 70;
      if (hoursSinceUpdate < 24) return 50;
      return 30;
    }

    return 50; // No recent update
  }

  /**
   * Calculate rating score
   */
  private calculateRatingScore(expert: IndividualExpert): number {
    if (!expert.avgRating || expert.totalReviews === 0) {
      return 50; // No ratings yet
    }

    const rating = Number(expert.avgRating);

    // Factor in number of reviews for confidence
    const reviewConfidence = Math.min(expert.totalReviews / 10, 1); // Max confidence at 10 reviews
    const adjustedRating = rating * (0.7 + 0.3 * reviewConfidence);

    return Math.round((adjustedRating / 5) * 100);
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Get matches for an expert
   */
  async getMatchesForExpert(expertId: string, limit = 50): Promise<ExpertMatchResult[]> {
    return this.matchResultRepository.find({
      where: { expertId, status: In([ExpertMatchStatus.NEW, ExpertMatchStatus.VIEWED]) },
      relations: ['serviceRequest', 'serviceRequest.organization'],
      order: { totalScore: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get matches for a service request (customer view)
   */
  async getMatchesForServiceRequest(
    serviceRequestId: string,
    limit = 50
  ): Promise<ExpertMatchResult[]> {
    return this.matchResultRepository.find({
      where: { serviceRequestId },
      relations: ['expert'],
      order: { totalScore: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Mark match as viewed
   */
  async markAsViewed(matchId: string, viewerType: 'expert' | 'customer'): Promise<void> {
    const match = await this.matchResultRepository.findOne({ where: { id: matchId } });
    if (!match) return;

    if (viewerType === 'expert') {
      match.expertViewedAt = new Date();
    } else {
      match.customerViewedAt = new Date();
    }

    if (match.status === ExpertMatchStatus.NEW) {
      match.status = ExpertMatchStatus.VIEWED;
    }

    await this.matchResultRepository.save(match);
  }

  /**
   * Dismiss a match
   */
  async dismissMatch(matchId: string): Promise<void> {
    await this.matchResultRepository.update(matchId, {
      status: ExpertMatchStatus.DISMISSED,
    });
  }

  /**
   * Create a manual match (platform recommended or buyer specified)
   */
  async createManualMatch(
    expertId: string,
    serviceRequestId: string,
    source: MatchSource
  ): Promise<ExpertMatchResult> {
    const expert = await this.expertRepository.findOne({ where: { id: expertId } });
    const serviceRequest = await this.serviceRequestRepository.findOne({
      where: { id: serviceRequestId },
    });

    if (!expert || !serviceRequest) {
      throw new Error('Expert or service request not found');
    }

    const { totalScore, breakdown, distanceKm } = this.calculateMatchScore(expert, serviceRequest);

    const matchResult = this.matchResultRepository.create({
      matchType: ExpertMatchType.SERVICE_TO_EXPERT,
      expertId,
      serviceRequestId,
      matchSource: source,
      totalScore,
      scoreBreakdown: breakdown,
      distanceKm: distanceKm ?? undefined,
      status: ExpertMatchStatus.NEW,
    });

    return this.matchResultRepository.save(matchResult);
  }

  /**
   * Admin pushes a service request to multiple specific experts
   */
  async pushToExperts(
    serviceRequestId: string,
    expertIds: string[],
    pushSource: MatchSource = MatchSource.PLATFORM_RECOMMENDED
  ): Promise<{ success: number; failed: number; matches: ExpertMatchResult[] }> {
    const serviceRequest = await this.serviceRequestRepository.findOne({
      where: { id: serviceRequestId },
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    if (serviceRequest.status !== ServiceRequestStatus.OPEN) {
      throw new BadRequestException('Service request is not open for matching');
    }

    const matches: ExpertMatchResult[] = [];
    let failed = 0;

    for (const expertId of expertIds) {
      try {
        // Check if match already exists
        const existing = await this.matchResultRepository.findOne({
          where: { expertId, serviceRequestId },
        });

        if (existing) {
          // Update existing match with new source
          existing.matchSource = pushSource;
          existing.expertNotified = false; // Will trigger new notification
          existing.updatedAt = new Date();
          await this.matchResultRepository.save(existing);
          matches.push(existing);
          continue;
        }

        const expert = await this.expertRepository.findOne({ where: { id: expertId } });
        if (!expert) {
          failed++;
          continue;
        }

        const { totalScore, breakdown, distanceKm } = this.calculateMatchScore(
          expert,
          serviceRequest
        );

        const matchResult = this.matchResultRepository.create({
          matchType: ExpertMatchType.SERVICE_TO_EXPERT,
          expertId,
          serviceRequestId,
          matchSource: pushSource,
          totalScore,
          scoreBreakdown: breakdown,
          distanceKm: distanceKm ?? undefined,
          status: ExpertMatchStatus.NEW,
          expertNotified: false, // Mark for notification
        });

        const saved = await this.matchResultRepository.save(matchResult);
        matches.push(saved);
      } catch (error) {
        failed++;
      }
    }

    return {
      success: matches.length,
      failed,
      matches,
    };
  }

  /**
   * Get all experts in RUSHING status for auto-matching
   */
  async getRushingExperts(): Promise<IndividualExpert[]> {
    return this.expertRepository.find({
      where: {
        registrationStatus: RegistrationStatus.APPROVED,
        isAvailable: true,
        workStatus: ExpertWorkStatus.RUSHING,
      },
      order: {
        rushingStartedAt: 'ASC', // Longest waiting first
        membershipLevel: 'DESC', // Higher membership priority
      },
    });
  }

  /**
   * Auto-match RUSHING experts to new/open service requests
   * This should be called periodically (e.g., every 5 minutes) or on new request creation
   */
  async autoMatchRushingExperts(serviceRequestId?: string): Promise<{
    requestsProcessed: number;
    matchesCreated: number;
    rushingExpertsNotified: number;
  }> {
    // Get all RUSHING experts
    const rushingExperts = await this.getRushingExperts();

    if (rushingExperts.length === 0) {
      return { requestsProcessed: 0, matchesCreated: 0, rushingExpertsNotified: 0 };
    }

    // Get open service requests
    let serviceRequests: ServiceRequest[];
    if (serviceRequestId) {
      const request = await this.serviceRequestRepository.findOne({
        where: { id: serviceRequestId, status: ServiceRequestStatus.OPEN },
      });
      serviceRequests = request ? [request] : [];
    } else {
      serviceRequests = await this.serviceRequestRepository.find({
        where: {
          status: ServiceRequestStatus.OPEN,
          isPublic: true,
        },
        order: { createdAt: 'DESC' },
        take: 50, // Limit to recent requests
      });
    }

    let matchesCreated = 0;
    const notifiedExperts = new Set<string>();

    for (const request of serviceRequests) {
      for (const expert of rushingExperts) {
        // Check if match already exists
        const existing = await this.matchResultRepository.findOne({
          where: { expertId: expert.id, serviceRequestId: request.id },
        });

        if (existing) {
          continue;
        }

        const { totalScore, breakdown, distanceKm } = this.calculateMatchScore(expert, request);

        // RUSHING experts have lower threshold
        const rushingThreshold = MINIMUM_MATCH_SCORE - 10;

        if (totalScore >= rushingThreshold) {
          const matchResult = this.matchResultRepository.create({
            matchType: ExpertMatchType.SERVICE_TO_EXPERT,
            expertId: expert.id,
            serviceRequestId: request.id,
            matchSource: MatchSource.AI_MATCHED,
            totalScore,
            scoreBreakdown: breakdown,
            distanceKm: distanceKm ?? undefined,
            status: ExpertMatchStatus.NEW,
            expertNotified: false,
          });

          await this.matchResultRepository.save(matchResult);
          matchesCreated++;
          notifiedExperts.add(expert.id);
        }
      }
    }

    return {
      requestsProcessed: serviceRequests.length,
      matchesCreated,
      rushingExpertsNotified: notifiedExperts.size,
    };
  }

  /**
   * Get recommended experts for a service request with keyword search
   * Used by admin to find experts to push to
   */
  async searchExpertsForRequest(
    serviceRequestId: string,
    options: {
      keyword?: string;
      workStatus?: ExpertWorkStatus;
      minScore?: number;
      limit?: number;
    } = {}
  ): Promise<
    Array<{
      expert: IndividualExpert;
      score: number;
      breakdown: ScoreBreakdown;
      distanceKm: number | null;
      hasExistingMatch: boolean;
    }>
  > {
    const serviceRequest = await this.serviceRequestRepository.findOne({
      where: { id: serviceRequestId },
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    // Build expert query
    const queryBuilder = this.expertRepository
      .createQueryBuilder('expert')
      .where('expert.registrationStatus = :status', { status: RegistrationStatus.APPROVED })
      .andWhere('expert.isAvailable = :available', { available: true });

    // Filter by work status if specified
    if (options.workStatus) {
      queryBuilder.andWhere('expert.workStatus = :workStatus', { workStatus: options.workStatus });
    } else {
      // Exclude OFF_DUTY experts
      queryBuilder.andWhere('expert.workStatus != :offDuty', {
        offDuty: ExpertWorkStatus.OFF_DUTY,
      });
    }

    // Keyword search in expert profile
    if (options.keyword) {
      const keyword = `%${options.keyword.toLowerCase()}%`;
      queryBuilder.andWhere(
        `(LOWER(expert.personalName) LIKE :keyword OR
          LOWER(expert.professionalField) LIKE :keyword OR
          LOWER(expert.servicesOffered) LIKE :keyword OR
          EXISTS (SELECT 1 FROM jsonb_array_elements_text(expert.skillTags) as tag WHERE LOWER(tag) LIKE :keyword))`,
        { keyword }
      );
    }

    // Order by RUSHING first, then by rating
    queryBuilder
      .orderBy(
        `
      CASE
        WHEN expert.workStatus = '${ExpertWorkStatus.RUSHING}' THEN 1
        WHEN expert.workStatus = '${ExpertWorkStatus.IDLE}' THEN 2
        ELSE 3
      END`,
        'ASC'
      )
      .addOrderBy('expert.avgRating', 'DESC', 'NULLS LAST')
      .take(options.limit || 50);

    const experts = await queryBuilder.getMany();

    // Calculate scores and check existing matches
    const results = await Promise.all(
      experts.map(async (expert) => {
        const { totalScore, breakdown, distanceKm } = this.calculateMatchScore(
          expert,
          serviceRequest
        );

        const existingMatch = await this.matchResultRepository.findOne({
          where: { expertId: expert.id, serviceRequestId },
        });

        return {
          expert,
          score: totalScore,
          breakdown,
          distanceKm,
          hasExistingMatch: !!existingMatch,
        };
      })
    );

    // Filter by minimum score if specified
    const minScore = options.minScore || 0;
    return results.filter((r) => r.score >= minScore).sort((a, b) => b.score - a.score);
  }

  /**
   * Get pending notifications (matches not yet notified)
   */
  async getPendingNotifications(expertId?: string): Promise<ExpertMatchResult[]> {
    const where: any = { expertNotified: false, status: ExpertMatchStatus.NEW };
    if (expertId) {
      where.expertId = expertId;
    }

    return this.matchResultRepository.find({
      where,
      relations: ['serviceRequest', 'expert'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Mark matches as notified
   */
  async markAsNotified(matchIds: string[]): Promise<void> {
    await this.matchResultRepository.update(
      { id: In(matchIds) },
      { expertNotified: true, updatedAt: new Date() }
    );
  }
}
