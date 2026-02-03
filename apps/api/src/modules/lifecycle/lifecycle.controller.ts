import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LifecycleService } from './lifecycle.service';
import { LifecycleQueryDto, CreateLifecycleEventDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole, TokenPayload } from '@device-passport/shared';

@ApiTags('lifecycle')
@Controller('lifecycle')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LifecycleController {
  constructor(private readonly lifecycleService: LifecycleService) {}

  @Get('passport/:passportId')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get lifecycle events for a device passport' })
  async findByPassportId(
    @Param('passportId') passportId: string,
    @Query() query: LifecycleQueryDto
  ) {
    return this.lifecycleService.findByPassportId(passportId, query);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get lifecycle event by ID' })
  async findById(@Param('id') id: string) {
    return this.lifecycleService.findById(id);
  }

  @Post()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.QC_INSPECTOR, UserRole.ENGINEER)
  @ApiOperation({ summary: 'Create a new lifecycle event' })
  async create(
    @CurrentUser() user: TokenPayload,
    @Body() createDto: CreateLifecycleEventDto
  ) {
    return this.lifecycleService.create(
      createDto,
      user.sub,
      user.email, // Using email as performedByName, could be user's actual name
      user.role
    );
  }
}
