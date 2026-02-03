import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LifecycleEventType, ServiceOrderStatus } from '@device-passport/shared';
import { ServiceRecord, ServiceOrder, User } from '../../database/entities';
import { CreateServiceRecordDto } from './dto';
import { LifecycleService } from '../lifecycle/lifecycle.service';

@Injectable()
export class ServiceRecordService {
  constructor(
    @InjectRepository(ServiceRecord)
    private serviceRecordRepository: Repository<ServiceRecord>,
    @InjectRepository(ServiceOrder)
    private serviceOrderRepository: Repository<ServiceOrder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private lifecycleService: LifecycleService
  ) {}

  async findByServiceOrderId(serviceOrderId: string): Promise<ServiceRecord[]> {
    return this.serviceRecordRepository.find({
      where: { serviceOrderId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<ServiceRecord> {
    const record = await this.serviceRecordRepository.findOne({
      where: { id },
      relations: ['serviceOrder'],
    });

    if (!record) {
      throw new NotFoundException('Service record not found');
    }

    return record;
  }

  async create(createDto: CreateServiceRecordDto, userId: string): Promise<ServiceRecord> {
    const serviceOrder = await this.serviceOrderRepository.findOne({
      where: { id: createDto.serviceOrderId },
    });

    if (!serviceOrder) {
      throw new NotFoundException('Service order not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    // Calculate work time
    const startTime = new Date(createDto.startTime);
    const endTime = new Date(createDto.endTime);
    const workTime = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const record = this.serviceRecordRepository.create({
      ...createDto,
      startTime,
      endTime,
      workTime,
      createdBy: userId,
      engineerName: user?.name || 'Unknown Engineer',
    });

    const savedRecord = await this.serviceRecordRepository.save(record);

    // Update service order status to in progress if pending/assigned
    if (
      serviceOrder.status === ServiceOrderStatus.PENDING ||
      serviceOrder.status === ServiceOrderStatus.ASSIGNED
    ) {
      serviceOrder.status = ServiceOrderStatus.IN_PROGRESS;
      await this.serviceOrderRepository.save(serviceOrder);
    }

    // Create lifecycle event if there is a passport associated
    if (serviceOrder.passportId) {
      await this.lifecycleService.create(
        {
          passportId: serviceOrder.passportId,
          eventType: LifecycleEventType.SERVICE_PERFORMED,
          description: `Service record added: ${createDto.recordType}`,
          metadata: {
            serviceOrderId: serviceOrder.id,
            serviceRecordId: savedRecord.id,
            recordType: createDto.recordType,
            workPerformed: createDto.workPerformed,
          },
        },
        userId,
        user?.name || 'System',
        user?.role || 'SYSTEM'
      );
    }

    return savedRecord;
  }
}
