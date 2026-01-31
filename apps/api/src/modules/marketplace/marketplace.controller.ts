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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';
import {
  CreateMarketplaceProductDto,
  UpdateMarketplaceProductDto,
  CreateBuyerRequirementDto,
  UpdateBuyerRequirementDto,
  MarketplaceSearchDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Public, CurrentUser, Roles } from '../../common/decorators';
import { TokenPayload, UserRole } from '@device-passport/shared';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // ==========================================
  // Public Endpoints
  // ==========================================

  @Get('products')
  @Public()
  @ApiOperation({ summary: 'Search public products' })
  async searchProducts(@Query() query: MarketplaceSearchDto) {
    return this.marketplaceService.searchProducts(query);
  }

  @Get('products/featured')
  @Public()
  @ApiOperation({ summary: 'Get featured products for homepage' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeaturedProducts(@Query('limit') limit?: number) {
    return this.marketplaceService.getPublicProducts(limit || 12);
  }

  @Get('products/:id')
  @Public()
  @ApiOperation({ summary: 'Get product details' })
  @ApiParam({ name: 'id', description: 'Marketplace product ID' })
  async getProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketplaceService.getProductById(id);
  }

  @Get('requirements')
  @Public()
  @ApiOperation({ summary: 'Search public RFQs' })
  async searchRequirements(@Query() query: MarketplaceSearchDto) {
    return this.marketplaceService.searchRequirements(query);
  }

  @Get('requirements/recent')
  @Public()
  @ApiOperation({ summary: 'Get recent RFQs for homepage' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentRequirements(@Query('limit') limit?: number) {
    return this.marketplaceService.getPublicRequirements(limit || 12);
  }

  @Get('requirements/:id')
  @Public()
  @ApiOperation({ summary: 'Get RFQ details' })
  @ApiParam({ name: 'id', description: 'Buyer requirement ID' })
  async getRequirement(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketplaceService.getRequirementById(id);
  }

  // ==========================================
  // Supplier Endpoints (Manage Products)
  // ==========================================

  @Get('products/my/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my published products' })
  async getMyProducts(@CurrentUser() user: TokenPayload) {
    return this.marketplaceService.getMyProducts(user.organizationId!);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a product to marketplace' })
  async createProduct(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateMarketplaceProductDto,
  ) {
    return this.marketplaceService.createProduct(user.organizationId!, dto);
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a marketplace product' })
  @ApiParam({ name: 'id', description: 'Marketplace product ID' })
  async updateProduct(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMarketplaceProductDto,
  ) {
    return this.marketplaceService.updateProduct(user.organizationId!, id, dto);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a product from marketplace' })
  @ApiParam({ name: 'id', description: 'Marketplace product ID' })
  async deleteProduct(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.marketplaceService.deleteProduct(user.organizationId!, id);
    return { success: true };
  }

  @Post('products/:id/pause')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pause a product listing' })
  @ApiParam({ name: 'id', description: 'Marketplace product ID' })
  async pauseProduct(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.marketplaceService.pauseProduct(user.organizationId!, id);
  }

  @Post('products/:id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activate a product listing' })
  @ApiParam({ name: 'id', description: 'Marketplace product ID' })
  async activateProduct(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.marketplaceService.activateProduct(user.organizationId!, id);
  }

  // ==========================================
  // Buyer Endpoints (Manage RFQs)
  // ==========================================

  @Get('requirements/my/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my RFQs' })
  async getMyRequirements(@CurrentUser() user: TokenPayload) {
    return this.marketplaceService.getMyRequirements(user.organizationId!);
  }

  @Post('requirements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new RFQ' })
  async createRequirement(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateBuyerRequirementDto,
  ) {
    return this.marketplaceService.createRequirement(
      user.organizationId!,
      user.sub,
      dto,
    );
  }

  @Patch('requirements/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an RFQ' })
  @ApiParam({ name: 'id', description: 'Buyer requirement ID' })
  async updateRequirement(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBuyerRequirementDto,
  ) {
    return this.marketplaceService.updateRequirement(
      user.organizationId!,
      id,
      dto,
    );
  }

  @Delete('requirements/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel an RFQ' })
  @ApiParam({ name: 'id', description: 'Buyer requirement ID' })
  async deleteRequirement(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.marketplaceService.deleteRequirement(user.organizationId!, id);
    return { success: true };
  }
}
