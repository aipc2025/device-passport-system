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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PassportService } from './passport.service';
import { CreatePassportDto, UpdatePassportDto, UpdateStatusDto, PassportQueryDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { UserRole, TokenPayload } from '@device-passport/shared';

@ApiTags('passports')
@Controller('passports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PassportController {
  constructor(private readonly passportService: PassportService) {}

  @Get()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get all device passports' })
  async findAll(@Query() query: PassportQueryDto) {
    return this.passportService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get device passport by ID' })
  async findById(@Param('id') id: string) {
    return this.passportService.findById(id);
  }

  @Post()
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create new device passport' })
  async create(
    @Body() createPassportDto: CreatePassportDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.passportService.create(createPassportDto, user.sub);
  }

  @Patch(':id')
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update device passport' })
  async update(
    @Param('id') id: string,
    @Body() updatePassportDto: UpdatePassportDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.passportService.update(id, updatePassportDto, user.sub);
  }

  @Patch(':id/status')
  @Roles(UserRole.QC_INSPECTOR)
  @ApiOperation({ summary: 'Update device status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.passportService.updateStatus(id, updateStatusDto, user.sub);
  }

  @Get(':id/qrcode')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get QR code for device passport' })
  async getQRCode(@Param('id') id: string) {
    const qrCode = await this.passportService.generateQRCode(id);
    return { qrCode };
  }

  @Get(':id/lifecycle')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get device lifecycle events' })
  async getLifecycle(@Param('id') id: string) {
    // This will be implemented through the lifecycle service
    const passport = await this.passportService.findById(id);
    return { passportId: passport.id };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete device passport (Admin only)' })
  async delete(@Param('id') id: string) {
    return this.passportService.delete(id);
  }

  @Patch(':id/location')
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update device GPS location (for GPS tracking integration)' })
  async updateLocation(
    @Param('id') id: string,
    @Body() locationDto: { lat: number; lng: number; address?: string },
    @CurrentUser() user: TokenPayload,
  ) {
    return this.passportService.updateLocation(id, locationDto, user.sub);
  }
}
