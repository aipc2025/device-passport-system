import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpertMatchingService } from './expert-matching.service';
import { ServiceRequest, IndividualExpert, ExpertMatchResult } from '../../database/entities';
import {
  ServiceRequestStatus,
  ServiceType,
  ExpertWorkStatus,
  ExpertMembershipLevel,
  RegistrationStatus,
  ExpertMatchStatus,
  ExpertMatchType,
  MatchSource,
} from '@device-passport/shared';

describe('ExpertMatchingService', () => {
  let service: ExpertMatchingService;
  let serviceRequestRepository: jest.Mocked<Repository<ServiceRequest>>;
  let expertRepository: jest.Mocked<Repository<IndividualExpert>>;
  let matchResultRepository: jest.Mocked<Repository<ExpertMatchResult>>;

  const mockServiceRequest: Partial<ServiceRequest> = {
    id: 'request-123',
    requestCode: 'SR-2601-000001',
    title: 'PLC Programming Service',
    description: 'Need PLC programming for Siemens S7-1500',
    serviceType: ServiceType.INSTALLATION,
    status: ServiceRequestStatus.OPEN,
    requiredSkills: ['PLC', 'Siemens', 'S7-1500'],
    serviceLocation: 'Shanghai Factory',
    locationLat: 31.2304,
    locationLng: 121.4737,
    budgetMin: 5000,
    budgetMax: 10000,
  };

  const mockExpert1: Partial<IndividualExpert> = {
    id: 'expert-1',
    userId: 'user-1',
    personalName: 'Zhang Wei',
    expertCode: 'EP-TECH-2601-000001-A7',
    registrationStatus: RegistrationStatus.APPROVED,
    isAvailable: true,
    workStatus: ExpertWorkStatus.IDLE,
    membershipLevel: ExpertMembershipLevel.GOLD,
    skillTags: ['PLC', 'Siemens', 'S7-1500', 'Industrial Automation'],
    yearsOfExperience: 8,
    avgRating: 4.8,
    totalReviews: 25,
    completedServices: 25,
    serviceRadius: 100,
    currentLocation: 'Shanghai',
    locationLat: 31.25,
    locationLng: 121.5,
    professionalField: 'Industrial Automation',
    servicesOffered: 'PLC Programming, Installation',
    certifications: ['Siemens Certified'],
  };

  const mockExpert2: Partial<IndividualExpert> = {
    id: 'expert-2',
    userId: 'user-2',
    personalName: 'Li Ming',
    expertCode: 'EP-TECH-2601-000002-B8',
    registrationStatus: RegistrationStatus.APPROVED,
    isAvailable: true,
    workStatus: ExpertWorkStatus.RUSHING,
    membershipLevel: ExpertMembershipLevel.DIAMOND,
    skillTags: ['PLC', 'HMI'],
    yearsOfExperience: 5,
    avgRating: 4.5,
    totalReviews: 15,
    completedServices: 15,
    serviceRadius: 50,
    currentLocation: 'Beijing',
    locationLat: 39.9042,
    locationLng: 116.4074,
    professionalField: 'PLC Programming',
    servicesOffered: 'PLC, HMI',
    certifications: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpertMatchingService,
        {
          provide: getRepositoryToken(ServiceRequest),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(IndividualExpert),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ExpertMatchResult),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExpertMatchingService>(ExpertMatchingService);
    serviceRequestRepository = module.get(getRepositoryToken(ServiceRequest));
    expertRepository = module.get(getRepositoryToken(IndividualExpert));
    matchResultRepository = module.get(getRepositoryToken(ExpertMatchResult));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('matchExpertsToServiceRequest', () => {
    it('should match experts to a service request successfully', async () => {
      serviceRequestRepository.findOne.mockResolvedValue(mockServiceRequest as ServiceRequest);
      expertRepository.find.mockResolvedValue([mockExpert1 as IndividualExpert]);
      matchResultRepository.findOne.mockResolvedValue(null);
      matchResultRepository.create.mockImplementation((data) => data as any);
      matchResultRepository.save.mockImplementation((data) =>
        Promise.resolve({ ...data, id: 'match-123' } as any)
      );

      const results = await service.matchExpertsToServiceRequest('request-123');

      expect(results).toBeDefined();
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].expertId).toBe('expert-1');
      expect(results[0].serviceRequestId).toBe('request-123');
      expect(results[0].totalScore).toBeGreaterThan(0);
    });

    it('should return empty array if service request not found', async () => {
      serviceRequestRepository.findOne.mockResolvedValue(null);

      const results = await service.matchExpertsToServiceRequest('invalid-id');

      expect(results).toEqual([]);
    });

    it('should return empty array if service request not OPEN', async () => {
      const closedRequest = {
        ...mockServiceRequest,
        status: ServiceRequestStatus.COMPLETED,
      };
      serviceRequestRepository.findOne.mockResolvedValue(closedRequest as ServiceRequest);

      const results = await service.matchExpertsToServiceRequest('request-123');

      expect(results).toEqual([]);
    });

    it('should skip experts that are already matched', async () => {
      serviceRequestRepository.findOne.mockResolvedValue(mockServiceRequest as ServiceRequest);
      expertRepository.find.mockResolvedValue([mockExpert1 as IndividualExpert]);
      matchResultRepository.findOne.mockResolvedValue({
        id: 'existing-match',
      } as any);

      const results = await service.matchExpertsToServiceRequest('request-123');

      expect(results).toEqual([]);
      expect(matchResultRepository.create).not.toHaveBeenCalled();
    });

    it('should only match experts with score >= minimum threshold', async () => {
      const lowSkillExpert = {
        ...mockExpert1,
        skillTags: ['different', 'skills'],
        locationLat: 50.0, // Very far away
        locationLng: 150.0,
        avgRating: 2.0,
        yearsOfExperience: 1,
      };

      serviceRequestRepository.findOne.mockResolvedValue(mockServiceRequest as ServiceRequest);
      expertRepository.find.mockResolvedValue([lowSkillExpert as IndividualExpert]);
      matchResultRepository.findOne.mockResolvedValue(null);

      const results = await service.matchExpertsToServiceRequest('request-123');

      // Should return empty because score is below threshold
      expect(results).toEqual([]);
    });
  });

  describe('calculateMatchScore', () => {
    it('should calculate match score with all components', () => {
      const result = service.calculateMatchScore(
        mockExpert1 as IndividualExpert,
        mockServiceRequest as ServiceRequest
      );

      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.locationScore).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.skillScore).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.experienceScore).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.availabilityScore).toBeGreaterThanOrEqual(0);
      expect(result.breakdown.ratingScore).toBeGreaterThanOrEqual(0);
    });

    it('should give higher scores to experts with matching skills', () => {
      const expertWithMatchingSkills = {
        ...mockExpert1,
        skillTags: ['PLC', 'Siemens', 'S7-1500'], // Perfect match
      };

      const expertWithFewSkills = {
        ...mockExpert1,
        skillTags: ['PLC'], // Partial match
      };

      const result1 = service.calculateMatchScore(
        expertWithMatchingSkills as IndividualExpert,
        mockServiceRequest as ServiceRequest
      );

      const result2 = service.calculateMatchScore(
        expertWithFewSkills as IndividualExpert,
        mockServiceRequest as ServiceRequest
      );

      expect(result1.breakdown.skillScore).toBeGreaterThan(result2.breakdown.skillScore);
    });

    it('should give location bonus to nearby experts', () => {
      const nearExpert = {
        ...mockExpert1,
        locationLat: 31.2304, // Same location as request
        locationLng: 121.4737,
      };

      const farExpert = {
        ...mockExpert1,
        locationLat: 39.9042, // Beijing (very far)
        locationLng: 116.4074,
      };

      const result1 = service.calculateMatchScore(
        nearExpert as IndividualExpert,
        mockServiceRequest as ServiceRequest
      );

      const result2 = service.calculateMatchScore(
        farExpert as IndividualExpert,
        mockServiceRequest as ServiceRequest
      );

      expect(result1.breakdown.locationScore).toBeGreaterThan(result2.breakdown.locationScore);
      expect(result1.distanceKm).toBeLessThan(result2.distanceKm || 999999);
    });

    it('should give higher scores to more experienced experts', () => {
      const experiencedExpert = {
        ...mockExpert1,
        yearsOfExperience: 10,
      };

      const juniorExpert = {
        ...mockExpert1,
        yearsOfExperience: 2,
      };

      const result1 = service.calculateMatchScore(
        experiencedExpert as IndividualExpert,
        mockServiceRequest as ServiceRequest
      );

      const result2 = service.calculateMatchScore(
        juniorExpert as IndividualExpert,
        mockServiceRequest as ServiceRequest
      );

      expect(result1.breakdown.experienceScore).toBeGreaterThan(result2.breakdown.experienceScore);
    });

    it('should give bonus to experts in RUSHING status', () => {
      const rushingExpert = {
        ...mockExpert1,
        workStatus: ExpertWorkStatus.RUSHING,
      };

      const idleExpert = {
        ...mockExpert1,
        workStatus: ExpertWorkStatus.IDLE,
      };

      const result1 = service.calculateMatchScore(
        rushingExpert as IndividualExpert,
        mockServiceRequest as ServiceRequest
      );

      const result2 = service.calculateMatchScore(
        idleExpert as IndividualExpert,
        mockServiceRequest as ServiceRequest
      );

      expect(result1.totalScore).toBeGreaterThan(result2.totalScore);
    });

    it('should give bonus to higher membership levels', () => {
      const diamondExpert = {
        ...mockExpert1,
        membershipLevel: ExpertMembershipLevel.DIAMOND,
      };

      const standardExpert = {
        ...mockExpert1,
        membershipLevel: ExpertMembershipLevel.STANDARD,
      };

      const result1 = service.calculateMatchScore(
        diamondExpert as IndividualExpert,
        mockServiceRequest as ServiceRequest
      );

      const result2 = service.calculateMatchScore(
        standardExpert as IndividualExpert,
        mockServiceRequest as ServiceRequest
      );

      expect(result1.totalScore).toBeGreaterThan(result2.totalScore);
    });

    it('should give higher rating score to higher rated experts', () => {
      const highRatedExpert = {
        ...mockExpert1,
        avgRating: 5.0,
        totalReviews: 50,
      };

      const lowRatedExpert = {
        ...mockExpert1,
        avgRating: 3.0,
        totalReviews: 10,
      };

      const result1 = service.calculateMatchScore(
        highRatedExpert as IndividualExpert,
        mockServiceRequest as ServiceRequest
      );

      const result2 = service.calculateMatchScore(
        lowRatedExpert as IndividualExpert,
        mockServiceRequest as ServiceRequest
      );

      expect(result1.breakdown.ratingScore).toBeGreaterThan(result2.breakdown.ratingScore);
    });
  });

  describe('calculateLocationScore', () => {
    it('should return maximum score for very close experts (< 50km)', () => {
      const nearExpert = {
        ...mockExpert1,
        locationLat: 31.2304, // Same location
        locationLng: 121.4737,
      };

      const result = (service as any).calculateLocationScore(nearExpert, mockServiceRequest);

      expect(result.locationScore).toBe(100); // Raw maximum score
      expect(result.distanceKm).toBeLessThan(10);
    });

    it('should return 0 score if distance > service radius', () => {
      const farExpert = {
        ...mockExpert1,
        locationLat: 50.0,
        locationLng: 150.0,
        serviceRadius: 50, // 50km radius
      };

      const result = (service as any).calculateLocationScore(farExpert, mockServiceRequest);

      expect(result.locationScore).toBe(0);
    });

    it('should return 50 if no location data available', () => {
      const expertNoLocation = {
        ...mockExpert1,
        locationLat: null,
        locationLng: null,
      };

      const result = (service as any).calculateLocationScore(expertNoLocation, mockServiceRequest);

      expect(result.locationScore).toBe(50); // Default score
      expect(result.distanceKm).toBeNull();
    });
  });

  describe('calculateSkillScore', () => {
    it('should return maximum score for perfect skill match', () => {
      const expertPerfectSkills = {
        ...mockExpert1,
        skillTags: ['PLC', 'Siemens', 'S7-1500'], // All required skills
      };

      const score = (service as any).calculateSkillScore(expertPerfectSkills, mockServiceRequest);

      expect(score).toBe(100); // Raw maximum score
    });

    it('should return 0 for no matching skills', () => {
      const expertNoSkills = {
        ...mockExpert1,
        skillTags: ['cooking', 'painting'], // Completely different
      };

      const score = (service as any).calculateSkillScore(expertNoSkills, mockServiceRequest);

      expect(score).toBe(0);
    });

    it('should return partial score for partial skill match', () => {
      const expertPartialSkills = {
        ...mockExpert1,
        skillTags: ['PLC'], // Only 1 out of 3 skills
      };

      const score = (service as any).calculateSkillScore(expertPartialSkills, mockServiceRequest);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
      expect(score).toBeCloseTo(33, 0); // ~33% match
    });
  });

  describe('calculateExperienceScore', () => {
    it('should return maximum score for 10+ years experience', () => {
      const expertVeryExperienced = {
        ...mockExpert1,
        yearsOfExperience: 15,
      };

      const score = (service as any).calculateExperienceScore(expertVeryExperienced);

      expect(score).toBe(100); // Raw maximum score
    });

    it('should return 20 for 0 years experience', () => {
      const expertNoExperience = {
        ...mockExpert1,
        yearsOfExperience: 0,
      };

      const score = (service as any).calculateExperienceScore(expertNoExperience);

      expect(score).toBe(20); // Minimum score
    });

    it('should return 80 for 5 years experience', () => {
      const expertMidLevel = {
        ...mockExpert1,
        yearsOfExperience: 5,
      };

      const score = (service as any).calculateExperienceScore(expertMidLevel);

      expect(score).toBe(80); // 5 years = 80 per implementation
    });
  });

  describe('calculateAvailabilityScore', () => {
    it('should return 100 for available expert with recent location update', () => {
      const availableExpert = {
        ...mockExpert1,
        isAvailable: true,
        lastLocationUpdateAt: new Date(), // Updated just now
      };

      const score = (service as any).calculateAvailabilityScore(availableExpert);

      expect(score).toBe(100); // Updated within last hour
    });

    it('should return 0 for unavailable expert', () => {
      const unavailableExpert = {
        ...mockExpert1,
        isAvailable: false,
      };

      const score = (service as any).calculateAvailabilityScore(unavailableExpert);

      expect(score).toBe(0);
    });

    it('should return 50 for available expert with no location update', () => {
      const expertNoUpdate = {
        ...mockExpert1,
        isAvailable: true,
        lastLocationUpdateAt: null,
      };

      const score = (service as any).calculateAvailabilityScore(expertNoUpdate);

      expect(score).toBe(50); // Default for no recent update
    });
  });

  describe('calculateRatingScore', () => {
    it('should return maximum score for 5.0 rating with many reviews', () => {
      const topRatedExpert = {
        ...mockExpert1,
        avgRating: 5.0,
        totalReviews: 100,
      };

      const score = (service as any).calculateRatingScore(topRatedExpert);

      expect(score).toBe(100); // Raw maximum score
    });

    it('should return 50 for no rating', () => {
      const noRatingExpert = {
        ...mockExpert1,
        avgRating: 0,
        totalReviews: 0,
      };

      const score = (service as any).calculateRatingScore(noRatingExpert);

      expect(score).toBe(50); // Default for no ratings
    });

    it('should penalize low review count', () => {
      const fewReviewsExpert = {
        ...mockExpert1,
        avgRating: 5.0,
        totalReviews: 2, // Very few reviews
      };

      const manyReviewsExpert = {
        ...mockExpert1,
        avgRating: 5.0,
        totalReviews: 50,
      };

      const score1 = (service as any).calculateRatingScore(fewReviewsExpert);
      const score2 = (service as any).calculateRatingScore(manyReviewsExpert);

      expect(score2).toBeGreaterThan(score1);
      // With 2 reviews: reviewConfidence = 0.2, adjustedRating = 5 * (0.7 + 0.3 * 0.2) = 3.8, score = 76
      expect(score1).toBeCloseTo(76, 0);
      // With 50 reviews: reviewConfidence = 1.0, adjustedRating = 5 * (0.7 + 0.3 * 1) = 5, score = 100
      expect(score2).toBe(100);
    });
  });
});
