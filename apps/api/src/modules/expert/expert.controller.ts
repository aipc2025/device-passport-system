import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ExpertService } from './expert.service';
import { ExpertCodeService } from './expert-code.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import {
  TokenPayload,
  UserRole,
  validateExpertPassportCode,
  INDUSTRY_CODE_NAMES,
  SKILL_CODE_NAMES,
} from '@device-passport/shared';

@ApiTags('Experts')
@Controller('experts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExpertController {
  constructor(
    private readonly expertService: ExpertService,
    private readonly expertCodeService: ExpertCodeService,
  ) {}

  @Get(':id/dashboard')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get expert dashboard statistics' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  async getDashboardStats(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.expertService.getDashboardStats(id, user.sub);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get expert profile' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  async getProfile(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.expertService.getProfile(id, user.sub);
  }

  @Patch(':id')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update expert profile' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  async updateProfile(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.expertService.updateProfile(id, user.sub, data);
  }

  @Get(':id/service-records')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get expert service records' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  async getServiceRecords(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.expertService.getServiceRecords(id, user.sub);
  }

  @Get(':id/matches')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get expert match recommendations' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMatches(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: number,
  ) {
    return this.expertService.getMatches(id, user.sub, limit || 50);
  }

  @Post('matches/:matchId/dismiss')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Dismiss an expert match' })
  @ApiParam({ name: 'matchId', description: 'Match ID' })
  async dismissMatch(
    @CurrentUser() user: TokenPayload,
    @Param('matchId', ParseUUIDPipe) matchId: string,
  ) {
    return this.expertService.dismissMatch(matchId, user.sub);
  }

  // ==========================================
  // Expert Passport Endpoints
  // ==========================================

  @Get(':id/passport')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get expert passport information' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  async getPassport(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const expert = await this.expertService.getProfile(id, user.sub);
    const parsed = expert.expertCode
      ? this.expertCodeService.parseCode(expert.expertCode)
      : null;

    return {
      expertCode: expert.expertCode,
      expertCodeGeneratedAt: expert.expertCodeGeneratedAt,
      parsed,
      typeName: parsed ? this.expertCodeService.getTypeDisplayName(parsed.type) : null,
      personalName: expert.personalName,
      professionalField: expert.professionalField,
      yearsOfExperience: expert.yearsOfExperience,
      avgRating: expert.avgRating,
      totalReviews: expert.totalReviews,
      completedServices: expert.completedServices,
      isAvailable: expert.isAvailable,
      registrationStatus: expert.registrationStatus,
    };
  }

  @Post(':id/generate-code')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate expert passport code (Admin only)' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  async generateCode(@Param('id', ParseUUIDPipe) id: string) {
    const code = await this.expertCodeService.generateCodeForExpert(id);
    if (!code) {
      throw new NotFoundException('Expert not found');
    }
    return { expertCode: code };
  }

  // ==========================================
  // Location & Availability Endpoints
  // ==========================================

  @Patch(':id/location')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update expert location' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        latitude: { type: 'number', description: 'Latitude' },
        longitude: { type: 'number', description: 'Longitude' },
        currentLocation: { type: 'string', description: 'Location address' },
      },
    },
  })
  async updateLocation(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: { latitude?: number; longitude?: number; currentLocation?: string },
  ) {
    return this.expertService.updateLocation(id, user.sub, data);
  }

  @Patch(':id/availability')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update expert availability status' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isAvailable: { type: 'boolean', description: 'Availability status' },
        serviceRadius: { type: 'number', description: 'Service radius in km' },
      },
    },
  })
  async updateAvailability(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: { isAvailable?: boolean; serviceRadius?: number },
  ) {
    return this.expertService.updateAvailability(id, user.sub, data);
  }

  @Patch(':id/skills')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update expert skill tags' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        skillTags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Skill tags array',
        },
      },
    },
  })
  async updateSkills(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: { skillTags: string[] },
  ) {
    return this.expertService.updateSkills(id, user.sub, data.skillTags);
  }

  // ==========================================
  // Work History Endpoints
  // ==========================================

  @Get(':id/work-histories')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get expert work histories' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  async getWorkHistories(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.expertService.getWorkHistories(id, user.sub);
  }

  @Post(':id/work-histories')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add work history entry' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  async addWorkHistory(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: {
      companyName: string;
      companyContactEmail?: string;
      companyContactPhone?: string;
      companyAddress?: string;
      position: string;
      description?: string;
      startDate: string;
      endDate?: string;
      isCurrent?: boolean;
      isPublic?: boolean;
    },
  ) {
    return this.expertService.addWorkHistory(id, user.sub, {
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
  }

  @Patch('work-histories/:workHistoryId')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update work history entry' })
  @ApiParam({ name: 'workHistoryId', description: 'Work History ID' })
  async updateWorkHistory(
    @CurrentUser() user: TokenPayload,
    @Param('workHistoryId', ParseUUIDPipe) workHistoryId: string,
    @Body() data: Record<string, unknown>,
  ) {
    // Handle date conversion
    if (data.startDate) {
      data.startDate = new Date(data.startDate as string);
    }
    if (data.endDate) {
      data.endDate = new Date(data.endDate as string);
    }
    return this.expertService.updateWorkHistory(workHistoryId, user.sub, data);
  }

  @Delete('work-histories/:workHistoryId')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete work history entry' })
  @ApiParam({ name: 'workHistoryId', description: 'Work History ID' })
  async deleteWorkHistory(
    @CurrentUser() user: TokenPayload,
    @Param('workHistoryId', ParseUUIDPipe) workHistoryId: string,
  ) {
    await this.expertService.deleteWorkHistory(workHistoryId, user.sub);
    return { success: true };
  }

  @Post('work-histories/:workHistoryId/request-verification')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Request verification for work history' })
  @ApiParam({ name: 'workHistoryId', description: 'Work History ID' })
  async requestVerification(
    @CurrentUser() user: TokenPayload,
    @Param('workHistoryId', ParseUUIDPipe) workHistoryId: string,
  ) {
    return this.expertService.requestVerification(workHistoryId, user.sub);
  }

  // ==========================================
  // Admin Verification Endpoints
  // ==========================================

  @Get('admin/pending-verifications')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get pending work history verifications (Admin only)' })
  async getPendingVerifications() {
    return this.expertService.getPendingVerifications();
  }

  @Post('admin/work-histories/:workHistoryId/verify')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Process work history verification (Admin only)' })
  @ApiParam({ name: 'workHistoryId', description: 'Work History ID' })
  async processVerification(
    @CurrentUser() user: TokenPayload,
    @Param('workHistoryId', ParseUUIDPipe) workHistoryId: string,
    @Body() data: {
      approved: boolean;
      notes?: string;
      rejectionReason?: string;
      proofDocumentId?: string;
    },
  ) {
    return this.expertService.processVerification(
      workHistoryId,
      user.sub,
      data.approved,
      data.notes,
      data.rejectionReason,
      data.proofDocumentId,
    );
  }

  // ==========================================
  // New Passport Code Generation (with new format)
  // ==========================================

  @Post(':id/generate-passport')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate expert passport code with new format (Admin only)' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  async generateNewPassportCode(@Param('id', ParseUUIDPipe) id: string) {
    const code = await this.expertService.generatePassportCode(id);
    return { expertCode: code };
  }
}

