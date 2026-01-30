import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import * as QRCode from 'qrcode';
import {
  DeviceStatus,
  VALID_STATUS_TRANSITIONS,
  LifecycleEventType,
  PassportQueryFilters,
  PaginatedResponse,
  PassportListItem,
  generateQRCodeContent,
} from '@device-passport/shared';
import { DevicePassport, User } from '../../database/entities';
import { CreatePassportDto, UpdatePassportDto, UpdateStatusDto } from './dto';
import { PassportCodeService } from './passport-code.service';
import { LifecycleService } from '../lifecycle/lifecycle.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PassportService {
  private baseUrl: string;

  constructor(
    @InjectRepository(DevicePassport)
    private passportRepository: Repository<DevicePassport>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private passportCodeService: PassportCodeService,
    private lifecycleService: LifecycleService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get('VITE_API_URL') || 'http://localhost:3000';
  }

  async findAll(filters: PassportQueryFilters): Promise<PaginatedResponse<PassportListItem>> {
    const {
      search,
      productLine,
      status,
      supplierId,
      customerId,
      fromDate,
      toDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const queryBuilder = this.passportRepository.createQueryBuilder('passport');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(passport.passportCode LIKE :search OR passport.deviceName LIKE :search OR passport.deviceModel LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (productLine) {
      queryBuilder.andWhere('passport.productLine = :productLine', { productLine });
    }

    if (status) {
      queryBuilder.andWhere('passport.status = :status', { status });
    }

    if (supplierId) {
      queryBuilder.andWhere('passport.supplierId = :supplierId', { supplierId });
    }

    if (customerId) {
      queryBuilder.andWhere('passport.customerId = :customerId', { customerId });
    }

    if (fromDate && toDate) {
      queryBuilder.andWhere('passport.createdAt BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });
    }

    // Apply sorting
    queryBuilder.orderBy(`passport.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data.map((p) => ({
        id: p.id,
        passportCode: p.passportCode,
        deviceName: p.deviceName,
        deviceModel: p.deviceModel,
        manufacturer: p.manufacturer,
        productLine: p.productLine,
        status: p.status,
        currentLocation: p.currentLocation,
        createdAt: p.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<DevicePassport> {
    const passport = await this.passportRepository.findOne({
      where: { id },
      relations: ['supplier', 'customer', 'creator', 'updater'],
    });

    if (!passport) {
      throw new NotFoundException('Device passport not found');
    }

    return passport;
  }

  async findByCode(code: string): Promise<DevicePassport> {
    const passport = await this.passportRepository.findOne({
      where: { passportCode: code.toUpperCase() },
      relations: ['supplier', 'customer'],
    });

    if (!passport) {
      throw new NotFoundException('Device passport not found');
    }

    return passport;
  }

  async create(
    createPassportDto: CreatePassportDto,
    userId: string,
  ): Promise<DevicePassport> {
    const { productLine, originCode, ...rest } = createPassportDto;

    // Generate passport code
    const passportCode = await this.passportCodeService.generateCode(
      productLine,
      originCode,
    );

    // Create passport
    const passport = this.passportRepository.create({
      ...rest,
      passportCode,
      productLine,
      originCode,
      status: DeviceStatus.CREATED,
      createdBy: userId,
      updatedBy: userId,
    });

    const savedPassport = await this.passportRepository.save(passport);

    // Create initial lifecycle event
    const user = await this.userRepository.findOne({ where: { id: userId } });
    await this.lifecycleService.create({
      passportId: savedPassport.id,
      eventType: LifecycleEventType.STATUS_CHANGE,
      newStatus: DeviceStatus.CREATED,
      description: 'Device passport created',
    }, userId, user?.name || 'System', user?.role || 'SYSTEM');

    return savedPassport;
  }

  async update(
    id: string,
    updatePassportDto: UpdatePassportDto,
    userId: string,
  ): Promise<DevicePassport> {
    const passport = await this.findById(id);

    Object.assign(passport, updatePassportDto, { updatedBy: userId });

    return this.passportRepository.save(passport);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
    userId: string,
  ): Promise<DevicePassport> {
    const passport = await this.findById(id);
    const { status: newStatus, note, location } = updateStatusDto;

    // Validate status transition
    const validTransitions = VALID_STATUS_TRANSITIONS[passport.status];
    if (!validTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${passport.status} to ${newStatus}`,
      );
    }

    const previousStatus = passport.status;
    const previousLocation = passport.currentLocation;

    // Update passport
    passport.status = newStatus;
    if (location) {
      passport.currentLocation = location;
    }
    passport.updatedBy = userId;

    const updatedPassport = await this.passportRepository.save(passport);

    // Create lifecycle event
    const user = await this.userRepository.findOne({ where: { id: userId } });
    await this.lifecycleService.create({
      passportId: id,
      eventType: LifecycleEventType.STATUS_CHANGE,
      previousStatus,
      newStatus,
      previousLocation,
      newLocation: location,
      description: `Status changed from ${previousStatus} to ${newStatus}`,
      note,
    }, userId, user?.name || 'System', user?.role || 'SYSTEM');

    return updatedPassport;
  }

  async generateQRCode(id: string): Promise<string> {
    const passport = await this.findById(id);
    const content = generateQRCodeContent(passport.passportCode, this.baseUrl);

    // Generate QR code as data URL
    return QRCode.toDataURL(content, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 256,
    });
  }

  async delete(id: string): Promise<void> {
    const passport = await this.findById(id);
    await this.passportRepository.remove(passport);
  }
}
