import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RegistrationService } from './registration.service';
import {
  CompanyRegistrationDto,
  ExpertRegistrationDto,
  UpdateRegistrationStatusDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Public, CurrentUser, Roles } from '../../common/decorators';
import { TokenPayload, UserRole, RegistrationType } from '@device-passport/shared';

@ApiTags('Registration')
@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post('company')
  @Public()
  @ApiOperation({ summary: 'Register as a company (Supplier/Buyer)' })
  async registerCompany(@Body() dto: CompanyRegistrationDto) {
    return this.registrationService.registerCompany(dto);
  }

  @Post('expert')
  @Public()
  @ApiOperation({ summary: 'Register as an individual expert' })
  async registerExpert(@Body() dto: ExpertRegistrationDto) {
    return this.registrationService.registerExpert(dto);
  }

  @Get('check-code/:code')
  @Public()
  @ApiOperation({ summary: 'Check if organization code is available' })
  @ApiParam({ name: 'code', description: '3-letter organization code' })
  async checkCodeAvailability(@Param('code') code: string) {
    return this.registrationService.checkCodeAvailability(code);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user registration status' })
  async getRegistrationStatus(@CurrentUser() user: TokenPayload) {
    return this.registrationService.getRegistrationStatus(user.sub);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pending registrations (Admin only)' })
  async getPendingRegistrations() {
    return this.registrationService.getPendingRegistrations();
  }

  @Get('company/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get company registration details (Admin only)' })
  @ApiParam({ name: 'id', description: 'Company profile ID' })
  async getCompanyDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.registrationService.getCompanyDetails(id);
  }

  @Get('expert/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get expert registration details (Admin only)' })
  @ApiParam({ name: 'id', description: 'Expert ID' })
  async getExpertDetails(@Param('id', ParseUUIDPipe) id: string) {
    return this.registrationService.getExpertDetails(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update registration status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Registration ID (company profile or expert)' })
  @ApiQuery({ name: 'type', enum: RegistrationType, description: 'Registration type' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('type') type: RegistrationType,
    @Body() dto: UpdateRegistrationStatusDto,
    @CurrentUser() user: TokenPayload,
  ) {
    if (type === RegistrationType.COMPANY) {
      await this.registrationService.updateCompanyStatus(id, dto, user.sub);
    } else {
      await this.registrationService.updateExpertStatus(id, dto, user.sub);
    }
    return { success: true };
  }
}
