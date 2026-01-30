# Backend Development Skill - NestJS API

## Module Structure Template

When creating a new module, follow this structure:

```
src/modules/{module-name}/
├── {module-name}.module.ts
├── {module-name}.controller.ts
├── {module-name}.service.ts
├── {module-name}.repository.ts (if needed)
├── dto/
│   ├── index.ts
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   └── query-{entity}.dto.ts
├── entities/
│   └── {entity}.entity.ts
├── interfaces/
│   └── {module-name}.interface.ts
└── __tests__/
    ├── {module-name}.controller.spec.ts
    └── {module-name}.service.spec.ts
```

## Entity Template

```typescript
// entities/device-passport.entity.ts
import { 
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, 
  UpdateDateColumn, ManyToOne, OneToMany, Index 
} from 'typeorm';

export enum DeviceStatus {
  CREATED = 'CREATED',
  PROCURED = 'PROCURED',
  IN_QC = 'IN_QC',
  QC_PASSED = 'QC_PASSED',
  QC_FAILED = 'QC_FAILED',
  IN_ASSEMBLY = 'IN_ASSEMBLY',
  IN_TESTING = 'IN_TESTING',
  TEST_PASSED = 'TEST_PASSED',
  PACKAGED = 'PACKAGED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  IN_SERVICE = 'IN_SERVICE',
  DECOMMISSIONED = 'DECOMMISSIONED',
}

export enum ProductLine {
  PLC = 'PLC',
  MOT = 'MOT',
  SEN = 'SEN',
  CTL = 'CTL',
  ROB = 'ROB',
  HMI = 'HMI',
  INV = 'INV',
  VLV = 'VLV',
  PCB = 'PCB',
  OTH = 'OTH',
}

@Entity('device_passports')
export class DevicePassport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'passport_code', unique: true, length: 30 })
  @Index()
  passportCode: string;

  @Column({ name: 'device_name', length: 100 })
  deviceName: string;

  @Column({ name: 'device_model', length: 50 })
  deviceModel: string;

  @Column({ name: 'product_line', type: 'enum', enum: ProductLine })
  @Index()
  productLine: ProductLine;

  @Column({ name: 'origin_country', length: 2 })
  originCountry: string;

  @Column({ name: 'manufacturer_id', type: 'uuid', nullable: true })
  manufacturerId: string;

  @Column({ name: 'manufacturer_name', length: 100, nullable: true })
  manufacturerName: string;

  @Column({ type: 'jsonb', default: {} })
  specifications: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'warranty_months', default: 12 })
  warrantyMonths: number;

  @Column({ 
    name: 'current_status', 
    type: 'enum', 
    enum: DeviceStatus, 
    default: DeviceStatus.CREATED 
  })
  @Index()
  currentStatus: DeviceStatus;

  @Column({ name: 'current_owner_id', type: 'uuid', nullable: true })
  currentOwnerId: string;

  @Column({ name: 'blockchain_hash', length: 66, nullable: true })
  blockchainHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  // Relations
  @OneToMany(() => LifecycleEvent, event => event.device)
  lifecycleEvents: LifecycleEvent[];

  @OneToMany(() => ServiceOrder, order => order.device)
  serviceOrders: ServiceOrder[];
}
```

## DTO Template

```typescript
// dto/create-passport.dto.ts
import { 
  IsString, IsNotEmpty, IsEnum, IsOptional, 
  MaxLength, IsObject, IsNumber, Min 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductLine } from '../entities/device-passport.entity';

export class CreatePassportDto {
  @ApiProperty({ description: 'Device name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  deviceName: string;

  @ApiProperty({ description: 'Device model', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  deviceModel: string;

  @ApiProperty({ enum: ProductLine, description: 'Product line code' })
  @IsEnum(ProductLine)
  productLine: ProductLine;

  @ApiProperty({ description: 'Origin country code (ISO 3166-1 alpha-2)', maxLength: 2 })
  @IsString()
  @MaxLength(2)
  originCountry: string;

  @ApiPropertyOptional({ description: 'Manufacturer name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  manufacturerName?: string;

  @ApiPropertyOptional({ description: 'Device specifications' })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Device description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Warranty period in months', default: 12 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  warrantyMonths?: number;
}
```

