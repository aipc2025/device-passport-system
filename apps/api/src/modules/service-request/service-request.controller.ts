import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ServiceRequestService } from './service-request.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles, Public } from '../../common/decorators';
import { TokenPayload, UserRole, ServiceType, ServiceUrgency } from '@device-passport/shared';

@ApiTags('Service Requests')
@Controller('service-requests')
export class ServiceRequestController {
  constructor(private readonly serviceRequestService: ServiceRequestService) {}

  // ==========================================
  // Public Endpoints
  // ==========================================

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public service requests (Service Hall)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'serviceType', required: false })
  @ApiQuery({ name: 'urgency', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getPublicRequests(
    @Query('search') search?: string,
    @Query('serviceType') serviceType?: string,
    @Query('urgency') urgency?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.serviceRequestService.findPublic({
      search,
      serviceType,
      urgency,
      limit,
      offset,
    });
  }

  @Get('types')
  @Public()
  @ApiOperation({ summary: 'Get available service types' })
  getServiceTypes() {
    return this.serviceRequestService.getServiceTypes();
  }

  @Post('public')
  @Public()
  @ApiOperation({ summary: 'Create a public service request (no authentication required)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'title',
        'description',
        'serviceType',
        'contactName',
        'contactPhone',
        'contactEmail',
      ],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        serviceType: { type: 'string', enum: Object.values(ServiceType) },
        category: { type: 'string', description: 'ServiceRequestCategory' },
        urgency: { type: 'string', enum: Object.values(ServiceUrgency) },
        passportCode: { type: 'string', description: 'Device passport code (optional)' },
        laborDetails: {
          type: 'object',
          properties: {
            estimatedDays: { type: 'number' },
            workSchedule: { type: 'string' },
            requiredCertifications: { type: 'array', items: { type: 'string' } },
            experienceYears: { type: 'number' },
            requiredWorkers: { type: 'number' },
            workScope: { type: 'string' },
            safetyRequirements: { type: 'string' },
            materialsProvided: { type: 'boolean' },
            materialsDescription: { type: 'string' },
          },
        },
        serviceLocation: { type: 'string' },
        locationLat: { type: 'number' },
        locationLng: { type: 'number' },
        contactName: { type: 'string' },
        contactPhone: { type: 'string' },
        contactEmail: { type: 'string' },
        budgetMin: { type: 'number' },
        budgetMax: { type: 'number' },
        budgetCurrency: { type: 'string', default: 'USD' },
        preferredDate: { type: 'string', format: 'date-time' },
        requiredSkills: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async createPublic(@Body() data: Record<string, unknown>) {
    return this.serviceRequestService.createPublic(data as any);
  }

  @Get('public/:id')
  @Public()
  @ApiOperation({ summary: 'Get public service request detail' })
  @ApiParam({ name: 'id', description: 'Service request ID' })
  async getPublicRequestDetail(@Param('id', ParseUUIDPipe) id: string) {
    const request = await this.serviceRequestService.findOne(id);
    // Increment view count
    await this.serviceRequestService.incrementViewCount(id);

    // Return only public fields
    return {
      id: request.id,
      requestCode: request.requestCode,
      title: request.title,
      description: request.description,
      serviceType: request.serviceType,
      urgency: request.urgency,
      serviceLocation: request.serviceLocation,
      locationLat: request.locationLat,
      locationLng: request.locationLng,
      contactName: request.contactName,
      budgetMin: request.budgetMin,
      budgetMax: request.budgetMax,
      budgetCurrency: request.budgetCurrency,
      preferredDate: request.preferredDate,
      deadline: request.deadline,
      requiredSkills: request.requiredSkills,
      status: request.status,
      viewCount: request.viewCount,
      applicationCount: request.applicationCount,
      organization: request.showCompanyInfo ? request.organization : null,
      createdAt: request.createdAt,
    };
  }

  // ==========================================
  // Authenticated Endpoints
  // ==========================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new service request' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'description', 'serviceType', 'contactName', 'contactPhone'],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        serviceType: { type: 'string', enum: Object.values(ServiceType) },
        urgency: { type: 'string', enum: Object.values(ServiceUrgency) },
        serviceLocation: { type: 'string' },
        locationLat: { type: 'number' },
        locationLng: { type: 'number' },
        contactName: { type: 'string' },
        contactPhone: { type: 'string' },
        contactEmail: { type: 'string' },
        budgetMin: { type: 'number' },
        budgetMax: { type: 'number' },
        budgetCurrency: { type: 'string', default: 'USD' },
        preferredDate: { type: 'string', format: 'date-time' },
        deadline: { type: 'string', format: 'date-time' },
        requiredSkills: { type: 'array', items: { type: 'string' } },
        isPublic: { type: 'boolean', default: true },
        showCompanyInfo: { type: 'boolean', default: true },
      },
    },
  })
  async create(@CurrentUser() user: TokenPayload, @Body() data: Record<string, unknown>) {
    return this.serviceRequestService.create(user.sub, user.organizationId || null, data as any);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my service requests (as customer)' })
  async getMyRequests(@CurrentUser() user: TokenPayload) {
    return this.serviceRequestService.findMyRequests(user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get service request detail' })
  @ApiParam({ name: 'id', description: 'Service request ID' })
  async getRequestDetail(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const request = await this.serviceRequestService.findOne(id);
    await this.serviceRequestService.incrementViewCount(id);
    return request;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update service request' })
  @ApiParam({ name: 'id', description: 'Service request ID' })
  async update(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Record<string, unknown>
  ) {
    return this.serviceRequestService.update(id, user.sub, data as any);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish service request (make it public)' })
  @ApiParam({ name: 'id', description: 'Service request ID' })
  async publish(@CurrentUser() user: TokenPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.serviceRequestService.publish(id, user.sub);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel service request' })
  @ApiParam({ name: 'id', description: 'Service request ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
      },
    },
  })
  async cancel(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string
  ) {
    return this.serviceRequestService.cancel(id, user.sub, reason);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark service request as completed' })
  @ApiParam({ name: 'id', description: 'Service request ID' })
  async complete(@CurrentUser() user: TokenPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.serviceRequestService.completeRequest(id, user.sub);
  }

  // ==========================================
  // Expert Application Endpoints
  // ==========================================

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to a service request (as expert)' })
  @ApiParam({ name: 'id', description: 'Service request ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        proposedPrice: { type: 'number' },
        priceCurrency: { type: 'string', default: 'USD' },
        estimatedDuration: { type: 'number' },
        durationUnit: { type: 'string', enum: ['hours', 'days', 'weeks'] },
        availableFrom: { type: 'string', format: 'date-time' },
      },
    },
  })
  async apply(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Record<string, unknown>
  ) {
    if (!user.expertId) {
      throw new Error('Only experts can apply to service requests');
    }
    return this.serviceRequestService.applyToService(id, user.expertId, data as any);
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get applications for a service request (as owner)' })
  @ApiParam({ name: 'id', description: 'Service request ID' })
  async getApplications(@CurrentUser() user: TokenPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.serviceRequestService.getApplicationsForRequest(id, user.sub);
  }

  @Get('applications/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my applications (as expert)' })
  async getMyApplications(@CurrentUser() user: TokenPayload) {
    if (!user.expertId) {
      return [];
    }
    return this.serviceRequestService.getMyApplications(user.expertId);
  }

  @Post('applications/:applicationId/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept an application' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  async acceptApplication(
    @CurrentUser() user: TokenPayload,
    @Param('applicationId', ParseUUIDPipe) applicationId: string
  ) {
    return this.serviceRequestService.acceptApplication(applicationId, user.sub);
  }

  @Post('applications/:applicationId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject an application' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
      },
    },
  })
  async rejectApplication(
    @CurrentUser() user: TokenPayload,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body('reason') reason?: string
  ) {
    return this.serviceRequestService.rejectApplication(applicationId, user.sub, reason);
  }

  @Delete('applications/:applicationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Withdraw an application (as expert)' })
  @ApiParam({ name: 'applicationId', description: 'Application ID' })
  async withdrawApplication(
    @CurrentUser() user: TokenPayload,
    @Param('applicationId', ParseUUIDPipe) applicationId: string
  ) {
    if (!user.expertId) {
      throw new Error('Only experts can withdraw applications');
    }
    await this.serviceRequestService.withdrawApplication(applicationId, user.expertId);
    return { message: 'Application withdrawn' };
  }
}
