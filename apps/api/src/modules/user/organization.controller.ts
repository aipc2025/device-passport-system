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
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { UserRole, OrganizationType } from '@device-passport/shared';

@ApiTags('organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get all organizations' })
  @ApiQuery({ name: 'type', enum: OrganizationType, required: false })
  async findAll(@Query('type') type?: OrganizationType) {
    return this.organizationService.findAll(type);
  }

  @Get('suppliers')
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get all suppliers (manufacturers)' })
  async findAllSuppliers() {
    return this.organizationService.findAll(OrganizationType.SUPPLIER);
  }

  @Get(':id')
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get organization by ID' })
  async findById(@Param('id') id: string) {
    return this.organizationService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new organization (Admin only)' })
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update organization (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete organization (Admin only)' })
  async delete(@Param('id') id: string) {
    return this.organizationService.delete(id);
  }
}