## Service Template

```typescript
// passport.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DevicePassport, DeviceStatus } from './entities/device-passport.entity';
import { LifecycleEvent } from './entities/lifecycle-event.entity';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { PassportCodeService } from './services/passport-code.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PassportService {
  constructor(
    @InjectRepository(DevicePassport)
    private passportRepository: Repository<DevicePassport>,
    @InjectRepository(LifecycleEvent)
    private lifecycleRepository: Repository<LifecycleEvent>,
    private passportCodeService: PassportCodeService,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreatePassportDto, user: User): Promise<DevicePassport> {
    // Generate passport code
    const passportCode = await this.passportCodeService.generatePassportCode(
      dto.productLine,
      dto.originCountry,
    );

    // Create passport
    const passport = this.passportRepository.create({
      ...dto,
      passportCode,
      createdBy: user.id,
    });

    // Use transaction to create passport and initial lifecycle event
    return await this.dataSource.transaction(async (manager) => {
      const savedPassport = await manager.save(passport);

      // Create initial lifecycle event
      const event = this.lifecycleRepository.create({
        deviceId: savedPassport.id,
        eventStage: DeviceStatus.CREATED,
        eventDate: new Date(),
        operatorId: user.id,
        operatorName: user.fullName,
        operatorRole: user.role,
        note: 'Device passport created',
      });
      await manager.save(event);

      return savedPassport;
    });
  }

  async findAll(query: {
    status?: DeviceStatus;
    productLine?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, productLine, page = 1, limit = 20 } = query;
    
    const qb = this.passportRepository.createQueryBuilder('passport');

    if (status) {
      qb.andWhere('passport.currentStatus = :status', { status });
    }
    if (productLine) {
      qb.andWhere('passport.productLine = :productLine', { productLine });
    }

    const [items, total] = await qb
      .orderBy('passport.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<DevicePassport> {
    const passport = await this.passportRepository.findOne({
      where: { id },
      relations: ['lifecycleEvents', 'serviceOrders'],
    });

    if (!passport) {
      throw new NotFoundException(`Device passport not found: ${id}`);
    }

    return passport;
  }

  async findByCode(code: string): Promise<DevicePassport> {
    const passport = await this.passportRepository.findOne({
      where: { passportCode: code },
      relations: ['lifecycleEvents'],
    });

    if (!passport) {
      throw new NotFoundException(`Device passport not found: ${code}`);
    }

    return passport;
  }

  async getPublicInfo(code: string) {
    const passport = await this.findByCode(code);

    // Return only public fields
    return {
      passportCode: passport.passportCode,
      deviceName: passport.deviceName,
      deviceModel: passport.deviceModel,
      productLine: passport.productLine,
      originCountry: passport.originCountry,
      manufacturerName: passport.manufacturerName,
      currentStatus: passport.currentStatus,
      warrantyMonths: passport.warrantyMonths,
      lifecycleSummary: passport.lifecycleEvents.map(e => ({
        stage: e.eventStage,
        date: e.eventDate,
        completed: true,
      })),
      contactInfo: {
        phone: '400-XXX-XXXX',
        email: 'service@example.com',
      },
      serviceUrl: `/service/request?device=${passport.passportCode}`,
    };
  }

  async updateStatus(
    id: string, 
    dto: UpdateStatusDto, 
    user: User
  ): Promise<DevicePassport> {
    const passport = await this.findOne(id);

    // Validate status transition (add your business rules)
    this.validateStatusTransition(passport.currentStatus, dto.status);

    return await this.dataSource.transaction(async (manager) => {
      // Update status
      passport.currentStatus = dto.status;
      await manager.save(passport);

      // Create lifecycle event
      const event = this.lifecycleRepository.create({
        deviceId: passport.id,
        eventStage: dto.status,
        eventDate: new Date(),
        operatorId: user.id,
        operatorName: user.fullName,
        operatorRole: user.role,
        note: dto.note,
        attachments: dto.attachments,
      });
      await manager.save(event);

      return passport;
    });
  }

  private validateStatusTransition(current: DeviceStatus, next: DeviceStatus) {
    // Define valid transitions
    const validTransitions: Record<DeviceStatus, DeviceStatus[]> = {
      [DeviceStatus.CREATED]: [DeviceStatus.PROCURED],
      [DeviceStatus.PROCURED]: [DeviceStatus.IN_QC],
      [DeviceStatus.IN_QC]: [DeviceStatus.QC_PASSED, DeviceStatus.QC_FAILED],
      [DeviceStatus.QC_PASSED]: [DeviceStatus.IN_ASSEMBLY],
      [DeviceStatus.QC_FAILED]: [DeviceStatus.IN_QC, DeviceStatus.DECOMMISSIONED],
      [DeviceStatus.IN_ASSEMBLY]: [DeviceStatus.IN_TESTING],
      [DeviceStatus.IN_TESTING]: [DeviceStatus.TEST_PASSED, DeviceStatus.IN_ASSEMBLY],
      [DeviceStatus.TEST_PASSED]: [DeviceStatus.PACKAGED],
      [DeviceStatus.PACKAGED]: [DeviceStatus.IN_TRANSIT],
      [DeviceStatus.IN_TRANSIT]: [DeviceStatus.DELIVERED],
      [DeviceStatus.DELIVERED]: [DeviceStatus.IN_SERVICE],
      [DeviceStatus.IN_SERVICE]: [DeviceStatus.DECOMMISSIONED],
      [DeviceStatus.DECOMMISSIONED]: [],
    };

    if (!validTransitions[current]?.includes(next)) {
      throw new BadRequestException(
        `Invalid status transition: ${current} → ${next}`
      );
    }
  }
}
```

