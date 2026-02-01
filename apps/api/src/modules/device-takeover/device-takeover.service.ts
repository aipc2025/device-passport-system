import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThanOrEqual } from 'typeorm';
import {
  DeviceTakeoverRequest,
  DevicePassport,
  User,
  SequenceCounter,
} from '../../database/entities';
import { TakeoverStatus, TakeoverReason, DeviceStatus, ProductLine, OriginCode } from '@device-passport/shared';
import { PointService } from '../point/point.service';

@Injectable()
export class DeviceTakeoverService {
  constructor(
    @InjectRepository(DeviceTakeoverRequest)
    private takeoverRepo: Repository<DeviceTakeoverRequest>,
    @InjectRepository(DevicePassport)
    private passportRepo: Repository<DevicePassport>,
    @InjectRepository(SequenceCounter)
    private sequenceRepo: Repository<SequenceCounter>,
    private dataSource: DataSource,
    private pointService: PointService,
  ) {}

  // ============================================
  // Takeover Request Management
  // ============================================

  async createTakeoverRequest(
    userId: string,
    data: {
      deviceName: string;
      deviceModel?: string;
      manufacturer?: string;
      serialNumber?: string;
      purchaseDate?: Date;
      warrantyExpiry?: Date;
      takeoverReason: TakeoverReason;
      reasonDescription?: string;
      photos?: string[];
      documents?: string[];
      nameplatePhotos?: string[];
      estimatedValue?: number;
      valueCurrency?: string;
      deviceLocation?: string;
      industry?: string;
      customerNotes?: string;
      organizationId?: string;
    },
  ): Promise<DeviceTakeoverRequest> {
    // Generate request code
    const requestCode = await this.generateRequestCode();

    // Determine if inspection is required (for high-value devices)
    const inspectionRequired = (data.estimatedValue || 0) > 10000;

    const request = this.takeoverRepo.create({
      requestCode,
      customerUserId: userId,
      customerOrgId: data.organizationId,
      deviceName: data.deviceName,
      deviceModel: data.deviceModel,
      manufacturer: data.manufacturer,
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate,
      warrantyExpiry: data.warrantyExpiry,
      takeoverReason: data.takeoverReason,
      reasonDescription: data.reasonDescription,
      photos: data.photos || [],
      documents: data.documents || [],
      nameplatePhotos: data.nameplatePhotos || [],
      estimatedValue: data.estimatedValue,
      valueCurrency: data.valueCurrency || 'USD',
      deviceLocation: data.deviceLocation,
      industry: data.industry,
      customerNotes: data.customerNotes,
      inspectionRequired,
      status: TakeoverStatus.PENDING,
    });

    return this.takeoverRepo.save(request);
  }

  async getTakeoverRequest(id: string): Promise<DeviceTakeoverRequest> {
    const request = await this.takeoverRepo.findOne({
      where: { id },
      relations: ['customerUser', 'inspectionExpert', 'generatedPassport'],
    });

    if (!request) {
      throw new NotFoundException('Takeover request not found');
    }

    return request;
  }

