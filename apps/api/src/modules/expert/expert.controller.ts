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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ExpertService } from './expert.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { TokenPayload, UserRole } from '@device-passport/shared';

@ApiTags('Experts')
@Controller('experts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExpertController {
  constructor(private readonly expertService: ExpertService) {}

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
}