## Controller Template

```typescript
// passport.controller.ts
import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, Request, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { PassportService } from './passport.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { QueryPassportDto } from './dto/query-passport.dto';

@ApiTags('Device Passports')
@Controller('api/v1/passports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PassportController {
  constructor(private readonly passportService: PassportService) {}

  @Post()
  @Roles('ADMIN', 'OPERATOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new device passport' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Passport created' })
  async create(@Body() dto: CreatePassportDto, @Request() req) {
    const passport = await this.passportService.create(dto, req.user);
    return { success: true, data: passport };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all device passports' })
  async findAll(@Query() query: QueryPassportDto) {
    const result = await this.passportService.findAll(query);
    return { success: true, ...result };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get device passport by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    const passport = await this.passportService.findOne(id);
    return { success: true, data: passport };
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'OPERATOR', 'QC_INSPECTOR', 'ASSEMBLER', 'TESTER', 'PACKAGER', 'LOGISTICS')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update device status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @Request() req,
  ) {
    const passport = await this.passportService.updateStatus(id, dto, req.user);
    return { success: true, data: passport };
  }

  @Get(':id/lifecycle')
  @Public()
  @ApiOperation({ summary: 'Get device lifecycle events' })
  async getLifecycle(@Param('id') id: string) {
    const passport = await this.passportService.findOne(id);
    return { success: true, data: passport.lifecycleEvents };
  }
}

// Public scan controller (separate for clarity)
@ApiTags('Public')
@Controller('api/v1/scan')
export class ScanController {
  constructor(private readonly passportService: PassportService) {}

  @Get(':code')
  @Public()
  @ApiOperation({ summary: 'Scan device QR code - public info' })
  async scanDevice(@Param('code') code: string) {
    const info = await this.passportService.getPublicInfo(code);
    return { success: true, data: info };
  }
}
```

