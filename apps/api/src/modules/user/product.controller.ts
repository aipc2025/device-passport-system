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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { UserRole } from '@device-passport/shared';

@ApiTags('Supplier Products')
@Controller('organizations/:orgId/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get all products for an organization' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  async findAll(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Query('includeInactive') includeInactive?: boolean,
  ) {
    return this.productService.findAll(orgId, includeInactive);
  }

  @Get(':id')
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async findById(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productService.findById(orgId, id);
  }

  @Post()
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  async create(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.create(orgId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update product' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async update(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(orgId, id, dto);
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Toggle product active status' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async toggleActive(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productService.toggleActive(orgId, id);
  }

  @Delete(':id')
  @Roles(UserRole.OPERATOR)
  @ApiOperation({ summary: 'Delete product' })
  @ApiParam({ name: 'orgId', description: 'Organization ID' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async delete(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.productService.delete(orgId, id);
    return { success: true };
  }
}
