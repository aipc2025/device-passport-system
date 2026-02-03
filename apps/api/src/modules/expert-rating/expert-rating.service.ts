import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import {
  ExpertServiceRecord,
  ExpertReview,
  IndividualExpert,
  ServiceRequest,
  User,
} from '../../database/entities';
import {
  ServiceRecordStatus,
  ReviewStatus,
  ServiceRequestStatus,
  ExpertWorkStatus,
} from '@device-passport/shared';

interface CreateServiceRecordDto {
  serviceRequestId: string;
  expertId: string;
  agreedPrice: number;
  priceCurrency?: string;
  estimatedDuration?: string;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  expertNotes?: string;
}

interface UpdateServiceRecordDto {
  status?: ServiceRecordStatus;
  finalPrice?: number;
  actualDuration?: string;
  actualStart?: Date;
  actualEnd?: Date;
  expertNotes?: string;
  customerNotes?: string;
  completionNotes?: string;
  serviceLocation?: string;
}

interface CreateReviewDto {
  serviceRecordId: string;
  overallRating: number;
  qualityRating?: number;
  communicationRating?: number;
  punctualityRating?: number;
  professionalismRating?: number;
  valueRating?: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
}

interface ExpertResponseDto {
  response: string;
}

@Injectable()
export class ExpertRatingService {
  constructor(
    @InjectRepository(ExpertServiceRecord)
    private serviceRecordRepository: Repository<ExpertServiceRecord>,
    @InjectRepository(ExpertReview)
    private reviewRepository: Repository<ExpertReview>,
    @InjectRepository(IndividualExpert)
    private expertRepository: Repository<IndividualExpert>,
    @InjectRepository(ServiceRequest)
    private serviceRequestRepository: Repository<ServiceRequest>,
    private dataSource: DataSource
  ) {}

  /**
   * Generate unique service record code
   */
  private async generateRecordCode(): Promise<string> {
    const now = new Date();
    const yearMonth = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get count for this month
    const count = await this.serviceRecordRepository.count({
      where: {},
    });

    const sequence = String(count + 1).padStart(6, '0');
    return `ESR-${yearMonth}-${sequence}`;
  }