## Passport Code Service

```typescript
// services/passport-code.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PassportCodeService {
  private readonly CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private readonly COMPANY_CODE = 'MED';

  constructor(private dataSource: DataSource) {}

  /**
   * Generate checksum using modified Luhn algorithm
   */
  generateChecksum(code: string): string {
    let sum = 0;
    for (let i = 0; i < code.length; i++) {
      const char = code[i].toUpperCase();
      const value = this.CHARS.indexOf(char);
      if (value >= 0) {
        sum += (i % 2 === 0) ? value : value * 2;
      }
    }
    const checkNum = (36 - (sum % 36)) % 36;
    return this.CHARS[Math.floor(checkNum / 6) % 36] + this.CHARS[checkNum % 36];
  }

  /**
   * Get next sequence number with database lock
   */
  async getNextSequence(year: number, productLine: string, origin: string): Promise<number> {
    const key = `${year}-${productLine}-${origin}`;

    return await this.dataSource.transaction(async (manager) => {
      const result = await manager.query(
        `SELECT current_value FROM sequence_counters WHERE sequence_key = $1 FOR UPDATE`,
        [key]
      );

      if (result.length > 0) {
        const newValue = result[0].current_value + 1;
        await manager.query(
          `UPDATE sequence_counters SET current_value = $1, last_updated = NOW() WHERE sequence_key = $2`,
          [newValue, key]
        );
        return newValue;
      } else {
        await manager.query(
          `INSERT INTO sequence_counters (sequence_key, current_value) VALUES ($1, 1)`,
          [key]
        );
        return 1;
      }
    });
  }

  /**
   * Generate complete passport code
   */
  async generatePassportCode(productLine: string, origin: string): Promise<string> {
    const year = new Date().getFullYear();
    const sequence = await this.getNextSequence(year, productLine, origin);
    
    const baseCode = `DP-${this.COMPANY_CODE}-${year}-${productLine}-${origin}-${
      String(sequence).padStart(6, '0')
    }`;
    
    const checksum = this.generateChecksum(baseCode);
    return `${baseCode}-${checksum}`;
  }

  /**
   * Validate passport code format and checksum
   */
  validatePassportCode(code: string): { valid: boolean; error?: string } {
    const pattern = /^DP-[A-Z]{3}-\d{4}-[A-Z]{3}-[A-Z]{2}-\d{6}-[A-Z0-9]{2}$/;
    
    if (!pattern.test(code)) {
      return { valid: false, error: 'Invalid format' };
    }

    const parts = code.split('-');
    const checksumInCode = parts.pop();
    const baseCode = parts.join('-');
    const expectedChecksum = this.generateChecksum(baseCode);

    if (checksumInCode !== expectedChecksum) {
      return { valid: false, error: 'Invalid checksum' };
    }

    return { valid: true };
  }
}
```

## Authentication Guard

```typescript
// auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
}

// auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

## Testing Template

```typescript
// __tests__/passport.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PassportService } from '../passport.service';
import { DevicePassport, DeviceStatus, ProductLine } from '../entities/device-passport.entity';
import { PassportCodeService } from '../services/passport-code.service';

