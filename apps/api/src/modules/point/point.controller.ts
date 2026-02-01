import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PointService } from './point.service';
import { PointRule } from '../../database/entities';
import { UserRole, PointType } from '@device-passport/shared';

// ============================================
// User Point Controller
// ============================================

@ApiTags('Points')
@Controller('points')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @Get('my-account')
  @ApiOperation({ summary: 'Get current user point account' })
  async getMyAccount(@Request() req: any) {
    return this.pointService.getAccountByUserId(req.user.sub);
  }

  @Get('my-transactions')
  @ApiOperation({ summary: 'Get current user transaction history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'pointType', required: false, enum: PointType })
  async getMyTransactions(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('pointType') pointType?: PointType,
  ) {
    const result = await this.pointService.getTransactionHistory(req.user.sub, {
      page,
      limit,
      pointType,
    });

    return {
      transactions: result.transactions,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  @Get('rules')
  @ApiOperation({ summary: 'Get all active point rules' })
  async getActiveRules() {
    return this.pointService.getActiveRules();
  }
}

// ============================================
// Admin Point Rule Controller
// ============================================

@ApiTags('Admin - Point Rules')
@Controller('admin/point-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class PointRuleAdminController {
  constructor(private readonly pointService: PointService) {}

  @Get()
  @ApiOperation({ summary: 'Get all point rules' })
  async getAllRules() {
    return this.pointService.getAllRules();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get point statistics' })
  async getStatistics() {
    return this.pointService.getPointStatistics();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new point rule' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['actionCode', 'actionName', 'category', 'pointType', 'defaultPoints'],
      properties: {
        actionCode: { type: 'string' },
        actionName: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string' },
        pointType: { type: 'string', enum: Object.values(PointType) },
        defaultPoints: { type: 'number' },
        minPoints: { type: 'number' },
        maxPoints: { type: 'number' },
        dailyLimit: { type: 'number' },
        weeklyLimit: { type: 'number' },
        monthlyLimit: { type: 'number' },
        totalLimit: { type: 'number' },
        isActive: { type: 'boolean' },
        sortOrder: { type: 'number' },
      },
    },
  })
  async createRule(@Body() body: Partial<PointRule>, @Request() req: any) {
    return this.pointService.createRule({
      ...body,
      modifiedBy: req.user.sub,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a point rule' })
  async updateRule(
    @Param('id') id: string,
    @Body() body: Partial<PointRule>,
    @Request() req: any,
  ) {
    return this.pointService.updateRule(id, {
      ...body,
      modifiedBy: req.user.sub,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a point rule' })
  async deleteRule(@Param('id') id: string) {
    await this.pointService.deleteRule(id);
    return { message: 'Point rule deleted successfully' };
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default point rules' })
  async seedDefaultRules() {
    await this.pointService.seedDefaultRules();
    return { message: 'Default point rules seeded successfully' };
  }
}
