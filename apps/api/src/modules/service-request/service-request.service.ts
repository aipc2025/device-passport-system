import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  ServiceRequest,
  ExpertApplication,
  IndividualExpert,
} from '../../database/entities';
import {
  ServiceRequestStatus,
  ExpertApplicationStatus,
  ServiceType,
  ServiceUrgency,
  ServiceRequestCategory,
} from '@device-passport/shared';
import { LaborDetails } from '../../database/entities/service-request.entity';

interface CreateServiceRequestDto {
  title: string;
  description: string;
  serviceType: ServiceType;
  category?: ServiceRequestCategory;
  urgency?: ServiceUrgency;
  passportCode?: string;
  laborDetails?: LaborDetails;
  serviceLocation?: string;
  locationLat?: number;
  locationLng?: number;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency?: string;
  preferredDate?: string;
  deadline?: string;
  requiredSkills?: string[];
  isPublic?: boolean;
  showCompanyInfo?: boolean;
}

interface CreatePublicServiceRequestDto {
  title: string;
  description: string;
  serviceType: ServiceType;
  category?: ServiceRequestCategory;
  urgency?: ServiceUrgency;
  passportCode?: string;
  laborDetails?: LaborDetails;
  serviceLocation?: string;
  locationLat?: number;
  locationLng?: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency?: string;
  preferredDate?: string;
  requiredSkills?: string[];
}

interface UpdateServiceRequestDto {
  title?: string;
  description?: string;
  serviceType?: ServiceType;
  urgency?: ServiceUrgency;
  serviceLocation?: string;
  locationLat?: number;
  locationLng?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency?: string;
  preferredDate?: string;
  deadline?: string;
  requiredSkills?: string[];
  isPublic?: boolean;
  showCompanyInfo?: boolean;
  status?: ServiceRequestStatus;
}

interface ApplyToServiceDto {
  message?: string;
  proposedPrice?: number;
  priceCurrency?: string;
  estimatedDuration?: number;
  durationUnit?: string;
  availableFrom?: string;
}

@Injectable()
export class ServiceRequestService {
  constructor(
    @InjectRepository(ServiceRequest)
    private serviceRequestRepository: Repository<ServiceRequest>,
    @InjectRepository(ExpertApplication)
    private applicationRepository: Repository<ExpertApplication>,
    @InjectRepository(IndividualExpert)
    private expertRepository: Repository<IndividualExpert>,
    private dataSource: DataSource,
  ) {}

  // ==========================================
  // Service Request CRUD
  // ==========================================

  async create(
    userId: string,
    organizationId: string | null,
    data: CreateServiceRequestDto,
  ): Promise<ServiceRequest> {
    // Generate request code
    const requestCode = await this.generateRequestCode();

    const serviceRequest = this.serviceRequestRepository.create({
      title: data.title,
      description: data.description,
      serviceType: data.serviceType,
      urgency: data.urgency,
      serviceLocation: data.serviceLocation,
      locationLat: data.locationLat,
      locationLng: data.locationLng,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      budgetCurrency: data.budgetCurrency || 'USD',
      requiredSkills: data.requiredSkills || [],
      isPublic: data.isPublic !== false,
      showCompanyInfo: data.showCompanyInfo !== false,
      requestCode,
      createdByUserId: userId,
      organizationId: organizationId || undefined,
      status: ServiceRequestStatus.DRAFT,
      preferredDate: data.preferredDate ? new Date(data.preferredDate) : undefined,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    });

    return this.serviceRequestRepository.save(serviceRequest);
  }

