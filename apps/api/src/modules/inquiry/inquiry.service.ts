import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like } from 'typeorm';
import {
  Inquiry,
  InquiryMessage,
  MarketplaceProduct,
  BuyerRequirement,
  Organization,
} from '../../database/entities';
import { CreateInquiryDto, CreateMessageDto, UpdateInquiryStatusDto } from './dto';
import { InquiryStatus, InquiryMessageType } from '@device-passport/shared';

@Injectable()
export class InquiryService {
  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiryRepository: Repository<Inquiry>,
    @InjectRepository(InquiryMessage)
    private readonly messageRepository: Repository<InquiryMessage>,
    @InjectRepository(MarketplaceProduct)
    private readonly productRepository: Repository<MarketplaceProduct>,
    @InjectRepository(BuyerRequirement)
    private readonly requirementRepository: Repository<BuyerRequirement>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>
  ) {}

  /**
   * Create a new inquiry
   */
  async createInquiry(buyerOrgId: string, userId: string, dto: CreateInquiryDto): Promise<Inquiry> {
    // Validate supplier organization
    const supplierOrg = await this.organizationRepository.findOne({
      where: { id: dto.supplierOrgId },
    });
    if (!supplierOrg) {
      throw new NotFoundException('Supplier organization not found');
    }

    // Can't send inquiry to yourself
    if (dto.supplierOrgId === buyerOrgId) {
      throw new BadRequestException('Cannot send inquiry to your own organization');
    }

    // Validate related entities if provided
    if (dto.marketplaceProductId) {
      const product = await this.productRepository.findOne({
        where: { id: dto.marketplaceProductId },
      });
      if (!product) {
        throw new NotFoundException('Marketplace product not found');
      }
    }

    if (dto.buyerRequirementId) {
      const requirement = await this.requirementRepository.findOne({
        where: { id: dto.buyerRequirementId },
      });
      if (!requirement) {
        throw new NotFoundException('Buyer requirement not found');
      }
    }

    // Generate inquiry code
    const inquiryCode = await this.generateInquiryCode();

    const inquiry = this.inquiryRepository.create({
      inquiryCode,
      marketplaceProductId: dto.marketplaceProductId,
      buyerRequirementId: dto.buyerRequirementId,
      matchResultId: dto.matchResultId,
      buyerOrgId,
      supplierOrgId: dto.supplierOrgId,
      initiatedByUserId: userId,
      subject: dto.subject,
      message: dto.message,
      quantity: dto.quantity,
      targetPrice: dto.targetPrice,
      targetCurrency: dto.targetCurrency || 'USD',
      requiredDeliveryDate: dto.requiredDeliveryDate ? new Date(dto.requiredDeliveryDate) : null,
      status: InquiryStatus.PENDING,
    });

    const savedInquiry = await this.inquiryRepository.save(inquiry);

    // Create initial message if content provided
    if (dto.message) {
      const initialMessage = this.messageRepository.create({
        inquiryId: savedInquiry.id,
        senderUserId: userId,
        senderOrgId: buyerOrgId,
        messageType: InquiryMessageType.MESSAGE,
        content: dto.message,
      });
      await this.messageRepository.save(initialMessage);
    }

    // Update product inquiry count if linked
    if (dto.marketplaceProductId) {
      await this.productRepository.increment({ id: dto.marketplaceProductId }, 'inquiryCount', 1);
    }

    // Update requirement quote count if linked
    if (dto.buyerRequirementId) {
      await this.requirementRepository.increment({ id: dto.buyerRequirementId }, 'quoteCount', 1);
    }

    return this.getInquiryById(savedInquiry.id);
  }

  /**
   * Get inquiry by ID with messages
   */
  async getInquiryById(id: string): Promise<Inquiry> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id },
      relations: [
        'buyerOrg',
        'supplierOrg',
        'marketplaceProduct',
        'buyerRequirement',
        'initiatedByUser',
        'messages',
        'messages.senderUser',
      ],
    });

    if (!inquiry) {
      throw new NotFoundException('Inquiry not found');
    }

    // Sort messages by creation time
    inquiry.messages?.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return inquiry;
  }

  /**
   * Get inquiry with ownership check
   */
  async getInquiryWithAccess(id: string, organizationId: string): Promise<Inquiry> {
    const inquiry = await this.getInquiryById(id);

    if (inquiry.buyerOrgId !== organizationId && inquiry.supplierOrgId !== organizationId) {
      throw new ForbiddenException('You do not have access to this inquiry');
    }

    return inquiry;
  }

  /**
   * Get sent inquiries (as buyer)
   */
  async getSentInquiries(organizationId: string): Promise<Inquiry[]> {
    return this.inquiryRepository.find({
      where: { buyerOrgId: organizationId },
      relations: ['supplierOrg', 'marketplaceProduct'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get received inquiries (as supplier)
   */
  async getReceivedInquiries(organizationId: string): Promise<Inquiry[]> {
    return this.inquiryRepository.find({
      where: { supplierOrgId: organizationId },
      relations: ['buyerOrg', 'marketplaceProduct', 'buyerRequirement'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get all inquiries for an organization
   */
  async getAllInquiries(organizationId: string): Promise<Inquiry[]> {
    return this.inquiryRepository.find({
      where: [{ buyerOrgId: organizationId }, { supplierOrgId: organizationId }],
      relations: ['buyerOrg', 'supplierOrg', 'marketplaceProduct'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update inquiry status
   */
  async updateStatus(
    id: string,
    organizationId: string,
    dto: UpdateInquiryStatusDto
  ): Promise<Inquiry> {
    const inquiry = await this.getInquiryWithAccess(id, organizationId);

    // Validate status transition
    const validTransitions: Record<InquiryStatus, InquiryStatus[]> = {
      [InquiryStatus.PENDING]: [
        InquiryStatus.RESPONDED,
        InquiryStatus.REJECTED,
        InquiryStatus.EXPIRED,
      ],
      [InquiryStatus.RESPONDED]: [
        InquiryStatus.NEGOTIATING,
        InquiryStatus.ACCEPTED,
        InquiryStatus.REJECTED,
      ],
      [InquiryStatus.NEGOTIATING]: [
        InquiryStatus.ACCEPTED,
        InquiryStatus.REJECTED,
        InquiryStatus.EXPIRED,
      ],
      [InquiryStatus.ACCEPTED]: [],
      [InquiryStatus.REJECTED]: [],
      [InquiryStatus.EXPIRED]: [],
    };

    if (!validTransitions[inquiry.status]?.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from ${inquiry.status} to ${dto.status}`);
    }

    inquiry.status = dto.status;

    if (dto.status === InquiryStatus.RESPONDED && !inquiry.respondedAt) {
      inquiry.respondedAt = new Date();
    }

    if (
      [InquiryStatus.ACCEPTED, InquiryStatus.REJECTED, InquiryStatus.EXPIRED].includes(dto.status)
    ) {
      inquiry.closedAt = new Date();
      if (dto.closeReason) {
        inquiry.closeReason = dto.closeReason;
      }
    }

    return this.inquiryRepository.save(inquiry);
  }

  /**
   * Send a message in an inquiry
   */
  async sendMessage(
    inquiryId: string,
    userId: string,
    organizationId: string,
    dto: CreateMessageDto
  ): Promise<InquiryMessage> {
    const inquiry = await this.getInquiryWithAccess(inquiryId, organizationId);

    // Check if inquiry is still active
    if (
      [InquiryStatus.ACCEPTED, InquiryStatus.REJECTED, InquiryStatus.EXPIRED].includes(
        inquiry.status
      )
    ) {
      throw new BadRequestException('Cannot send messages to a closed inquiry');
    }

    const message = this.messageRepository.create({
      inquiryId,
      senderUserId: userId,
      senderOrgId: organizationId,
      messageType: dto.messageType,
      content: dto.content,
      quotePrice: dto.quotePrice,
      quoteCurrency: dto.quoteCurrency,
      quoteValidUntil: dto.quoteValidUntil ? new Date(dto.quoteValidUntil) : null,
      quotedLeadTimeDays: dto.quotedLeadTimeDays,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update inquiry status based on message type (use update() to avoid relation sync issues)
    if (dto.messageType === InquiryMessageType.QUOTE && inquiry.status === InquiryStatus.PENDING) {
      await this.inquiryRepository.update(inquiryId, {
        status: InquiryStatus.RESPONDED,
        respondedAt: new Date(),
      });
    } else if (dto.messageType === InquiryMessageType.COUNTER_OFFER) {
      await this.inquiryRepository.update(inquiryId, {
        status: InquiryStatus.NEGOTIATING,
      });
    } else if (dto.messageType === InquiryMessageType.ACCEPTANCE) {
      await this.inquiryRepository.update(inquiryId, {
        status: InquiryStatus.ACCEPTED,
        closedAt: new Date(),
      });
    } else if (dto.messageType === InquiryMessageType.REJECTION) {
      await this.inquiryRepository.update(inquiryId, {
        status: InquiryStatus.REJECTED,
        closedAt: new Date(),
      });
    }

    return savedMessage;
  }

  /**
   * Get messages for an inquiry
   */
  async getMessages(inquiryId: string, organizationId: string): Promise<InquiryMessage[]> {
    await this.getInquiryWithAccess(inquiryId, organizationId);

    return this.messageRepository.find({
      where: { inquiryId },
      relations: ['senderUser'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(inquiryId: string, organizationId: string): Promise<void> {
    await this.getInquiryWithAccess(inquiryId, organizationId);

    await this.messageRepository.update(
      {
        inquiryId,
        senderOrgId: organizationId === '' ? undefined : organizationId, // Mark other party's messages
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Actually we want to mark messages NOT from our org as read
    const messages = await this.messageRepository.find({
      where: { inquiryId, isRead: false },
    });

    for (const msg of messages) {
      if (msg.senderOrgId !== organizationId) {
        msg.isRead = true;
        msg.readAt = new Date();
        await this.messageRepository.save(msg);
      }
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(organizationId: string): Promise<number> {
    const inquiries = await this.inquiryRepository.find({
      where: [{ buyerOrgId: organizationId }, { supplierOrgId: organizationId }],
      select: ['id'],
    });

    const inquiryIds = inquiries.map((i) => i.id);

    if (inquiryIds.length === 0) return 0;

    const count = await this.messageRepository.count({
      where: {
        inquiryId: In(inquiryIds),
        isRead: false,
        // Exclude messages sent by this org
      },
    });

    // Get actual unread from other orgs
    const messages = await this.messageRepository.find({
      where: {
        inquiryId: In(inquiryIds),
        isRead: false,
      },
    });

    return messages.filter((m) => m.senderOrgId !== organizationId).length;
  }

  /**
   * Generate inquiry code
   */
  private async generateInquiryCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INQ-${year}-`;

    // Find the highest sequence number for this year
    const lastInquiry = await this.inquiryRepository.findOne({
      where: { inquiryCode: Like(`${prefix}%`) },
      order: { inquiryCode: 'DESC' },
    });

    let nextSeq = 1;
    if (lastInquiry && lastInquiry.inquiryCode) {
      const lastSeq = parseInt(lastInquiry.inquiryCode.replace(prefix, ''), 10);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }

    const seq = nextSeq.toString().padStart(6, '0');
    return `${prefix}${seq}`;
  }
}
