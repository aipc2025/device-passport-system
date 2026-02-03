import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { MatchingService } from './matching.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { TokenPayload, UserRole, MatchSource } from '@device-passport/shared';

@ApiTags('Matching')
@Controller('matching')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('recommendations')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get match recommendations for current user' })
  @ApiQuery({ name: 'role', enum: ['supplier', 'buyer'], required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'includeViewed', required: false, type: Boolean })
  async getRecommendations(
    @CurrentUser() user: TokenPayload,
    @Query('role') role: 'supplier' | 'buyer',
    @Query('limit') limit?: number,
    @Query('includeViewed') includeViewed?: boolean
  ) {
    return this.matchingService.getRecommendations(
      user.organizationId!,
      role,
      limit || 20,
      includeViewed || false
    );
  }

  @Get('recommendations/:id')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get match details' })
  @ApiParam({ name: 'id', description: 'Match result ID' })
  @ApiQuery({ name: 'role', enum: ['supplier', 'buyer'], required: true })
  async getMatch(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('role') role: 'supplier' | 'buyer'
  ) {
    const match = await this.matchingService.getMatchById(id);
    // Mark as viewed when accessed
    await this.matchingService.markAsViewed(id, user.organizationId!, role);
    return match;
  }

  @Post('recommendations/:id/dismiss')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Dismiss a match recommendation' })
  @ApiParam({ name: 'id', description: 'Match result ID' })
  async dismissMatch(@CurrentUser() user: TokenPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.matchingService.dismissMatch(id, user.organizationId!);
  }

  @Post('trigger')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Manually trigger full matching (Admin only)' })
  async triggerMatching() {
    return this.matchingService.runFullMatching();
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get matching statistics (Admin only)' })
  async getStats() {
    return this.matchingService.getStatistics();
  }

  @Post('forward-requirement/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Forward a buyer requirement to specific suppliers (Admin only)' })
  @ApiParam({ name: 'id', description: 'Buyer requirement ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        supplierOrgIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of supplier organization IDs',
        },
        matchSource: {
          type: 'string',
          enum: Object.values(MatchSource),
          description: 'Source of the match (PLATFORM_RECOMMENDED, BUYER_SPECIFIED)',
        },
      },
      required: ['supplierOrgIds'],
    },
  })
  async forwardRequirement(
    @Param('id', ParseUUIDPipe) requirementId: string,
    @Body('supplierOrgIds') supplierOrgIds: string[],
    @Body('matchSource') matchSource?: MatchSource
  ) {
    return this.matchingService.forwardRequirementToSuppliers(
      requirementId,
      supplierOrgIds,
      matchSource || MatchSource.PLATFORM_RECOMMENDED
    );
  }
}