  /**
   * Create a public service request (no authentication required)
   * Used by guests/visitors to submit service requests
   */
  async createPublic(data: CreatePublicServiceRequestDto): Promise<ServiceRequest> {
    // Generate request code
    const requestCode = await this.generateRequestCode();

    // Determine category based on serviceType if not provided
    let category = data.category;
    if (!category) {
      // Map old serviceType to new category for backwards compatibility
      const typeToCategory: Record<ServiceType, ServiceRequestCategory> = {
        [ServiceType.REPAIR]: ServiceRequestCategory.DEVICE_REPAIR,
        [ServiceType.MAINTENANCE]: ServiceRequestCategory.DEVICE_MAINTENANCE,
        [ServiceType.INSPECTION]: ServiceRequestCategory.DEVICE_INSPECTION,
        [ServiceType.INSTALLATION]: ServiceRequestCategory.DEVICE_INSTALLATION,
        [ServiceType.UPGRADE]: ServiceRequestCategory.DEVICE_REPAIR,
        [ServiceType.CONSULTATION]: ServiceRequestCategory.CONSULTING_TECHNICAL,
      };
      category = typeToCategory[data.serviceType] || ServiceRequestCategory.DEVICE_REPAIR;
    }

    const serviceRequest = this.serviceRequestRepository.create({
      title: data.title,
      description: data.description,
      serviceType: data.serviceType,
      category,
      urgency: data.urgency || ServiceUrgency.NORMAL,
      passportCode: data.passportCode,
      laborDetails: data.laborDetails,
      serviceLocation: data.serviceLocation,
      locationLat: data.locationLat,
      locationLng: data.locationLng,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      budgetCurrency: data.budgetCurrency || 'USD',
      requiredSkills: data.requiredSkills || [],
      isPublic: true,
      showCompanyInfo: false,
      requestCode,
      // Public requests have no user ID - will be linked later if user registers
      createdByUserId: null as any,
      organizationId: undefined,
      // Public requests are immediately OPEN for experts to see
      status: ServiceRequestStatus.OPEN,
      preferredDate: data.preferredDate ? new Date(data.preferredDate) : undefined,
    });

    return this.serviceRequestRepository.save(serviceRequest);
  }

  async update(
    id: string,
    userId: string,
    data: UpdateServiceRequestDto,
  ): Promise<ServiceRequest> {
    const request = await this.findOne(id);

    if (request.createdByUserId !== userId) {
      throw new ForbiddenException('Not authorized to update this service request');
    }

    // Only allow updates if not yet in progress
    if (
      request.status !== ServiceRequestStatus.DRAFT &&
      request.status !== ServiceRequestStatus.OPEN
    ) {
      throw new BadRequestException('Cannot update service request in current status');
    }

    // Apply updates
    if (data.title !== undefined) request.title = data.title;
    if (data.description !== undefined) request.description = data.description;
    if (data.serviceType !== undefined) request.serviceType = data.serviceType;
    if (data.urgency !== undefined) request.urgency = data.urgency;
    if (data.serviceLocation !== undefined) request.serviceLocation = data.serviceLocation;
    if (data.locationLat !== undefined) request.locationLat = data.locationLat;
    if (data.locationLng !== undefined) request.locationLng = data.locationLng;
    if (data.contactName !== undefined) request.contactName = data.contactName;
    if (data.contactPhone !== undefined) request.contactPhone = data.contactPhone;
    if (data.contactEmail !== undefined) request.contactEmail = data.contactEmail;
    if (data.budgetMin !== undefined) request.budgetMin = data.budgetMin;
    if (data.budgetMax !== undefined) request.budgetMax = data.budgetMax;
    if (data.budgetCurrency !== undefined) request.budgetCurrency = data.budgetCurrency;
    if (data.requiredSkills !== undefined) request.requiredSkills = data.requiredSkills;
    if (data.isPublic !== undefined) request.isPublic = data.isPublic;
    if (data.showCompanyInfo !== undefined) request.showCompanyInfo = data.showCompanyInfo;
    if (data.preferredDate !== undefined) request.preferredDate = new Date(data.preferredDate);
    if (data.deadline !== undefined) request.deadline = new Date(data.deadline);

    return this.serviceRequestRepository.save(request);
  }

  async publish(id: string, userId: string): Promise<ServiceRequest> {
    const request = await this.findOne(id);

    if (request.createdByUserId !== userId) {
      throw new ForbiddenException('Not authorized to publish this service request');
    }

    if (request.status !== ServiceRequestStatus.DRAFT) {
      throw new BadRequestException('Only draft requests can be published');
    }

    request.status = ServiceRequestStatus.OPEN;
    return this.serviceRequestRepository.save(request);
  }

