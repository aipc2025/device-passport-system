import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DeviceTakeoverService } from './device-takeover.service';
import { TakeoverStatus, TakeoverReason, UserRole } from '@device-passport/shared';

// ============================================
// Customer Controller
// ============================================

@ApiTags('Device Takeover')
@Controller('device-takeover')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DeviceTakeoverController {
  constructor(private readonly takeoverService: DeviceTakeoverService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a device takeover request' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['deviceName', 'takeoverReason'],
      properties: {
        deviceName: { type: 'string' },
        deviceModel: { type: 'string' },
        manufacturer: { type: 'string' },
        serialNumber: { type: 'string' },
        purchaseDate: { type: 'string', format: 'date' },
        warrantyExpiry: { type: 'string', format: 'date' },
        takeoverReason: { type: 'string', enum: Object.values(TakeoverReason) },
        reasonDescription: { type: 'string' },
        photos: { type: 'array', items: { type: 'string' } },
        documents: { type: 'array', items: { type: 'string' } },
        nameplatePhotos: { type: 'array', items: { type: 'string' } },
        estimatedValue: { type: 'number' },
        valueCurrency: { type: 'string' },
        deviceLocation: { type: 'string' },
        industry: { type: 'string' },
        customerNotes: { type: 'string' },
      },
    },
  })
  async createRequest(@Request() req: any, @Body() body: any) {
    return this.takeoverService.createTakeoverRequest(req.user.sub, {
      ...body,
      organizationId: req.user.organizationId,
    });
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get my takeover requests' })
  async getMyRequests(@Request() req: any) {
    return this.takeoverService.getMyTakeoverRequests(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get takeover request details' })
  async getRequest(@Param('id') id: string) {
    return this.takeoverService.getTakeoverRequest(id);
  }
}

// ============================================
// Expert Controller (for inspections)
// ============================================

@ApiTags('Device Takeover - Expert')
@Controller('device-takeover/expert')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DeviceTakeoverExpertController {
  constructor(private readonly takeoverService: DeviceTakeoverService) {}

  @Post(':id/inspection-report')
  @ApiOperation({ summary: 'Submit inspection report for a device' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['overallCondition', 'functionalStatus'],
      properties: {
        overallCondition: { type: 'string', enum: ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'] },
        functionalStatus: { type: 'string' },
        notes: { type: 'string' },
        photos: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async submitInspectionReport(
    @Param('id') id: string,
    @Request() req: any,
    @Body()
    body: {
      overallCondition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
      functionalStatus: string;
      notes: string;
      photos: string[];
    }
  ) {
    return this.takeoverService.submitInspectionReport(id, req.user.expertId || req.user.sub, body);
  }
}

// ============================================
// Admin Controller
// ============================================

@ApiTags('Admin - Device Takeover')
@Controller('admin/device-takeover')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class DeviceTakeoverAdminController {
  constructor(private readonly takeoverService: DeviceTakeoverService) {}

  @Get()
  @ApiOperation({ summary: 'Get all takeover requests' })
  @ApiQuery({ name: 'status', required: false, enum: TakeoverStatus })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllRequests(
    @Query('status') status?: TakeoverStatus,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number
  ) {
    const result = await this.takeoverService.getAllTakeoverRequests({
      status,
      page,
      limit,
    });

    return {
      requests: result.requests,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit!),
      },
    };
  }

  @Post(':id/assign-expert')
  @ApiOperation({ summary: 'Assign an expert to inspect a device' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['expertId'],
      properties: {
        expertId: { type: 'string' },
      },
    },
  })
  async assignExpert(@Param('id') id: string, @Body('expertId') expertId: string) {
    return this.takeoverService.assignInspectionExpert(id, expertId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a takeover request and generate passport' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        notes: { type: 'string' },
      },
    },
  })
  async approveRequest(
    @Param('id') id: string,
    @Request() req: any,
    @Body('notes') notes?: string
  ) {
    const request = await this.takeoverService.approveRequest(id, req.user.sub, notes);
    return {
      request,
      message: `Device passport generated: ${request.generatedPassportCode}`,
    };
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a takeover request' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['reason'],
      properties: {
        reason: { type: 'string' },
      },
    },
  })
  async rejectRequest(
    @Param('id') id: string,
    @Request() req: any,
    @Body('reason') reason: string
  ) {
    return this.takeoverService.rejectRequest(id, req.user.sub, reason);
  }
}
