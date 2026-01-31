import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  ServiceRequest,
  IndividualExpert,
  ExpertMatchResult,
} from '../../database/entities';
import {
  ServiceRequestStatus,
  ExpertMatchType,
  ExpertMatchStatus,
  MatchSource,
  RegistrationStatus,
} from '@device-passport/shared';

interface ScoreBreakdown {
  locationScore: number;
  skillScore: number;
  experienceScore: number;
  availabilityScore: number;
  ratingScore: number;
}

// Matching weights (total 100)
const WEIGHTS = {
  LOCATION: 30,
  SKILLS: 25,
  EXPERIENCE: 15,
  AVAILABILITY: 15,
  RATING: 15,
};

// Minimum score threshold for creating a match
const MINIMUM_MATCH_SCORE = 40;

@Injectable()
export class ExpertMatchingService {
  constructor(
    @InjectRepository(ServiceRequest)
    private serviceRequestRepository: Repository<ServiceRequest>,
    @InjectRepository(IndividualExpert)
    private expertRepository: Repository<IndividualExpert>,
    @InjectRepository(ExpertMatchResult)
    private matchResultRepository: Repository<ExpertMatchResult>,
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
        serviceRequest,
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
    serviceRequest: ServiceRequest,
  ): { totalScore: number; breakdown: ScoreBreakdown; distanceKm: number | null } {
    // 1. Location Score (30%)
    const { locationScore, distanceKm } = this.calculateLocationScore(
      expert,
      serviceRequest,
    );

    // 2. Skills Score (25%)
    const skillScore = this.calculateSkillScore(expert, serviceRequest);

    // 3. Experience Score (15%)
    const experienceScore = this.calculateExperienceScore(expert);

    // 4. Availability Score (15%)
    const availabilityScore = this.calculateAvailabilityScore(expert);

    // 5. Rating Score (15%)
    const ratingScore = this.calculateRatingScore(expert);

    // Calculate total weighted score
    const totalScore =
      (locationScore * WEIGHTS.LOCATION +
        skillScore * WEIGHTS.SKILLS +
        experienceScore * WEIGHTS.EXPERIENCE +
        availabilityScore * WEIGHTS.AVAILABILITY +
        ratingScore * WEIGHTS.RATING) /
      100;

    const breakdown: ScoreBreakdown = {
      locationScore: Math.round(locationScore * WEIGHTS.LOCATION) / 100,
      skillScore: Math.round(skillScore * WEIGHTS.SKILLS) / 100,
      experienceScore: Math.round(experienceScore * WEIGHTS.EXPERIENCE) / 100,
      availabilityScore: Math.round(availabilityScore * WEIGHTS.AVAILABILITY) / 100,
      ratingScore: Math.round(ratingScore * WEIGHTS.RATING) / 100,
    };

    return {
      totalScore: Math.round(totalScore * 100) / 100,
      breakdown,
      distanceKm,
    };
  }

  /**
   * Calculate location-based score
   * <50km = 100, <100km = 90, <200km = 70, <500km = 50, <1000km = 30, >1000km = 10
   */
  private calculateLocationScore(
    expert: IndividualExpert,
    serviceRequest: ServiceRequest,
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
      Number(serviceRequest.locationLng),
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
  private calculateSkillScore(
    expert: IndividualExpert,
    serviceRequest: ServiceRequest,
  ): number {
    if (
      !serviceRequest.requiredSkills ||
      serviceRequest.requiredSkills.length === 0
    ) {
      return 70; // No specific skills required
    }

    if (!expert.skillTags || expert.skillTags.length === 0) {
      return 30; // Expert has no skills listed
    }

    // Calculate matching percentage
    const requiredSkills = serviceRequest.requiredSkills.map((s) =>
      s.toLowerCase(),
    );
    const expertSkills = expert.skillTags.map((s) => s.toLowerCase());

    let matchCount = 0;
    for (const required of requiredSkills) {
      // Check for exact match or partial match
      if (
        expertSkills.some(
          (skill) => skill.includes(required) || required.includes(skill),
        )
      ) {
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
        (Date.now() - new Date(expert.lastLocationUpdateAt).getTime()) /
        (1000 * 60 * 60);

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
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
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
  async getMatchesForExpert(
    expertId: string,
    limit = 50,
  ): Promise<ExpertMatchResult[]> {
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
    limit = 50,
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
    source: MatchSource,
  ): Promise<ExpertMatchResult> {
    const expert = await this.expertRepository.findOne({ where: { id: expertId } });
    const serviceRequest = await this.serviceRequestRepository.findOne({
      where: { id: serviceRequestId },
    });

    if (!expert || !serviceRequest) {
      throw new Error('Expert or service request not found');
    }

    const { totalScore, breakdown, distanceKm } = this.calculateMatchScore(
      expert,
      serviceRequest,
    );

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
}