  /**
   * Create a service record when expert is assigned
   */
  async createServiceRecord(
    dto: CreateServiceRecordDto,
    customerUserId: string
  ): Promise<ExpertServiceRecord> {
    // Verify service request exists
    const serviceRequest = await this.serviceRequestRepository.findOne({
      where: { id: dto.serviceRequestId },
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    // Verify expert exists
    const expert = await this.expertRepository.findOne({
      where: { id: dto.expertId },
    });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    // Check if record already exists
    const existing = await this.serviceRecordRepository.findOne({
      where: {
        serviceRequestId: dto.serviceRequestId,
        expertId: dto.expertId,
      },
    });

    if (existing) {
      throw new BadRequestException('Service record already exists for this request and expert');
    }

    const recordCode = await this.generateRecordCode();

    const record = this.serviceRecordRepository.create({
      recordCode,
      serviceRequestId: dto.serviceRequestId,
      expertId: dto.expertId,
      customerUserId,
      customerOrgId: serviceRequest.organizationId,
      serviceType: serviceRequest.serviceType,
      serviceTitle: serviceRequest.title,
      serviceDescription: serviceRequest.description,
      agreedPrice: dto.agreedPrice,
      priceCurrency: dto.priceCurrency || 'USD',
      estimatedDuration: dto.estimatedDuration,
      scheduledStart: dto.scheduledStart,
      scheduledEnd: dto.scheduledEnd,
      expertNotes: dto.expertNotes,
      serviceLocation: serviceRequest.serviceLocation,
      status: ServiceRecordStatus.PENDING,
    });

    const savedRecord = await this.serviceRecordRepository.save(record);

    // Update expert status to BOOKED
    await this.setExpertBookedStatus(dto.expertId);

    // Update service request status to IN_PROGRESS (expert assigned)
    await this.serviceRequestRepository.update(dto.serviceRequestId, {
      status: ServiceRequestStatus.IN_PROGRESS,
      assignedExpertId: dto.expertId,
    });

    return savedRecord;
  }

  /**
   * Get service record by ID
   */
  async getServiceRecord(id: string): Promise<ExpertServiceRecord> {
    const record = await this.serviceRecordRepository.findOne({
      where: { id },
      relations: ['serviceRequest', 'expert', 'expert.user', 'customerOrg', 'customerUser'],
    });

    if (!record) {
      throw new NotFoundException('Service record not found');
    }

    return record;
  }

  /**
   * Get service records for an expert
   */
  async getExpertServiceRecords(
    expertId: string,
    status?: ServiceRecordStatus,
    limit = 50
  ): Promise<ExpertServiceRecord[]> {
    const where: any = { expertId };
    if (status) {
      where.status = status;
    }

    return this.serviceRecordRepository.find({
      where,
      relations: ['serviceRequest', 'customerOrg', 'customerUser'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get service records for a customer
   */
  async getCustomerServiceRecords(
    customerUserId: string,
    status?: ServiceRecordStatus,
    limit = 50
  ): Promise<ExpertServiceRecord[]> {
    const where: any = { customerUserId };
    if (status) {
      where.status = status;
    }

    return this.serviceRecordRepository.find({
      where,
      relations: ['serviceRequest', 'expert', 'expert.user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Update service record status
   */
  async updateServiceRecord(
    id: string,
    dto: UpdateServiceRecordDto,
    userId: string,
    isExpert: boolean
  ): Promise<ExpertServiceRecord> {
    const record = await this.getServiceRecord(id);

    // Verify permission
    if (isExpert && record.expertId !== userId) {
      throw new ForbiddenException('Only the assigned expert can update this record');
    }

    // Update fields
    if (dto.status !== undefined) {
      await this.handleStatusTransition(record, dto.status);
    }

    if (dto.finalPrice !== undefined) record.finalPrice = dto.finalPrice;
    if (dto.actualDuration !== undefined) record.actualDuration = dto.actualDuration;
    if (dto.actualStart !== undefined) record.actualStart = dto.actualStart;
    if (dto.actualEnd !== undefined) record.actualEnd = dto.actualEnd;
    if (dto.serviceLocation !== undefined) record.serviceLocation = dto.serviceLocation;

    // Expert can update expert notes
    if (isExpert && dto.expertNotes !== undefined) {
      record.expertNotes = dto.expertNotes;
    }

    // Customer can update customer notes
    if (!isExpert && dto.customerNotes !== undefined) {
      record.customerNotes = dto.customerNotes;
    }

    if (dto.completionNotes !== undefined) record.completionNotes = dto.completionNotes;

    return this.serviceRecordRepository.save(record);
  }

  /**
   * Handle status transitions
   */
  private async handleStatusTransition(
    record: ExpertServiceRecord,
    newStatus: ServiceRecordStatus
  ): Promise<void> {
    const currentStatus = record.status;

    // Validate transition
    const validTransitions: Record<ServiceRecordStatus, ServiceRecordStatus[]> = {
      [ServiceRecordStatus.PENDING]: [
        ServiceRecordStatus.IN_PROGRESS,
        ServiceRecordStatus.CANCELLED,
      ],
      [ServiceRecordStatus.IN_PROGRESS]: [
        ServiceRecordStatus.COMPLETED,
        ServiceRecordStatus.CANCELLED,
        ServiceRecordStatus.DISPUTED,
      ],
      [ServiceRecordStatus.COMPLETED]: [ServiceRecordStatus.DISPUTED],
      [ServiceRecordStatus.CANCELLED]: [],
      [ServiceRecordStatus.DISPUTED]: [
        ServiceRecordStatus.COMPLETED,
        ServiceRecordStatus.CANCELLED,
      ],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }

    record.status = newStatus;

    // Handle specific status changes
    if (newStatus === ServiceRecordStatus.IN_PROGRESS && !record.actualStart) {
      record.actualStart = new Date();
      // Update expert work status to IN_SERVICE
      await this.setExpertInServiceStatus(record.expertId);
    }

    if (newStatus === ServiceRecordStatus.COMPLETED) {
      record.completedAt = new Date();
      record.actualEnd = record.actualEnd || new Date();

      // Update expert's completed services count
      await this.expertRepository.increment({ id: record.expertId }, 'completedServices', 1);

      // Update service request status
      await this.serviceRequestRepository.update(record.serviceRequestId, {
        status: ServiceRequestStatus.COMPLETED,
        completedAt: new Date(),
      });

      // Restore expert status after service completion
      await this.restoreExpertStatusAfterService(record.expertId);
    }

    if (newStatus === ServiceRecordStatus.CANCELLED) {
      record.cancelledAt = new Date();
      // Restore expert status after cancellation
      await this.restoreExpertStatusAfterService(record.expertId);
    }
  }

  /**
   * Set expert work status to IN_SERVICE
   */
  private async setExpertInServiceStatus(expertId: string): Promise<void> {
    const expert = await this.expertRepository.findOne({ where: { id: expertId } });
    if (!expert) return;

    expert.workStatus = ExpertWorkStatus.IN_SERVICE;
    await this.expertRepository.save(expert);
  }

  /**
   * Restore expert status after completing or cancelling a service
   */
  private async restoreExpertStatusAfterService(expertId: string): Promise<void> {
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

  /**
   * Set expert status to BOOKED when assigned to a service
   */
  private async setExpertBookedStatus(expertId: string): Promise<void> {
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
   * Customer confirms service completion
   */
  async confirmCompletion(recordId: string, customerUserId: string): Promise<ExpertServiceRecord> {
    const record = await this.getServiceRecord(recordId);

    if (record.customerUserId !== customerUserId) {
      throw new ForbiddenException('Only the customer can confirm completion');
    }

    if (record.status !== ServiceRecordStatus.COMPLETED) {
      throw new BadRequestException('Service must be completed before confirmation');
    }

    record.confirmedByCustomer = true;
    record.confirmedAt = new Date();
    record.reviewRequestedAt = new Date();

    return this.serviceRecordRepository.save(record);
  }

  /**
   * Create a review for completed service
   */
  async createReview(dto: CreateReviewDto, reviewerId: string): Promise<ExpertReview> {
    // Validate rating values
    if (dto.overallRating < 1 || dto.overallRating > 5) {
      throw new BadRequestException('Overall rating must be between 1 and 5');
    }

    // Get service record
    const record = await this.getServiceRecord(dto.serviceRecordId);

    // Verify reviewer is the customer
    if (record.customerUserId !== reviewerId) {
      throw new ForbiddenException('Only the customer can review this service');
    }

    // Check service is completed and confirmed
    if (record.status !== ServiceRecordStatus.COMPLETED) {
      throw new BadRequestException('Service must be completed before review');
    }

    // Check if already reviewed
    if (record.isReviewed) {
      throw new BadRequestException('This service has already been reviewed');
    }

    // Create review
    const review = this.reviewRepository.create({
      serviceRecordId: dto.serviceRecordId,
      expertId: record.expertId,
      reviewerId,
      overallRating: dto.overallRating,
      qualityRating: dto.qualityRating,
      communicationRating: dto.communicationRating,
      punctualityRating: dto.punctualityRating,
      professionalismRating: dto.professionalismRating,
      valueRating: dto.valueRating,
      title: dto.title,
      comment: dto.comment,
      pros: dto.pros || [],
      cons: dto.cons || [],
      isVerified: true,
      status: ReviewStatus.PUBLISHED,
    });

    // Save review and update record
    const savedReview = await this.reviewRepository.save(review);

    // Mark record as reviewed
    record.isReviewed = true;
    await this.serviceRecordRepository.save(record);

    // Update expert's aggregate rating
    await this.updateExpertRating(record.expertId);

    return savedReview;
  }

  /**
   * Get reviews for an expert
   */
  async getExpertReviews(
    expertId: string,
    status: ReviewStatus = ReviewStatus.PUBLISHED,
    limit = 50
  ): Promise<ExpertReview[]> {
    return this.reviewRepository.find({
      where: { expertId, status },
      relations: ['serviceRecord', 'reviewer'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get review by ID
   */
  async getReview(id: string): Promise<ExpertReview> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['serviceRecord', 'expert', 'expert.user', 'reviewer'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  /**
   * Expert responds to a review
   */
  async respondToReview(
    reviewId: string,
    expertId: string,
    dto: ExpertResponseDto
  ): Promise<ExpertReview> {
    const review = await this.getReview(reviewId);

    // Verify expert owns this review
    if (review.expertId !== expertId) {
      throw new ForbiddenException('Only the reviewed expert can respond');
    }

    // Check if already responded
    if (review.expertResponse) {
      throw new BadRequestException('You have already responded to this review');
    }

    review.expertResponse = dto.response;
    review.expertRespondedAt = new Date();

    return this.reviewRepository.save(review);
  }

  /**
   * Update expert's aggregate rating
   */
  async updateExpertRating(expertId: string): Promise<void> {
    // Get all published reviews for this expert
    const reviews = await this.reviewRepository.find({
      where: { expertId, status: ReviewStatus.PUBLISHED },
    });

    if (reviews.length === 0) {
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.overallRating, 0);
    const avgRating = totalRating / reviews.length;

    // Update expert
    await this.expertRepository.update(expertId, {
      avgRating: Math.round(avgRating * 100) / 100,
      totalReviews: reviews.length,
    });
  }

  /**
   * Get expert rating summary
   */
  async getExpertRatingSummary(expertId: string): Promise<{
    avgRating: number;
    totalReviews: number;
    completedServices: number;
    ratingDistribution: Record<number, number>;
    categoryAverages: {
      quality: number;
      communication: number;
      punctuality: number;
      professionalism: number;
      value: number;
    };
  }> {
    const expert = await this.expertRepository.findOne({ where: { id: expertId } });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    // Get all published reviews
    const reviews = await this.reviewRepository.find({
      where: { expertId, status: ReviewStatus.PUBLISHED },
    });

    // Calculate rating distribution (1-5 stars)
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      ratingDistribution[r.overallRating] = (ratingDistribution[r.overallRating] || 0) + 1;
    });

    // Calculate category averages
    const categoryAverages = {
      quality: 0,
      communication: 0,
      punctuality: 0,
      professionalism: 0,
      value: 0,
    };

    if (reviews.length > 0) {
      const qualityReviews = reviews.filter((r) => r.qualityRating);
      const commReviews = reviews.filter((r) => r.communicationRating);
      const punctReviews = reviews.filter((r) => r.punctualityRating);
      const profReviews = reviews.filter((r) => r.professionalismRating);
      const valueReviews = reviews.filter((r) => r.valueRating);

      if (qualityReviews.length > 0) {
        categoryAverages.quality =
          Math.round(
            (qualityReviews.reduce((sum, r) => sum + r.qualityRating, 0) / qualityReviews.length) *
              100
          ) / 100;
      }
      if (commReviews.length > 0) {
        categoryAverages.communication =
          Math.round(
            (commReviews.reduce((sum, r) => sum + r.communicationRating, 0) / commReviews.length) *
              100
          ) / 100;
      }
      if (punctReviews.length > 0) {
        categoryAverages.punctuality =
          Math.round(
            (punctReviews.reduce((sum, r) => sum + r.punctualityRating, 0) / punctReviews.length) *
              100
          ) / 100;
      }
      if (profReviews.length > 0) {
        categoryAverages.professionalism =
          Math.round(
            (profReviews.reduce((sum, r) => sum + r.professionalismRating, 0) /
              profReviews.length) *
              100
          ) / 100;
      }
      if (valueReviews.length > 0) {
        categoryAverages.value =
          Math.round(
            (valueReviews.reduce((sum, r) => sum + r.valueRating, 0) / valueReviews.length) * 100
          ) / 100;
      }
    }

    return {
      avgRating: expert.avgRating || 0,
      totalReviews: expert.totalReviews || 0,
      completedServices: expert.completedServices || 0,
      ratingDistribution,
      categoryAverages,
    };
  }

  /**
   * Flag a review for moderation
   */
  async flagReview(reviewId: string, reason: string, userId: string): Promise<ExpertReview> {
    const review = await this.getReview(reviewId);

    review.status = ReviewStatus.FLAGGED;
    review.flaggedReason = reason;
    review.moderatedBy = userId;
    review.moderatedAt = new Date();

    const saved = await this.reviewRepository.save(review);

    // Recalculate expert rating (excludes flagged reviews)
    await this.updateExpertRating(review.expertId);

    return saved;
  }

  /**
   * Mark a review as helpful/not helpful
   */
  async voteReview(reviewId: string, isHelpful: boolean): Promise<ExpertReview> {
    const review = await this.getReview(reviewId);

    if (isHelpful) {
      review.helpfulCount += 1;
    } else {
      review.notHelpfulCount += 1;
    }

    return this.reviewRepository.save(review);
  }
}