  async cancel(id: string, userId: string, reason?: string): Promise<ServiceRequest> {
    const request = await this.findOne(id);

    if (request.createdByUserId !== userId) {
      throw new ForbiddenException('Not authorized to cancel this service request');
    }

    if (request.status === ServiceRequestStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed request');
    }

    request.status = ServiceRequestStatus.CANCELLED;
    if (reason) {
      request.cancellationReason = reason;
    }
    return this.serviceRequestRepository.save(request);
  }

  async findOne(id: string): Promise<ServiceRequest> {
    const request = await this.serviceRequestRepository.findOne({
      where: { id },
      relations: ['organization', 'createdBy'],
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    return request;
  }

  async findByCode(code: string): Promise<ServiceRequest> {
    const request = await this.serviceRequestRepository.findOne({
      where: { requestCode: code },
      relations: ['organization', 'createdBy'],
    });

    if (!request) {
      throw new NotFoundException('Service request not found');
    }

    return request;
  }

  async findMyRequests(userId: string): Promise<ServiceRequest[]> {
    return this.serviceRequestRepository.find({
      where: { createdByUserId: userId },
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPublic(params: {
    search?: string;
    serviceType?: string;
    urgency?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: ServiceRequest[]; total: number }> {
    const qb = this.serviceRequestRepository
      .createQueryBuilder('sr')
      .leftJoinAndSelect('sr.organization', 'org')
      .where('sr.isPublic = :isPublic', { isPublic: true })
      .andWhere('sr.status = :status', { status: ServiceRequestStatus.OPEN });

    if (params.search) {
      qb.andWhere(
        '(sr.title ILIKE :search OR sr.description ILIKE :search)',
        { search: `%${params.search}%` },
      );
    }

    if (params.serviceType) {
      qb.andWhere('sr.serviceType = :serviceType', { serviceType: params.serviceType });
    }

    if (params.urgency) {
      qb.andWhere('sr.urgency = :urgency', { urgency: params.urgency });
    }

    const total = await qb.getCount();

    qb.orderBy('sr.createdAt', 'DESC')
      .take(params.limit || 20)
      .skip(params.offset || 0);

    const data = await qb.getMany();

    return { data, total };
  }

  // ==========================================
  // Expert Applications
  // ==========================================

  async applyToService(
    serviceRequestId: string,
    expertId: string,
    data: ApplyToServiceDto,
  ): Promise<ExpertApplication> {
    const request = await this.findOne(serviceRequestId);

    if (request.status !== ServiceRequestStatus.OPEN) {
      throw new BadRequestException('This service request is not accepting applications');
    }

    // Check if already applied
    const existing = await this.applicationRepository.findOne({
      where: { serviceRequestId, expertId },
    });

    if (existing) {
      throw new BadRequestException('You have already applied to this service request');
    }

    const application = this.applicationRepository.create({
      message: data.message,
      proposedPrice: data.proposedPrice,
      priceCurrency: data.priceCurrency || 'USD',
      estimatedDuration: data.estimatedDuration,
      durationUnit: data.durationUnit || 'days',
      serviceRequestId,
      expertId,
      status: ExpertApplicationStatus.PENDING,
      availableFrom: data.availableFrom ? new Date(data.availableFrom) : undefined,
    });

    // Increment application count
    await this.serviceRequestRepository.increment(
      { id: serviceRequestId },
      'applicationCount',
      1,
    );

    return this.applicationRepository.save(application);
  }

  async withdrawApplication(applicationId: string, expertId: string): Promise<void> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId, expertId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.status !== ExpertApplicationStatus.PENDING) {
      throw new BadRequestException('Cannot withdraw non-pending application');
    }

    application.status = ExpertApplicationStatus.WITHDRAWN;
    await this.applicationRepository.save(application);
  }

  async getApplicationsForRequest(
    serviceRequestId: string,
    userId: string,
  ): Promise<ExpertApplication[]> {
    const request = await this.findOne(serviceRequestId);

    if (request.createdByUserId !== userId) {
      throw new ForbiddenException('Not authorized to view applications');
    }

    return this.applicationRepository.find({
      where: { serviceRequestId },
      relations: ['expert'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMyApplications(expertId: string): Promise<ExpertApplication[]> {
    return this.applicationRepository.find({
      where: { expertId },
      relations: ['serviceRequest', 'serviceRequest.organization'],
      order: { createdAt: 'DESC' },
    });
  }

  async acceptApplication(
    applicationId: string,
    userId: string,
  ): Promise<ExpertApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['serviceRequest'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.serviceRequest.createdByUserId !== userId) {
      throw new ForbiddenException('Not authorized to accept this application');
    }

    if (application.status !== ExpertApplicationStatus.PENDING) {
      throw new BadRequestException('Can only accept pending applications');
    }

    // Use transaction to update both application and request
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Accept this application
      application.status = ExpertApplicationStatus.ACCEPTED;
      application.reviewedAt = new Date();
      application.reviewedByUserId = userId;
      await queryRunner.manager.save(application);

      // Update service request status
      await queryRunner.manager.update(ServiceRequest, application.serviceRequestId, {
        status: ServiceRequestStatus.IN_PROGRESS,
        assignedExpertId: application.expertId,
        assignedAt: new Date(),
      });

      // Reject all other pending applications
      await queryRunner.manager.update(
        ExpertApplication,
        {
          serviceRequestId: application.serviceRequestId,
          status: ExpertApplicationStatus.PENDING,
        },
        {
          status: ExpertApplicationStatus.REJECTED,
          reviewedAt: new Date(),
          rejectionReason: 'Another applicant was selected',
        },
      );

      await queryRunner.commitTransaction();
      return application;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectApplication(
    applicationId: string,
    userId: string,
    reason?: string,
  ): Promise<ExpertApplication> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['serviceRequest'],
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.serviceRequest.createdByUserId !== userId) {
      throw new ForbiddenException('Not authorized to reject this application');
    }

    if (application.status !== ExpertApplicationStatus.PENDING) {
      throw new BadRequestException('Can only reject pending applications');
    }

    application.status = ExpertApplicationStatus.REJECTED;
    application.reviewedAt = new Date();
    application.reviewedByUserId = userId;
    if (reason) {
      application.rejectionReason = reason;
    }

    return this.applicationRepository.save(application);
  }

  // ==========================================
  // Completion & Rating
  // ==========================================

  async completeRequest(id: string, userId: string): Promise<ServiceRequest> {
    const request = await this.findOne(id);

    if (request.createdByUserId !== userId) {
      throw new ForbiddenException('Not authorized to complete this request');
    }

    if (request.status !== ServiceRequestStatus.IN_PROGRESS) {
      throw new BadRequestException('Only in-progress requests can be completed');
    }

    request.status = ServiceRequestStatus.COMPLETED;
    request.completedAt = new Date();

    return this.serviceRequestRepository.save(request);
  }

  // ==========================================
  // Helpers
  // ==========================================

  private async generateRequestCode(): Promise<string> {
    const now = new Date();
    const yearMonth = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Get count for this month
    const count = await this.serviceRequestRepository
      .createQueryBuilder('sr')
      .where('sr.requestCode LIKE :prefix', { prefix: `SR-${yearMonth}-%` })
      .getCount();

    const sequence = String(count + 1).padStart(6, '0');
    return `SR-${yearMonth}-${sequence}`;
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.serviceRequestRepository.increment({ id }, 'viewCount', 1);
  }

  // Get service types (for frontend dropdown)
  getServiceTypes(): { value: string; label: string }[] {
    return [
      { value: 'INSTALLATION', label: 'Installation' },
      { value: 'REPAIR', label: 'Repair' },
      { value: 'MAINTENANCE', label: 'Maintenance' },
      { value: 'INSPECTION', label: 'Inspection' },
      { value: 'UPGRADE', label: 'Upgrade' },
      { value: 'CONSULTATION', label: 'Consultation' },
    ];
  }
}
