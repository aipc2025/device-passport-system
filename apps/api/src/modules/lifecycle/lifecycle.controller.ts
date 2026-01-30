import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LifecycleService } from './lifecycle.service';
import { LifecycleQueryDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { UserRole } from '@device-passport/shared';

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
    @Query() query: LifecycleQueryDto,
  ) {
    return this.lifecycleService.findByPassportId(passportId, query);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get lifecycle event by ID' })
  async findById(@Param('id') id: string) {
    return this.lifecycleService.findById(id);
  }
}
