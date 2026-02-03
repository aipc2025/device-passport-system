import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import {
  IndividualExpert,
  ServiceOrder,
  ExpertMatchResult,
  ExpertServiceRecord,
  ExpertApplication,
  ExpertPassportSequence,
  ExpertWorkHistory,
} from '../../database/entities';
import {
  ExpertMatchStatus,
  ExpertApplicationStatus,
  ServiceRecordStatus,
  WorkHistoryVerificationStatus,
  IndustryCode,
  SkillCode,
  ExpertType,
  ExpertWorkStatus,
  ExpertMembershipLevel,
  getCreditLevelFromScore,
  generateExpertPassportCode,
  determineExpertTypeCode,
} from '@device-passport/shared';

@Injectable()
export class ExpertService {
  constructor(
    @InjectRepository(IndividualExpert)
    private expertRepository: Repository<IndividualExpert>,
    @InjectRepository(ServiceOrder)
    private serviceOrderRepository: Repository<ServiceOrder>,
    @InjectRepository(ExpertMatchResult)
    private matchResultRepository: Repository<ExpertMatchResult>,
    @InjectRepository(ExpertServiceRecord)
    private serviceRecordRepository: Repository<ExpertServiceRecord>,
    @InjectRepository(ExpertApplication)
    private applicationRepository: Repository<ExpertApplication>,
    @InjectRepository(ExpertPassportSequence)
    private passportSequenceRepository: Repository<ExpertPassportSequence>,
    @InjectRepository(ExpertWorkHistory)
    private workHistoryRepository: Repository<ExpertWorkHistory>,
    private dataSource: DataSource
  ) {}

  async getProfile(expertId: string, userId: string): Promise<IndividualExpert> {
    const expert = await this.expertRepository.findOne({
      where: { id: expertId },
      relations: ['user'],
    });

    if (!expert) {
      throw new NotFoundException('Expert profile not found');
    }

    // Verify the user owns this profile
    if (expert.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this profile');
    }

    return expert;
  }

  async updateProfile(
    expertId: string,
    userId: string,
    data: Partial<IndividualExpert>
  ): Promise<IndividualExpert> {
    const expert = await this.getProfile(expertId, userId);

    // Don't allow updating certain fields
    const {
      id,
      userId: _,
      registrationStatus,
      adminNotes,
      reviewedBy,
      reviewedAt,
      createdAt,
      updatedAt,
      ...updateData
    } = data as any;

    Object.assign(expert, updateData);
    return this.expertRepository.save(expert);
  }

  async adminUpdateProfile(
    expertId: string,
    data: Partial<IndividualExpert>
  ): Promise<IndividualExpert> {
    const expert = await this.expertRepository.findOne({
      where: { id: expertId },
    });

    if (!expert) {
      throw new NotFoundException('Expert profile not found');
    }

    // Don't allow updating certain fields
    const { id, userId, createdAt, updatedAt, ...updateData } = data as any;

    Object.assign(expert, updateData);
    return this.expertRepository.save(expert);
  }

  async getServiceRecords(expertId: string, userId: string): Promise<any[]> {
    // First verify the expert profile belongs to the user
    await this.getProfile(expertId, userId);

    // Get service orders assigned to this expert (as engineer)
    const serviceOrders = await this.serviceOrderRepository.find({
      where: { assignedEngineerId: userId },
      relations: ['passport', 'customer', 'creator'],
      order: { createdAt: 'DESC' },
    });

    // Transform to service records format
    return serviceOrders.map((order) => ({
      id: order.id,
      serviceOrderId: order.id,
      serviceOrderCode: order.orderNumber,
      title: order.title,
      description: order.description,
      customerName: order.contactName || order.customerName || 'Unknown',
      customerOrganization: order.customer?.name,
      location: order.serviceAddress,
      serviceDate: order.scheduledDate,
      completedAt: order.completedDate,
      status: order.status,
      // Note: Rating/review fields would need to be added to the entity if needed
      rating: undefined,
      review: undefined,
      reviewedAt: undefined,
    }));
  }

