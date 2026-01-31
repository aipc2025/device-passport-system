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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductTypeService } from './product-type.service';
import { CreateProductTypeDto, UpdateProductTypeDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@device-passport/shared';

@ApiTags('Product Types')
@Controller('product-types')
export class ProductTypeController {
  constructor(private readonly productTypeService: ProductTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all product types' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.productTypeService.findAll(includeInactive === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product type by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productTypeService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product type (Admin only)' })
  async create(@Body() dto: CreateProductTypeDto) {
    return this.productTypeService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product type (Admin only)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductTypeDto,
  ) {
    return this.productTypeService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product type (Admin only, non-system only)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productTypeService.remove(id);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle product type active status (Admin only)' })
  async toggleActive(@Param('id', ParseUUIDPipe) id: string) {
    return this.productTypeService.toggleActive(id);
  }
}
