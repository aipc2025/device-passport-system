import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LifecycleEventFilters,
  PaginatedResponse,
  LifecycleTimelineItem,
} from '@device-passport/shared';
import { LifecycleEvent } from '../../database/entities';
import { CreateLifecycleEventDto } from './dto';

@Injectable()
export class LifecycleService {
  constructor(
    @InjectRepository(LifecycleEvent)
    private lifecycleRepository: Repository<LifecycleEvent>
  ) {}

  async findByPassportId(
    passportId: string,
    filters: LifecycleEventFilters = {}
  ): Promise<PaginatedResponse<LifecycleTimelineItem>> {
    const { eventType, fromDate, toDate, page = 1, limit = 50 } = filters;

    const queryBuilder = this.lifecycleRepository
      .createQueryBuilder('event')
      .where('event.passportId = :passportId', { passportId });

    if (eventType) {
      queryBuilder.andWhere('event.eventType = :eventType', { eventType });
    }

    if (fromDate && toDate) {
      queryBuilder.andWhere('event.occurredAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });
    }

    queryBuilder.orderBy('event.occurredAt', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [events, total] = await queryBuilder.getManyAndCount();

    return {
      data: events.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        title: this.getEventTitle(e),
        description: e.description,
        previousStatus: e.previousStatus,
        newStatus: e.newStatus,
        location: e.newLocation,
        performedByName: e.performedByName,
        occurredAt: e.occurredAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<LifecycleEvent> {
    const event = await this.lifecycleRepository.findOne({
      where: { id },
      relations: ['passport', 'performer'],
    });

    if (!event) {
      throw new NotFoundException('Lifecycle event not found');
    }

    return event;
  }

  async create(
    createDto: CreateLifecycleEventDto,
    performedBy: string,
    performedByName: string,
    performedByRole: string
  ): Promise<LifecycleEvent> {
    const event = this.lifecycleRepository.create({
      ...createDto,
      performedBy,
      performedByName,
      performedByRole,
      occurredAt: new Date(),
    });

    return this.lifecycleRepository.save(event);
  }

  private getEventTitle(event: LifecycleEvent): string {
    switch (event.eventType) {
      case 'STATUS_CHANGE':
        return `Status: ${event.previousStatus || 'N/A'} → ${event.newStatus}`;
      case 'LOCATION_CHANGE':
        return `Location: ${event.previousLocation || 'N/A'} → ${event.newLocation}`;
      case 'OWNERSHIP_TRANSFER':
        return 'Ownership Transferred';
      case 'SERVICE_PERFORMED':
        return 'Service Performed';
      case 'DOCUMENT_ATTACHED':
        return 'Document Attached';
      case 'NOTE_ADDED':
        return 'Note Added';
      case 'QC_INSPECTION':
        return 'QC Inspection';
      case 'TEST_RESULT':
        return 'Test Result';
      default:
        return event.eventType;
    }
  }
}