describe('PassportService', () => {
  let service: PassportService;
  let repository: jest.Mocked<Repository<DevicePassport>>;
  let passportCodeService: jest.Mocked<PassportCodeService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PassportService,
        {
          provide: getRepositoryToken(DevicePassport),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: PassportCodeService,
          useValue: {
            generatePassportCode: jest.fn(),
            validatePassportCode: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn((cb) => cb({
              save: jest.fn((entity) => Promise.resolve(entity)),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<PassportService>(PassportService);
    repository = module.get(getRepositoryToken(DevicePassport));
    passportCodeService = module.get(PassportCodeService);
  });

  describe('create', () => {
    it('should create a new passport with generated code', async () => {
      const dto = {
        deviceName: 'Test Device',
        deviceModel: 'MODEL-001',
        productLine: ProductLine.PLC,
        originCountry: 'DE',
      };
      const user = { id: 'user-1', fullName: 'Test User', role: 'ADMIN' };
      const expectedCode = 'DP-MED-2025-PLC-DE-000001-A7';

      passportCodeService.generatePassportCode.mockResolvedValue(expectedCode);
      repository.create.mockReturnValue({ ...dto, passportCode: expectedCode } as any);

      const result = await service.create(dto, user as any);

      expect(passportCodeService.generatePassportCode).toHaveBeenCalledWith('PLC', 'DE');
      expect(result.passportCode).toBe(expectedCode);
    });
  });

  describe('validateStatusTransition', () => {
    it('should allow valid transitions', () => {
      expect(() => 
        service['validateStatusTransition'](DeviceStatus.CREATED, DeviceStatus.PROCURED)
      ).not.toThrow();
    });

    it('should reject invalid transitions', () => {
      expect(() => 
        service['validateStatusTransition'](DeviceStatus.CREATED, DeviceStatus.DELIVERED)
      ).toThrow();
    });
  });
});
```

## Database Migration Template

```typescript
// database/migrations/1706000000000-CreateDevicePassport.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDevicePassport1706000000000 implements MigrationInterface {
  name = 'CreateDevicePassport1706000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "device_status_enum" AS ENUM (
        'CREATED', 'PROCURED', 'IN_QC', 'QC_PASSED', 'QC_FAILED',
        'IN_ASSEMBLY', 'IN_TESTING', 'TEST_PASSED', 'PACKAGED',
        'IN_TRANSIT', 'DELIVERED', 'IN_SERVICE', 'DECOMMISSIONED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "product_line_enum" AS ENUM (
        'PLC', 'MOT', 'SEN', 'CTL', 'ROB', 'HMI', 'INV', 'VLV', 'PCB', 'OTH'
      )
    `);

    // Create device_passports table
    await queryRunner.query(`
      CREATE TABLE "device_passports" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "passport_code" varchar(30) NOT NULL,
        "device_name" varchar(100) NOT NULL,
        "device_model" varchar(50) NOT NULL,
        "product_line" "product_line_enum" NOT NULL,
        "origin_country" varchar(2) NOT NULL,
        "manufacturer_id" uuid,
        "manufacturer_name" varchar(100),
        "specifications" jsonb DEFAULT '{}',
        "description" text,
        "warranty_months" integer DEFAULT 12,
        "current_status" "device_status_enum" DEFAULT 'CREATED',
        "current_owner_id" uuid,
        "blockchain_hash" varchar(66),
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
        "created_by" uuid,
        CONSTRAINT "PK_device_passports" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_passport_code" UNIQUE ("passport_code")
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_passport_code" ON "device_passports" ("passport_code")`);
    await queryRunner.query(`CREATE INDEX "IDX_passport_status" ON "device_passports" ("current_status")`);
    await queryRunner.query(`CREATE INDEX "IDX_passport_product_line" ON "device_passports" ("product_line")`);

    // Create sequence_counters table
    await queryRunner.query(`
      CREATE TABLE "sequence_counters" (
        "id" SERIAL PRIMARY KEY,
        "sequence_key" varchar(30) NOT NULL UNIQUE,
        "current_value" integer NOT NULL DEFAULT 0,
        "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sequence_counters"`);
    await queryRunner.query(`DROP TABLE "device_passports"`);
    await queryRunner.query(`DROP TYPE "product_line_enum"`);
    await queryRunner.query(`DROP TYPE "device_status_enum"`);
  }
}
```

## Common Response Interceptor

```typescript
// common/interceptors/transform.interceptor.ts
import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map(data => {
        // If response already has success property, return as is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
```
