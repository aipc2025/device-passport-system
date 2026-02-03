import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { IsArray, IsUUID, IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ExpertMatchingService } from './expert-matching.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { TokenPayload, UserRole, MatchSource, ExpertWorkStatus } from '@device-passport/shared';

// DTOs for request body
class PushToExpertsDto {
  @ApiProperty({ description: 'List of expert IDs to push the service request to' })
  @IsArray()
  @IsUUID('4', { each: true })
  expertIds: string[];

  @ApiProperty({
    description: 'Source of the push (defaults to PLATFORM_RECOMMENDED)',
    required: false,
  })
  @IsOptional()
  @IsEnum(MatchSource)
  source?: MatchSource;
}

class SearchExpertsDto {
  @ApiProperty({ description: 'Keyword to search in expert profiles', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: 'Filter by work status', required: false, enum: ExpertWorkStatus })
  @IsOptional()
  @IsEnum(ExpertWorkStatus)
  workStatus?: ExpertWorkStatus;

  @ApiProperty({ description: 'Minimum match score (0-100)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minScore?: number;

  @ApiProperty({ description: 'Maximum number of results', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

@ApiTags('Expert Matching')
@Controller('expert-matching')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExpertMatchingController {
  constructor(private readonly matchingService: ExpertMatchingService) {}

  @Get('expert/my')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER)
  @ApiOperation({ summary: 'Get my match recommendations (as expert)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyMatches(@CurrentUser() user: TokenPayload, @Query('limit') limit?: number) {
    if (!user.expertId) {
      return [];
    }
    const matches = await this.matchingService.getMatchesForExpert(user.expertId, limit || 50);

    // Enhance with match source labels
    return matches.map((match) => ({
      ...match,
      matchSourceLabel: this.getMatchSourceLabel(match.matchSource),
    }));
  }

  @Get('service-request/:id')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get expert matches for a service request' })
  @ApiParam({ name: 'id', description: 'Service request ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMatchesForRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: number
  ) {
    const matches = await this.matchingService.getMatchesForServiceRequest(id, limit || 50);

    return matches.map((match) => ({
      ...match,
      matchSourceLabel: this.getMatchSourceLabel(match.matchSource),
    }));
  }

  @Post('service-request/:id/run')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Trigger matching for a service request' })
  @ApiParam({ name: 'id', description: 'Service request ID' })
  async runMatching(@Param('id', ParseUUIDPipe) id: string) {
    const matches = await this.matchingService.matchExpertsToServiceRequest(id);
    return {
      message: `Found ${matches.length} matching experts`,
      matches: matches.map((m) => ({
        expertId: m.expertId,
        score: m.totalScore,
        matchSource: m.matchSource,
      })),
    };
  }

  @Post(':id/view')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER)
  @ApiOperation({ summary: 'Mark match as viewed' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  async markAsViewed(@CurrentUser() user: TokenPayload, @Param('id', ParseUUIDPipe) id: string) {
    const viewerType = user.expertId ? 'expert' : 'customer';
    await this.matchingService.markAsViewed(id, viewerType);
    return { message: 'Match marked as viewed' };
  }

  @Post(':id/dismiss')
  @Roles(UserRole.CUSTOMER, UserRole.ENGINEER)
  @ApiOperation({ summary: 'Dismiss a match' })
  @ApiParam({ name: 'id', description: 'Match ID' })
  async dismissMatch(@Param('id', ParseUUIDPipe) id: string) {
    await this.matchingService.dismissMatch(id);
    return { message: 'Match dismissed' };
  }

  @Post('manual/:serviceRequestId/:expertId')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a manual match (admin/platform recommended)' })
  @ApiParam({ name: 'serviceRequestId', description: 'Service request ID' })
  @ApiParam({ name: 'expertId', description: 'Expert ID' })
  async createManualMatch(
    @Param('serviceRequestId', ParseUUIDPipe) serviceRequestId: string,
    @Param('expertId', ParseUUIDPipe) expertId: string
  ) {
    const match = await this.matchingService.createManualMatch(
      expertId,
      serviceRequestId,
      MatchSource.PLATFORM_RECOMMENDED
    );
    return {
      message: 'Manual match created',
      match: {
        id: match.id,
        score: match.totalScore,
        matchSource: match.matchSource,
      },
    };
  }

  @Post('push/:serviceRequestId')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Push a service request to multiple experts' })
  @ApiParam({ name: 'serviceRequestId', description: 'Service request ID' })
  @ApiBody({ type: PushToExpertsDto })
  async pushToExperts(
    @Param('serviceRequestId', ParseUUIDPipe) serviceRequestId: string,
    @Body() dto: PushToExpertsDto
  ) {
    const result = await this.matchingService.pushToExperts(
      serviceRequestId,
      dto.expertIds,
      dto.source || MatchSource.PLATFORM_RECOMMENDED
    );
    return {
      message: `Pushed to ${result.success} experts (${result.failed} failed)`,
      success: result.success,
      failed: result.failed,
      matches: result.matches.map((m) => ({
        id: m.id,
        expertId: m.expertId,
        score: m.totalScore,
        matchSource: m.matchSource,
      })),
    };
  }

  @Get('rushing-experts')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get all experts in RUSHING status' })
  async getRushingExperts() {
    const experts = await this.matchingService.getRushingExperts();
    return experts.map((expert) => ({
      id: expert.id,
      expertCode: expert.expertCode,
      personalName: expert.personalName,
      professionalField: expert.professionalField,
      skillTags: expert.skillTags,
      avgRating: expert.avgRating,
      totalReviews: expert.totalReviews,
      workStatus: expert.workStatus,
      membershipLevel: expert.membershipLevel,
      rushingStartedAt: expert.rushingStartedAt,
      currentLocation: expert.currentLocation,
      locationLat: expert.locationLat,
      locationLng: expert.locationLng,
    }));
  }

  @Get('search/:serviceRequestId')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Search experts for a service request with keyword and filters' })
  @ApiParam({ name: 'serviceRequestId', description: 'Service request ID' })
  @ApiQuery({ name: 'keyword', required: false, description: 'Search keyword' })
  @ApiQuery({ name: 'workStatus', required: false, enum: ExpertWorkStatus })
  @ApiQuery({ name: 'minScore', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchExpertsForRequest(
    @Param('serviceRequestId', ParseUUIDPipe) serviceRequestId: string,
    @Query('keyword') keyword?: string,
    @Query('workStatus') workStatus?: ExpertWorkStatus,
    @Query('minScore') minScore?: number,
    @Query('limit') limit?: number
  ) {
    const results = await this.matchingService.searchExpertsForRequest(serviceRequestId, {
      keyword,
      workStatus,
      minScore: minScore ? Number(minScore) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return results.map((r) => ({
      expert: {
        id: r.expert.id,
        expertCode: r.expert.expertCode,
        personalName: r.expert.personalName,
        professionalField: r.expert.professionalField,
        skillTags: r.expert.skillTags,
        avgRating: r.expert.avgRating,
        totalReviews: r.expert.totalReviews,
        workStatus: r.expert.workStatus,
        membershipLevel: r.expert.membershipLevel,
        currentLocation: r.expert.currentLocation,
        locationLat: r.expert.locationLat,
        locationLng: r.expert.locationLng,
      },
      score: r.score,
      scoreBreakdown: r.breakdown,
      distanceKm: r.distanceKm,
      hasExistingMatch: r.hasExistingMatch,
    }));
  }

  @Post('auto-match-rushing')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Trigger auto-matching for RUSHING experts' })
  @ApiQuery({
    name: 'serviceRequestId',
    required: false,
    description: 'Specific service request ID (optional)',
  })
  async triggerAutoMatchRushing(@Query('serviceRequestId') serviceRequestId?: string) {
    const result = await this.matchingService.autoMatchRushingExperts(serviceRequestId);
    return {
      message: 'Auto-matching completed',
      ...result,
    };
  }

  @Get('pending-notifications')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get matches pending notification' })
  @ApiQuery({ name: 'expertId', required: false, description: 'Filter by expert ID' })
  async getPendingNotifications(@Query('expertId') expertId?: string) {
    const matches = await this.matchingService.getPendingNotifications(expertId);
    return matches.map((m) => ({
      id: m.id,
      expertId: m.expertId,
      expertName: m.expert?.personalName,
      serviceRequestId: m.serviceRequestId,
      serviceRequestTitle: m.serviceRequest?.title,
      totalScore: m.totalScore,
      matchSource: m.matchSource,
      createdAt: m.createdAt,
    }));
  }

  @Post('mark-notified')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Mark matches as notified' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { matchIds: { type: 'array', items: { type: 'string' } } },
    },
  })
  async markAsNotified(@Body('matchIds') matchIds: string[]) {
    await this.matchingService.markAsNotified(matchIds);
    return { message: `Marked ${matchIds.length} matches as notified` };
  }

  private getMatchSourceLabel(source: MatchSource): string {
    switch (source) {
      case MatchSource.AI_MATCHED:
        return 'AI Matched';
      case MatchSource.PLATFORM_RECOMMENDED:
        return 'Platform Recommended';
      case MatchSource.BUYER_SPECIFIED:
        return 'Buyer Specified';
      default:
        return 'Unknown';
    }
  }
}