// ==========================================
// Public Expert Passport Controller (no auth required)
// ==========================================

@ApiTags('Expert Passport (Public)')
@Controller('expert-passport')
export class ExpertPassportPublicController {
  constructor(private readonly expertService: ExpertService) {}

  @Get('scan/:code')
  @ApiOperation({ summary: 'Scan expert passport code (public)' })
  @ApiParam({ name: 'code', description: 'Expert passport code' })
  async scanExpertPassport(@Param('code') code: string) {
    // Validate the code format
    const validation = validateExpertPassportCode(code);
    if (!validation.valid) {
      throw new NotFoundException(`Invalid expert passport code: ${validation.error}`);
    }

    // Get public profile
    const profile = await this.expertService.getPublicProfile(code);
    if (!profile) {
      throw new NotFoundException('Expert not found');
    }

    // Add code parsing info
    const parts = validation.parts!;
    return {
      ...profile,
      passportInfo: {
        code: code.toUpperCase(),
        expertType: parts.expertType,
        expertTypeName: parts.expertType === 'T' ? 'Technical' : parts.expertType === 'B' ? 'Business' : 'Technical & Business',
        industry: parts.industry,
        industryName: INDUSTRY_CODE_NAMES[parts.industry],
        skill: parts.skill,
        skillName: SKILL_CODE_NAMES[parts.skill],
        nationality: parts.nationality,
        isValid: true,
      },
    };
  }

  @Get('validate/:code')
  @ApiOperation({ summary: 'Validate expert passport code format (public)' })
  @ApiParam({ name: 'code', description: 'Expert passport code' })
  async validateCode(@Param('code') code: string) {
    const validation = validateExpertPassportCode(code);
    if (!validation.valid) {
      return {
        valid: false,
        error: validation.error,
      };
    }

    const parts = validation.parts!;
    return {
      valid: true,
      parts: {
        ...parts,
        industryName: INDUSTRY_CODE_NAMES[parts.industry],
        skillName: SKILL_CODE_NAMES[parts.skill],
      },
    };
  }
}
