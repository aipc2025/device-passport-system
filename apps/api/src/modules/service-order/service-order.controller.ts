import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceOrderService } from './service-order.service';
import { ServiceRecordService } from './service-record.service';
import {
  CreateServiceOrderDto,
  UpdateServiceOrderDto,
  CreateServiceRecordDto,
  ServiceOrderQueryDto,
  PublicServiceRequestDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser, Public } from '../../common/decorators';
import { UserRole, TokenPayload } from '@device-passport/shared';

@ApiTags('service-orders')
@Controller('service-orders')
export class ServiceOrderController {
  constructor(
    private readonly serviceOrderService: ServiceOrderService,
    private readonly serviceRecordService: ServiceRecordService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all service orders' })
  async findAll(
    @Query() query: ServiceOrderQueryDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.serviceOrderService.findAll(query, user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get service order by ID' })
  async findById(@Param('id') id: string) {
    return this.serviceOrderService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new service order' })
  async create(
    @Body() createDto: CreateServiceOrderDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.serviceOrderService.create(createDto, user.sub);
  }

  @Post('public-request')
  @Public()
  @ApiOperation({ summary: 'Submit public service request (no auth required)' })
  async createPublicRequest(@Body() dto: PublicServiceRequestDto) {
    return this.serviceOrderService.createPublicRequest(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ENGINEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service order' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceOrderDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.serviceOrderService.update(id, updateDto, user.sub);
  }

  @Post(':id/assign/:engineerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign engineer to service order' })
  async assignEngineer(
    @Param('id') id: string,
    @Param('engineerId') engineerId: string,
  ) {
    return this.serviceOrderService.assignEngineer(id, engineerId);
  }

  @Get(':id/records')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get service records for an order' })
  async getRecords(@Param('id') id: string) {
    return this.serviceRecordService.findByServiceOrderId(id);
  }

  @Post(':id/records')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ENGINEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add service record to order' })
  async addRecord(
    @Param('id') id: string,
    @Body() createDto: CreateServiceRecordDto,
    @CurrentUser() user: TokenPayload,
  ) {
    createDto.serviceOrderId = id;
    return this.serviceRecordService.create(createDto, user.sub);
  }
}
