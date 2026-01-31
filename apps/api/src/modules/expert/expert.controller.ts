import {
  Controller,
  Get,
  Patch,
  Post,
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
import { TokenPayload, UserRole } from '@device-passport/shared';

@ApiTags('Experts')
@Controller('experts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExpertController {
  constructor(
    private readonly expertService: ExpertService,
    private readonly expertCodeService: ExpertCodeService,
  ) {}

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
}