  async getMyTakeoverRequests(userId: string): Promise<DeviceTakeoverRequest[]> {
    return this.takeoverRepo.find({
      where: { customerUserId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllTakeoverRequests(options?: {
    status?: TakeoverStatus;
    page?: number;
    limit?: number;
  }): Promise<{ requests: DeviceTakeoverRequest[]; total: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options?.status) {
      where.status = options.status;
    }

    const [requests, total] = await this.takeoverRepo.findAndCount({
      where,
      relations: ['customerUser'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { requests, total };
  }

  // ============================================
  // Inspection Management
  // ============================================

  async assignInspectionExpert(
    requestId: string,
    expertId: string,
  ): Promise<DeviceTakeoverRequest> {
    const request = await this.getTakeoverRequest(requestId);

    if (request.status !== TakeoverStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    request.inspectionExpertId = expertId;
    request.status = TakeoverStatus.INSPECTING;

    return this.takeoverRepo.save(request);
  }

  async submitInspectionReport(
    requestId: string,
    expertId: string,
    report: {
      overallCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
      functionalStatus: string;
      notes: string;
      photos: string[];
    },
  ): Promise<DeviceTakeoverRequest> {
    const request = await this.getTakeoverRequest(requestId);

    if (request.inspectionExpertId !== expertId) {
      throw new BadRequestException('Not assigned to this inspection');
    }

    if (request.status !== TakeoverStatus.INSPECTING) {
      throw new BadRequestException('Request is not in inspection status');
    }

    request.inspectionReport = {
      ...report,
      inspectedAt: new Date(),
    };
    request.status = TakeoverStatus.REVIEWING;

    await this.takeoverRepo.save(request);

    // Award points to expert for completing inspection
    await this.pointService.awardPoints(
      expertId,
      'EXPERT',
      'DEVICE_INSPECTION',
      {
        relatedTakeoverId: requestId,
        description: `Completed device inspection: ${request.deviceName}`,
      },
    );

    return request;
  }

  // ============================================
  // Review and Approval
  // ============================================

  async approveRequest(
    requestId: string,
    adminUserId: string,
    notes?: string,
  ): Promise<DeviceTakeoverRequest> {
    const request = await this.getTakeoverRequest(requestId);

    if (request.status !== TakeoverStatus.PENDING && request.status !== TakeoverStatus.REVIEWING) {
      throw new BadRequestException('Request cannot be approved in current status');
    }

    // Generate device passport
    const passport = await this.generateDevicePassport(request);

    // Update request
    request.status = TakeoverStatus.APPROVED;
    request.reviewedBy = adminUserId;
    request.reviewedAt = new Date();
    request.reviewNotes = notes || null;
    request.generatedPassportId = passport.id;
    request.generatedPassportCode = passport.passportCode;

    await this.takeoverRepo.save(request);

    // Award points to customer for successful takeover
    await this.pointService.awardPoints(
      request.customerUserId,
      'CUSTOMER',
      'DEVICE_TAKEOVER',
      {
        relatedTakeoverId: requestId,
        description: `Device takeover approved: ${request.deviceName}`,
      },
    );

    return request;
  }

  async rejectRequest(
    requestId: string,
    adminUserId: string,
    reason: string,
  ): Promise<DeviceTakeoverRequest> {
    const request = await this.getTakeoverRequest(requestId);

    if (request.status === TakeoverStatus.APPROVED || request.status === TakeoverStatus.REJECTED) {
      throw new BadRequestException('Request has already been finalized');
    }

    request.status = TakeoverStatus.REJECTED;
    request.reviewedBy = adminUserId;
    request.reviewedAt = new Date();
    request.rejectionReason = reason;

    return this.takeoverRepo.save(request);
  }

  // ============================================
  // Device Passport Generation
  // ============================================

  private async generateDevicePassport(request: DeviceTakeoverRequest): Promise<DevicePassport> {
    // Determine product line from device info
    const productLine = this.determineProductLine(request.deviceName, request.industry);

    // Generate passport code with OT (Other) origin
    const passportCode = await this.generatePassportCode(productLine);

    const passport = this.passportRepo.create({
      passportCode,
      productLine,
      originCode: OriginCode.OTHER,
      status: DeviceStatus.IN_SERVICE,
      deviceName: request.deviceName,
      deviceModel: request.deviceModel || 'Unknown',
      manufacturer: request.manufacturer || 'Unknown',
      serialNumber: request.serialNumber,
      warrantyExpiryDate: request.warrantyExpiry,
      // Link to customer organization
      customerId: request.customerOrgId,
      // Set created/updated by
      createdBy: request.customerUserId,
      updatedBy: request.customerUserId,
      // Buyer information from customer
      buyerCompany: request.customerOrg?.name,
      currentLocation: request.deviceLocation,
    });

    return this.passportRepo.save(passport);
  }

  private determineProductLine(deviceName: string, industry?: string): ProductLine {
    const nameLower = deviceName.toLowerCase();
    const industryLower = (industry || '').toLowerCase();

    // Match by industry
    if (industryLower.includes('packaging') || industryLower.includes('filling')) {
      return ProductLine.PF;
    }
    if (industryLower.includes('quality') || industryLower.includes('inspection')) {
      return ProductLine.QI;
    }
    if (industryLower.includes('metal')) {
      return ProductLine.MP;
    }
    if (industryLower.includes('plastic')) {
      return ProductLine.PP;
    }
    if (industryLower.includes('hospital') || industryLower.includes('lab') || industryLower.includes('medical')) {
      return ProductLine.HL;
    }
    if (industryLower.includes('education') || industryLower.includes('training')) {
      return ProductLine.ET;
    }
    if (industryLower.includes('warehouse') || industryLower.includes('logistics')) {
      return ProductLine.WL;
    }

    // Match by device name
    if (nameLower.includes('packaging') || nameLower.includes('filler')) {
      return ProductLine.PF;
    }
    if (nameLower.includes('inspector') || nameLower.includes('vision')) {
      return ProductLine.QI;
    }

    // Default to Industrial Parts for general equipment
    return ProductLine.IP;
  }

  private async generatePassportCode(productLine: ProductLine): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const yearMonth = `${year}${month}`;

    // Get next sequence number using existing SequenceCounter structure
    let counter = await this.sequenceRepo.findOne({
      where: {
        companyCode: 'OTH', // Other/Takeover company code
        yearMonth,
        productLine,
        originCode: OriginCode.OTHER,
      },
    });

    if (!counter) {
      counter = this.sequenceRepo.create({
        companyCode: 'OTH',
        yearMonth,
        productLine,
        originCode: OriginCode.OTHER,
        currentSequence: 0,
      });
    }

    counter.currentSequence += 1;
    await this.sequenceRepo.save(counter);

    const sequence = counter.currentSequence.toString().padStart(6, '0');
    const checksum = this.calculateChecksum(`${productLine}${yearMonth}OT${sequence}`);

    return `DP-${productLine}-${yearMonth}-OT-${sequence}-${checksum}`;
  }

  private calculateChecksum(input: string): string {
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
      sum += input.charCodeAt(i) * (i + 1);
    }
    const checksumNum = sum % 36;
    const checksumChar = checksumNum < 10
      ? checksumNum.toString()
      : String.fromCharCode(55 + checksumNum);
    return checksumChar + ((sum % 10).toString());
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async generateRequestCode(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const count = await this.takeoverRepo.count({
      where: { createdAt: MoreThanOrEqual(startOfMonth) },
    });

    const sequence = (count + 1).toString().padStart(6, '0');
    return `TK-${year}${month}-${sequence}`;
  }
}
