import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  ServiceOrderStatus,
  ServiceOrderFilters,
  PaginatedResponse,
  ServiceOrderListItem,
  LifecycleEventType,
} from '@device-passport/shared';
import {
  ServiceOrder,
  DevicePassport,
  Organization,
  User,
} from '../../database/entities';
import { CreateServiceOrderDto, UpdateServiceOrderDto, PublicServiceRequestDto } from './dto';
import { LifecycleService } from '../lifecycle/lifecycle.service';

@Injectable()
export class ServiceOrderService {
  constructor(
    @InjectRepository(ServiceOrder)
    private serviceOrderRepository: Repository<ServiceOrder>,
    @InjectRepository(DevicePassport)
    private passportRepository: Repository<DevicePassport>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private lifecycleService: LifecycleService,
  ) {}

  async findAll(
    filters: ServiceOrderFilters,
    userId?: string,
  ): Promise<PaginatedResponse<ServiceOrderListItem>> {
    const {
      search,
      status,
      serviceType,
      priority,
      customerId,
      assignedEngineerId,
      fromDate,
      toDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.serviceOrderRepository.createQueryBuilder('order');

    if (search) {
      queryBuilder.andWhere(
        '(order.orderNumber LIKE :search OR order.title LIKE :search OR order.passportCode LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (serviceType) {
      queryBuilder.andWhere('order.serviceType = :serviceType', { serviceType });
    }

    if (priority) {
      queryBuilder.andWhere('order.priority = :priority', { priority });
    }

    if (customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId });
    }

    if (assignedEngineerId) {
      queryBuilder.andWhere('order.assignedEngineerId = :assignedEngineerId', {
        assignedEngineerId,
      });
    }

    if (fromDate && toDate) {
      queryBuilder.andWhere('order.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });
    }

    queryBuilder.orderBy(`order.${sortBy}`, sortOrder);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        passportCode: o.passportCode,
        serviceType: o.serviceType,
        status: o.status,
        priority: o.priority,
        title: o.title,
        customerName: o.customerName,
        assignedEngineerName: o.assignedEngineerName,
        scheduledDate: o.scheduledDate,
        createdAt: o.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<ServiceOrder> {
    const order = await this.serviceOrderRepository.findOne({
      where: { id },
      relations: ['passport', 'customer', 'assignedEngineer', 'serviceRecords'],
    });

    if (!order) {
      throw new NotFoundException('Service order not found');
    }

    return order;
  }

  async create(
    createDto: CreateServiceOrderDto,
    userId: string,
  ): Promise<ServiceOrder> {
    // Find passport
    const passport = await this.passportRepository.findOne({
      where: { passportCode: createDto.passportCode.toUpperCase() },
      relations: ['customer'],
    });

    if (!passport) {
      throw new NotFoundException('Device passport not found');
    }

    // Get user info
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    const order = this.serviceOrderRepository.create({
      ...createDto,
      orderNumber,
      passportId: passport.id,
      passportCode: passport.passportCode,
      customerId: user?.organizationId || passport.customerId,
      customerName: user?.organization?.name || 'Unknown Customer',
      createdBy: userId,
      status: ServiceOrderStatus.PENDING,
    });

    const savedOrder = await this.serviceOrderRepository.save(order);

    // Create lifecycle event
    await this.lifecycleService.create(
      {
        passportId: passport.id,
        eventType: LifecycleEventType.SERVICE_PERFORMED,
        description: `Service order created: ${savedOrder.orderNumber}`,
        metadata: {
          serviceOrderId: savedOrder.id,
          serviceType: savedOrder.serviceType,
        },
      },
      userId,
      user?.name || 'System',
      user?.role || 'SYSTEM',
    );

    return savedOrder;
  }

  async createPublicRequest(dto: PublicServiceRequestDto): Promise<ServiceOrder> {
    // Find passport
    const passport = await this.passportRepository.findOne({
      where: { passportCode: dto.passportCode.toUpperCase() },
    });

    if (!passport) {
      throw new NotFoundException('Device passport not found');
    }

    const orderNumber = await this.generateOrderNumber();

    const order = this.serviceOrderRepository.create({
      ...dto,
      orderNumber,
      passportId: passport.id,
      passportCode: passport.passportCode,
      customerId: passport.customerId,
      customerName: dto.contactName,
      customerNotes: dto.description,
      status: ServiceOrderStatus.PENDING,
      createdBy: 'PUBLIC',
    });

    return this.serviceOrderRepository.save(order);
  }

  async update(
    id: string,
    updateDto: UpdateServiceOrderDto,
    userId: string,
  ): Promise<ServiceOrder> {
    const order = await this.findById(id);

    // If assigning engineer, get their name
    if (updateDto.assignedEngineerId) {
      const engineer = await this.userRepository.findOne({
        where: { id: updateDto.assignedEngineerId },
      });
      if (engineer) {
        order.assignedEngineerName = engineer.name;
      }
    }

    Object.assign(order, updateDto);

    // If completing, set completion date
    if (updateDto.status === ServiceOrderStatus.COMPLETED && !order.completedDate) {
      order.completedDate = new Date();
    }

    return this.serviceOrderRepository.save(order);
  }

  async assignEngineer(id: string, engineerId: string): Promise<ServiceOrder> {
    const order = await this.findById(id);
    const engineer = await this.userRepository.findOne({
      where: { id: engineerId },
    });

    if (!engineer) {
      throw new NotFoundException('Engineer not found');
    }

    order.assignedEngineerId = engineerId;
    order.assignedEngineerName = engineer.name;
    order.status = ServiceOrderStatus.ASSIGNED;

    return this.serviceOrderRepository.save(order);
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');

    // Get count for this month
    const count = await this.serviceOrderRepository.count({
      where: {
        orderNumber: Like(`SO-${year}${month}-%`),
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `SO-${year}${month}-${sequence}`;
  }
}
