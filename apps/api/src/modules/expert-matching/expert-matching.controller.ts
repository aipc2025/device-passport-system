import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ExpertMatchingService } from './expert-matching.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { TokenPayload, UserRole, MatchSource } from '@device-passport/shared';

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
  async getMyMatches(
    @CurrentUser() user: TokenPayload,
    @Query('limit') limit?: number,
  ) {
    if (!user.expertId) {
      return [];
    }
    const matches = await this.matchingService.getMatchesForExpert(
      user.expertId,
      limit || 50,
    );

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
    @Query('limit') limit?: number,
  ) {
    const matches = await this.matchingService.getMatchesForServiceRequest(
      id,
      limit || 50,
    );

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
  async markAsViewed(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
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
    @Param('expertId', ParseUUIDPipe) expertId: string,
  ) {
    const match = await this.matchingService.createManualMatch(
      expertId,
      serviceRequestId,
      MatchSource.PLATFORM_RECOMMENDED,
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
