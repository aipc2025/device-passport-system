import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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
    private dataSource: DataSource,
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
    data: Partial<IndividualExpert>,
  ): Promise<IndividualExpert> {
    const expert = await this.getProfile(expertId, userId);

    // Don't allow updating certain fields
    const { id, userId: _, registrationStatus, adminNotes, reviewedBy, reviewedAt, createdAt, updatedAt, ...updateData } = data as any;

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

  async getMatches(expertId: string, userId: string, limit = 50): Promise<any[]> {
    // Verify the expert profile belongs to the user
    await this.getProfile(expertId, userId);

    // For now, return empty array - this would be implemented with a proper matching system
    // Similar to the buyer/supplier matching but for service requests to experts
    return [];
  }

  async dismissMatch(matchId: string, userId: string): Promise<void> {
    // Implementation for dismissing an expert match
    // This would update the match status to DISMISSED
  }

  // ==========================================
  // Location & Availability Methods
  // ==========================================

  async updateLocation(
    expertId: string,
    userId: string,
    data: { latitude?: number; longitude?: number; currentLocation?: string },
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
    data: { isAvailable?: boolean; serviceRadius?: number },
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
    skillTags: string[],
  ): Promise<IndividualExpert> {
    const expert = await this.getProfile(expertId, userId);
    expert.skillTags = skillTags;
    return this.expertRepository.save(expert);
  }

  // ==========================================
  // Dashboard Stats
  // ==========================================

  async getDashboardStats(expertId: string, userId: string): Promise<{
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
    const publicWorkHistories = expert.workHistories?.filter(
      (wh) => wh.isPublic || wh.verificationStatus === WorkHistoryVerificationStatus.VERIFIED
    ).map((wh) => ({
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
      const passportCode = generateExpertPassportCode(
        expertTypeCode,
        primaryIndustry,
        primarySkill,
        expert.dateOfBirth,
        nationality,
        sequenceCounter.currentSequence,
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
    data: Partial<ExpertWorkHistory>,
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
    data: Partial<ExpertWorkHistory>,
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
      id, expertId, verificationStatus, verificationRequestedAt,
      verifiedBy, verifiedAt, proofDocumentId, verificationNotes,
      rejectionReason, createdAt, updatedAt,
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
      throw new BadRequestException('Please provide company contact email or phone for verification');
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
    proofDocumentId?: string,
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
}