  async getMatches(
    expertId: string,
    userId: string,
    options?: {
      status?: ExpertMatchStatus;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    matches: any[];
    total: number;
  }> {
    // Verify the expert profile belongs to the user
    await this.getProfile(expertId, userId);

    const query = this.matchResultRepository
      .createQueryBuilder('match')
      .leftJoinAndSelect('match.serviceRequest', 'serviceRequest')
      .leftJoinAndSelect('serviceRequest.requester', 'requester')
      .where('match.expertId = :expertId', { expertId })
      .orderBy('match.createdAt', 'DESC');

    // Filter by status if provided
    if (options?.status) {
      query.andWhere('match.status = :status', { status: options.status });
    } else {
      // By default, exclude dismissed matches
      query.andWhere('match.status != :dismissedStatus', {
        dismissedStatus: ExpertMatchStatus.DISMISSED,
      });
    }

    const total = await query.getCount();

    if (options?.limit) {
      query.take(options.limit);
    } else {
      query.take(50); // Default limit
    }

    if (options?.offset) {
      query.skip(options.offset);
    }

    const matches = await query.getMany();

    // Mark matches as viewed if they are new
    const newMatchIds = matches
      .filter((m) => m.status === ExpertMatchStatus.NEW)
      .map((m) => m.id);

    if (newMatchIds.length > 0) {
      await this.matchResultRepository.update(
        { id: In(newMatchIds) },
        {
          status: ExpertMatchStatus.VIEWED,
          expertViewedAt: new Date(),
        }
      );
    }

    return {
      matches: matches.map((match) => ({
        id: match.id,
        matchType: match.matchType,
        matchSource: match.matchSource,
        totalScore: match.totalScore,
        scoreBreakdown: match.scoreBreakdown,
        distanceKm: match.distanceKm,
        status: match.status,
        serviceRequest: match.serviceRequest
          ? {
              id: match.serviceRequest.id,
              requestCode: match.serviceRequest.requestCode,
              title: match.serviceRequest.title,
              description: match.serviceRequest.description,
              urgency: match.serviceRequest.urgency,
              serviceLocation: match.serviceRequest.serviceLocation,
              requiredSkills: match.serviceRequest.requiredSkills,
              budgetMin: match.serviceRequest.budgetMin,
              budgetMax: match.serviceRequest.budgetMax,
              budgetCurrency: match.serviceRequest.budgetCurrency,
              preferredDate: match.serviceRequest.preferredDate,
              status: match.serviceRequest.status,
              createdAt: match.serviceRequest.createdAt,
              contactName: match.serviceRequest.contactName,
            }
          : null,
        expertNotified: match.expertNotified,
        expertViewedAt: match.expertViewedAt,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt,
      })),
      total,
    };
  }

  async dismissMatch(matchId: string, userId: string): Promise<void> {
    const match = await this.matchResultRepository.findOne({
      where: { id: matchId },
      relations: ['expert'],
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Verify the user owns this expert profile
    if (match.expert.userId !== userId) {
      throw new ForbiddenException('Not authorized to dismiss this match');
    }

    // Cannot dismiss already applied matches
    if (match.status === ExpertMatchStatus.APPLIED) {
      throw new BadRequestException('Cannot dismiss an already applied match');
    }

    match.status = ExpertMatchStatus.DISMISSED;
    await this.matchResultRepository.save(match);
  }

  async acceptMatch(matchId: string, userId: string): Promise<ExpertMatchResult> {
    const match = await this.matchResultRepository.findOne({
      where: { id: matchId },
      relations: ['expert', 'serviceRequest'],
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Verify the user owns this expert profile
    if (match.expert.userId !== userId) {
      throw new ForbiddenException('Not authorized to accept this match');
    }

    // Can only accept if status is NEW or VIEWED
    if (
      match.status !== ExpertMatchStatus.NEW &&
      match.status !== ExpertMatchStatus.VIEWED
    ) {
      throw new BadRequestException(
        `Cannot accept match with status ${match.status}`
      );
    }

    match.status = ExpertMatchStatus.APPLIED;
    return this.matchResultRepository.save(match);
  }

  // ==========================================
  // Location & Availability Methods
  // ==========================================

  async updateLocation(
    expertId: string,
    userId: string,
    data: { latitude?: number; longitude?: number; currentLocation?: string }
  ): Promise<IndividualExpert> {
    const expert = await this.getProfile(expertId, userId);

    if (data.latitude !== undefined) {
      expert.locationLat = data.latitude;
    }
    if (data.longitude !== undefined) {
      expert.locationLng = data.longitude;
    }
    if (data.currentLocation !== undefined) {
      expert.currentLocation = data.currentLocation;
    }
    expert.lastLocationUpdateAt = new Date();

    return this.expertRepository.save(expert);
  }

  async updateAvailability(
    expertId: string,
    userId: string,
    data: { isAvailable?: boolean; serviceRadius?: number }
  ): Promise<IndividualExpert> {
    const expert = await this.getProfile(expertId, userId);

    if (data.isAvailable !== undefined) {
      expert.isAvailable = data.isAvailable;
    }
    if (data.serviceRadius !== undefined) {
      expert.serviceRadius = data.serviceRadius;
    }

    return this.expertRepository.save(expert);
  }

  async updateSkills(
    expertId: string,
    userId: string,
    skillTags: string[]
  ): Promise<IndividualExpert> {
    const expert = await this.getProfile(expertId, userId);
    expert.skillTags = skillTags;
    return this.expertRepository.save(expert);
  }

  // ==========================================
  // Dashboard Stats
  // ==========================================

  async getDashboardStats(
    expertId: string,
    userId: string
  ): Promise<{
    candidateOrders: number;
    acceptedOrders: number;
    inProgressOrders: number;
    recentOrders: any[];
  }> {
    // Verify the expert profile belongs to the user
    const expert = await this.getProfile(expertId, userId);

    // 1. 候选订单数 - Candidate orders (new matches)
    const candidateOrders = await this.matchResultRepository.count({
      where: {
        expertId: expert.id,
        status: In([ExpertMatchStatus.NEW, ExpertMatchStatus.VIEWED]),
      },
    });

    // 2. 已接单数 - Accepted applications
    const acceptedOrders = await this.applicationRepository.count({
      where: {
        expertId: expert.id,
        status: ExpertApplicationStatus.ACCEPTED,
      },
    });

    // 3. 处理中工单 - Service records in progress
    const inProgressOrders = await this.serviceRecordRepository.count({
      where: {
        expertId: expert.id,
        status: In([ServiceRecordStatus.PENDING, ServiceRecordStatus.IN_PROGRESS]),
      },
    });

    // 4. 最近工单列表 - Recent service records with status
    const recentOrders = await this.serviceRecordRepository.find({
      where: { expertId: expert.id },
      relations: ['serviceRequest', 'customerOrg'],
      order: { updatedAt: 'DESC' },
      take: 10,
    });

    return {
      candidateOrders,
      acceptedOrders,
      inProgressOrders,
      recentOrders: recentOrders.map((record) => ({
        id: record.id,
        recordCode: record.recordCode,
        serviceTitle: record.serviceTitle,
        serviceType: record.serviceType,
        status: record.status,
        agreedPrice: record.agreedPrice,
        priceCurrency: record.priceCurrency,
        customerName: record.customerOrg?.name || 'Unknown',
        scheduledStart: record.scheduledStart,
        actualStart: record.actualStart,
        completedAt: record.completedAt,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      })),
    };
  }

  // ==========================================
  // Public lookup (for scanning)
  // ==========================================

  async getPublicProfile(expertCode: string): Promise<any | null> {
    const expert = await this.expertRepository.findOne({
      where: { expertCode },
      relations: ['workHistories'],
    });

    if (!expert) {
      return null;
    }

    // Only include public work histories or verified ones
    const publicWorkHistories =
      expert.workHistories
        ?.filter(
          (wh) => wh.isPublic || wh.verificationStatus === WorkHistoryVerificationStatus.VERIFIED
        )
        .map((wh) => ({
          id: wh.id,
          companyName: wh.companyName,
          position: wh.position,
          description: wh.description,
          startDate: wh.startDate,
          endDate: wh.endDate,
          isCurrent: wh.isCurrent,
          isVerified: wh.verificationStatus === WorkHistoryVerificationStatus.VERIFIED,
          verifiedAt: wh.verifiedAt,
        })) || [];

    // Return only public information
    return {
      expertCode: expert.expertCode,
      personalName: expert.personalName,
      expertTypes: expert.expertTypes,
      industries: expert.industries,
      skills: expert.skills,
      nationality: expert.nationality,
      professionalField: expert.professionalField,
      servicesOffered: expert.servicesOffered,
      yearsOfExperience: expert.yearsOfExperience,
      skillTags: expert.skillTags,
      certifications: expert.certifications,
      avgRating: expert.avgRating,
      totalReviews: expert.totalReviews,
      completedServices: expert.completedServices,
      isAvailable: expert.isAvailable,
      currentLocation: expert.currentLocation,
      registrationStatus: expert.registrationStatus,
      bio: expert.isProfilePublic ? expert.bio : null,
      workHistories: publicWorkHistories,
    };
  }

  // ==========================================
  // Expert Passport Code Generation
  // ==========================================

  async generatePassportCode(expertId: string): Promise<string> {
    const expert = await this.expertRepository.findOne({
      where: { id: expertId },
    });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    if (expert.expertCode) {
      throw new BadRequestException('Expert already has a passport code');
    }

    if (!expert.industries?.length || !expert.skills?.length) {
      throw new BadRequestException('Expert must have at least one industry and skill selected');
    }

    if (!expert.dateOfBirth) {
      throw new BadRequestException('Expert must have date of birth set');
    }

    if (!expert.nationality) {
      throw new BadRequestException('Expert must have nationality set');
    }

    // Get primary industry and skill (first selection)
    const primaryIndustry = expert.industries[0] as IndustryCode;
    const primarySkill = expert.skills[0] as SkillCode;
    const nationality = expert.nationality.toUpperCase();

    // Determine expert type code
    const hasTechnical = expert.expertTypes?.includes(ExpertType.TECHNICAL);
    const hasBusiness = expert.expertTypes?.includes(ExpertType.BUSINESS);
    const expertTypeCode = determineExpertTypeCode(hasTechnical, hasBusiness);

    // Get next sequence number using transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find or create sequence counter
      let sequenceCounter = await queryRunner.manager.findOne(ExpertPassportSequence, {
        where: {
          industryCode: primaryIndustry,
          skillCode: primarySkill,
          nationalityCode: nationality,
        },
      });

      if (!sequenceCounter) {
        sequenceCounter = queryRunner.manager.create(ExpertPassportSequence, {
          industryCode: primaryIndustry,
          skillCode: primarySkill,
          nationalityCode: nationality,
          currentSequence: 0,
        });
      }

      // Increment sequence
      sequenceCounter.currentSequence += 1;
      await queryRunner.manager.save(sequenceCounter);

      // Generate passport code
      // Ensure dateOfBirth is a Date object
      const dateOfBirth =
        expert.dateOfBirth instanceof Date ? expert.dateOfBirth : new Date(expert.dateOfBirth);

      const passportCode = generateExpertPassportCode(
        expertTypeCode,
        primaryIndustry,
        primarySkill,
        dateOfBirth,
        nationality,
        sequenceCounter.currentSequence
      );

      // Update expert with passport code
      expert.expertCode = passportCode;
      expert.expertCodeGeneratedAt = new Date();
      expert.expertTypeCode = expertTypeCode;
      await queryRunner.manager.save(expert);

      await queryRunner.commitTransaction();

      return passportCode;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ==========================================
  // Work History Management
  // ==========================================

  async getWorkHistories(expertId: string, userId: string): Promise<ExpertWorkHistory[]> {
    await this.getProfile(expertId, userId);

    return this.workHistoryRepository.find({
      where: { expertId },
      order: { startDate: 'DESC' },
    });
  }

  async addWorkHistory(
    expertId: string,
    userId: string,
    data: Partial<ExpertWorkHistory>
  ): Promise<ExpertWorkHistory> {
    await this.getProfile(expertId, userId);

    const workHistory = this.workHistoryRepository.create({
      ...data,
      expertId,
      verificationStatus: WorkHistoryVerificationStatus.UNVERIFIED,
    });

    return this.workHistoryRepository.save(workHistory);
  }

  async updateWorkHistory(
    workHistoryId: string,
    userId: string,
    data: Partial<ExpertWorkHistory>
  ): Promise<ExpertWorkHistory> {
    const workHistory = await this.workHistoryRepository.findOne({
      where: { id: workHistoryId },
      relations: ['expert'],
    });

    if (!workHistory) {
      throw new NotFoundException('Work history not found');
    }

    if (workHistory.expert.userId !== userId) {
      throw new ForbiddenException('Not authorized to update this work history');
    }

    // Don't allow updating verification-related fields
    const {
      id,
      expertId,
      verificationStatus,
      verificationRequestedAt,
      verifiedBy,
      verifiedAt,
      proofDocumentId,
      verificationNotes,
      rejectionReason,
      createdAt,
      updatedAt,
      ...updateData
    } = data as any;

    Object.assign(workHistory, updateData);
    return this.workHistoryRepository.save(workHistory);
  }

  async deleteWorkHistory(workHistoryId: string, userId: string): Promise<void> {
    const workHistory = await this.workHistoryRepository.findOne({
      where: { id: workHistoryId },
      relations: ['expert'],
    });

    if (!workHistory) {
      throw new NotFoundException('Work history not found');
    }

    if (workHistory.expert.userId !== userId) {
      throw new ForbiddenException('Not authorized to delete this work history');
    }

    await this.workHistoryRepository.remove(workHistory);
  }

  async requestVerification(workHistoryId: string, userId: string): Promise<ExpertWorkHistory> {
    const workHistory = await this.workHistoryRepository.findOne({
      where: { id: workHistoryId },
      relations: ['expert'],
    });

    if (!workHistory) {
      throw new NotFoundException('Work history not found');
    }

    if (workHistory.expert.userId !== userId) {
      throw new ForbiddenException('Not authorized to request verification');
    }

    if (workHistory.verificationStatus === WorkHistoryVerificationStatus.PENDING_VERIFICATION) {
      throw new BadRequestException('Verification already requested');
    }

    if (workHistory.verificationStatus === WorkHistoryVerificationStatus.VERIFIED) {
      throw new BadRequestException('Work history already verified');
    }

    // Require company contact info for verification
    if (!workHistory.companyContactEmail && !workHistory.companyContactPhone) {
      throw new BadRequestException(
        'Please provide company contact email or phone for verification'
      );
    }

    workHistory.verificationStatus = WorkHistoryVerificationStatus.PENDING_VERIFICATION;
    workHistory.verificationRequestedAt = new Date();

    return this.workHistoryRepository.save(workHistory);
  }

  // Admin method to verify/reject work history
  async processVerification(
    workHistoryId: string,
    adminUserId: string,
    approved: boolean,
    notes?: string,
    rejectionReason?: string,
    proofDocumentId?: string
  ): Promise<ExpertWorkHistory> {
    const workHistory = await this.workHistoryRepository.findOne({
      where: { id: workHistoryId },
    });

    if (!workHistory) {
      throw new NotFoundException('Work history not found');
    }

    if (approved) {
      workHistory.verificationStatus = WorkHistoryVerificationStatus.VERIFIED;
      workHistory.verifiedBy = adminUserId;
      workHistory.verifiedAt = new Date();
      if (notes) {
        workHistory.verificationNotes = notes;
      }
      if (proofDocumentId) {
        workHistory.proofDocumentId = proofDocumentId;
      }
    } else {
      workHistory.verificationStatus = WorkHistoryVerificationStatus.REJECTED;
      workHistory.verifiedBy = adminUserId;
      workHistory.verifiedAt = new Date();
      if (rejectionReason) {
        workHistory.rejectionReason = rejectionReason;
      }
      if (notes) {
        workHistory.verificationNotes = notes;
      }
    }

    return this.workHistoryRepository.save(workHistory);
  }

  // Get pending verifications for admin
  async getPendingVerifications(): Promise<ExpertWorkHistory[]> {
    return this.workHistoryRepository.find({
      where: { verificationStatus: WorkHistoryVerificationStatus.PENDING_VERIFICATION },
      relations: ['expert', 'expert.user'],
      order: { verificationRequestedAt: 'ASC' },
    });
  }

  // ==========================================
  // Work Status Management
  // ==========================================

  /**
   * Update expert work status
   * Only allows manual updates to RUSHING, IDLE, OFF_DUTY
   * BOOKED and IN_SERVICE are set automatically by the system
   */
  async updateWorkStatus(
    expertId: string,
    userId: string,
    status: ExpertWorkStatus
  ): Promise<IndividualExpert> {
    const expert = await this.getProfile(expertId, userId);

    // Only allow manual updates to certain statuses
    const allowedManualStatuses = [
      ExpertWorkStatus.RUSHING,
      ExpertWorkStatus.IDLE,
      ExpertWorkStatus.OFF_DUTY,
    ];

    if (!allowedManualStatuses.includes(status)) {
      throw new BadRequestException(
        `Cannot manually set status to ${status}. This status is set automatically by the system.`
      );
    }

    // Cannot change status if currently in service
    if (expert.workStatus === ExpertWorkStatus.IN_SERVICE) {
      throw new BadRequestException(
        'Cannot change status while currently in service. Complete the current service first.'
      );
    }

    // Cannot change status if booked (has pending services)
    if (expert.workStatus === ExpertWorkStatus.BOOKED && status === ExpertWorkStatus.OFF_DUTY) {
      throw new BadRequestException(
        'Cannot go off duty while having booked services. Cancel or complete pending services first.'
      );
    }

    // Update rushing start time
    if (status === ExpertWorkStatus.RUSHING && expert.workStatus !== ExpertWorkStatus.RUSHING) {
      expert.rushingStartedAt = new Date();
    } else if (status !== ExpertWorkStatus.RUSHING) {
      expert.rushingStartedAt = null;
    }

    expert.workStatus = status;
    return this.expertRepository.save(expert);
  }

  /**
   * Start rushing mode (requires paid membership)
   */
  async startRushing(expertId: string, userId: string): Promise<IndividualExpert> {
    const expert = await this.getProfile(expertId, userId);

    if (expert.workStatus === ExpertWorkStatus.IN_SERVICE) {
      throw new BadRequestException('Cannot start rushing while in service');
    }

    if (expert.workStatus === ExpertWorkStatus.RUSHING) {
      throw new BadRequestException('Already in rushing mode');
    }

    // Check membership level for rushing mode access
    const hasValidMembership = this.hasValidPaidMembership(expert);

    if (!hasValidMembership) {
      throw new BadRequestException(
        'Rushing mode requires an active paid membership (Silver, Gold, or Diamond). ' +
          'Please upgrade your membership to access this feature.'
      );
    }

    expert.workStatus = ExpertWorkStatus.RUSHING;
    expert.rushingStartedAt = new Date();

    return this.expertRepository.save(expert);
  }

  /**
   * Check if expert has a valid paid membership
   */
  private hasValidPaidMembership(expert: IndividualExpert): boolean {
    // Standard members don't have rushing access
    if (expert.membershipLevel === ExpertMembershipLevel.STANDARD) {
      return false;
    }

    // Check if membership is still valid (not expired)
    if (expert.membershipExpiresAt) {
      const now = new Date();
      if (expert.membershipExpiresAt < now) {
        return false;
      }
    }

    // Paid membership levels: SILVER, GOLD, DIAMOND
    const paidLevels = [
      ExpertMembershipLevel.SILVER,
      ExpertMembershipLevel.GOLD,
      ExpertMembershipLevel.DIAMOND,
    ];

    return paidLevels.includes(expert.membershipLevel);
  }

  /**
   * Stop rushing mode
   */
  async stopRushing(expertId: string, userId: string): Promise<IndividualExpert> {
    const expert = await this.getProfile(expertId, userId);

    if (expert.workStatus !== ExpertWorkStatus.RUSHING) {
      throw new BadRequestException('Not currently in rushing mode');
    }

    // If expert has booked services, go to BOOKED, otherwise IDLE
    if (expert.activeServiceCount > 0) {
      expert.workStatus = ExpertWorkStatus.BOOKED;
    } else {
      expert.workStatus = ExpertWorkStatus.IDLE;
    }

    expert.rushingStartedAt = null;

    return this.expertRepository.save(expert);
  }

  /**
   * Get work summary for expert dashboard
   */
  async getWorkSummary(
    expertId: string,
    userId: string
  ): Promise<{
    workStatus: ExpertWorkStatus;
    membershipLevel: ExpertMembershipLevel;
    membershipExpiresAt: Date | null;
    membershipExpired: boolean;
    canUseRushingMode: boolean;
    activeServiceCount: number;
    maxConcurrentServices: number;
    rushingStartedAt: Date | null;
    rewardPoints: number;
    creditScore: number;
    creditLevel: string;
    pendingOrders: number;
    inProgressOrders: number;
  }> {
    const expert = await this.getProfile(expertId, userId);

    // Get pending orders count
    const pendingOrders = await this.serviceRecordRepository.count({
      where: {
        expertId: expert.id,
        status: ServiceRecordStatus.PENDING,
      },
    });

    // Get in-progress orders count
    const inProgressOrders = await this.serviceRecordRepository.count({
      where: {
        expertId: expert.id,
        status: ServiceRecordStatus.IN_PROGRESS,
      },
    });

    // Check if membership is expired
    const membershipExpired = expert.membershipExpiresAt
      ? expert.membershipExpiresAt < new Date()
      : false;

    // Check if expert can use rushing mode
    const canUseRushingMode = this.hasValidPaidMembership(expert);

    return {
      workStatus: expert.workStatus,
      membershipLevel: expert.membershipLevel,
      membershipExpiresAt: expert.membershipExpiresAt,
      membershipExpired,
      canUseRushingMode,
      activeServiceCount: expert.activeServiceCount,
      maxConcurrentServices: expert.maxConcurrentServices,
      rushingStartedAt: expert.rushingStartedAt,
      rewardPoints: expert.rewardPoints,
      creditScore: expert.creditScore,
      creditLevel: expert.creditLevel,
      pendingOrders,
      inProgressOrders,
    };
  }

  /**
   * System method to update expert status to BOOKED (called when accepting a service)
   */
  async setBookedStatus(expertId: string): Promise<void> {
    const expert = await this.expertRepository.findOne({ where: { id: expertId } });
    if (!expert) return;

    if (
      expert.workStatus === ExpertWorkStatus.RUSHING ||
      expert.workStatus === ExpertWorkStatus.IDLE
    ) {
      expert.workStatus = ExpertWorkStatus.BOOKED;
      expert.rushingStartedAt = null;
      expert.activeServiceCount += 1;
      await this.expertRepository.save(expert);
    }
  }

  /**
   * System method to update expert status to IN_SERVICE (called when starting a service)
   */
  async setInServiceStatus(expertId: string): Promise<void> {
    const expert = await this.expertRepository.findOne({ where: { id: expertId } });
    if (!expert) return;

    expert.workStatus = ExpertWorkStatus.IN_SERVICE;
    await this.expertRepository.save(expert);
  }

  /**
   * System method to restore expert status after completing a service
   */
  async restoreStatusAfterService(expertId: string): Promise<void> {
    const expert = await this.expertRepository.findOne({ where: { id: expertId } });
    if (!expert) return;

    expert.activeServiceCount = Math.max(0, expert.activeServiceCount - 1);

    // Check if expert has other active services
    const activeServices = await this.serviceRecordRepository.count({
      where: {
        expertId: expert.id,
        status: In([ServiceRecordStatus.PENDING, ServiceRecordStatus.IN_PROGRESS]),
      },
    });

    if (activeServices > 0) {
      expert.workStatus = ExpertWorkStatus.BOOKED;
    } else {
      expert.workStatus = ExpertWorkStatus.IDLE;
    }

    await this.expertRepository.save(expert);
  }

  // ==========================================
  // Admin: Get All Experts with Passport Info
  // ==========================================

  async getAllExperts(options?: {
    status?: string;
    workStatus?: ExpertWorkStatus;
    hasPassport?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ experts: any[]; total: number }> {
    const query = this.expertRepository
      .createQueryBuilder('expert')
      .leftJoinAndSelect('expert.user', 'user')
      .orderBy('expert.createdAt', 'DESC');

    // Filter by registration status
    if (options?.status) {
      query.andWhere('expert.registrationStatus = :status', { status: options.status });
    }

    // Filter by work status
    if (options?.workStatus) {
      query.andWhere('expert.workStatus = :workStatus', { workStatus: options.workStatus });
    }

    // Filter by passport existence
    if (options?.hasPassport !== undefined) {
      if (options.hasPassport) {
        query.andWhere('expert.expertCode IS NOT NULL');
      } else {
        query.andWhere('expert.expertCode IS NULL');
      }
    }

    // Search by name, email, or passport code
    if (options?.search) {
      query.andWhere(
        '(expert.personalName ILIKE :search OR user.email ILIKE :search OR expert.expertCode ILIKE :search)',
        { search: `%${options.search}%` }
      );
    }

    const total = await query.getCount();

    if (options?.limit) {
      query.limit(options.limit);
    }
    if (options?.offset) {
      query.offset(options.offset);
    }

    const experts = await query.getMany();

    return {
      experts: experts.map((expert) => ({
        id: expert.id,
        personalName: expert.personalName,
        email: expert.user?.email,
        expertCode: expert.expertCode,
        expertCodeGeneratedAt: expert.expertCodeGeneratedAt,
        expertTypes: expert.expertTypes,
        industries: expert.industries,
        skills: expert.skills,
        nationality: expert.nationality,
        registrationStatus: expert.registrationStatus,
        isAvailable: expert.isAvailable,
        avgRating: expert.avgRating,
        totalReviews: expert.totalReviews,
        completedServices: expert.completedServices,
        // New work status and membership fields
        workStatus: expert.workStatus,
        membershipLevel: expert.membershipLevel,
        membershipExpiresAt: expert.membershipExpiresAt,
        activeServiceCount: expert.activeServiceCount,
        rushingStartedAt: expert.rushingStartedAt,
        // Credit system fields
        rewardPoints: expert.rewardPoints,
        creditScore: expert.creditScore,
        creditLevel: expert.creditLevel,
        createdAt: expert.createdAt,
      })),
      total,
    };
  }
}
