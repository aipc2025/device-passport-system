import {
  Controller,
  Get,
  Post,
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
import { SavedService } from './saved.service';
import { CreateSavedItemDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { CurrentUser, Roles } from '../../common/decorators';
import { TokenPayload, UserRole, SavedItemType } from '@device-passport/shared';

@ApiTags('Saved Items')
@Controller('saved')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SavedController {
  constructor(private readonly savedService: SavedService) {}

  @Get()
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all saved items' })
  async getAllSavedItems(@CurrentUser() user: TokenPayload) {
    return this.savedService.getAllSavedItems(user.sub);
  }

  @Get('suppliers')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get saved suppliers with details' })
  async getSavedSuppliers(@CurrentUser() user: TokenPayload) {
    return this.savedService.getSavedSuppliers(user.sub);
  }

  @Get('products')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get saved products with details' })
  async getSavedProducts(@CurrentUser() user: TokenPayload) {
    return this.savedService.getSavedProducts(user.sub);
  }

  @Get('rfqs')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get saved RFQs with details' })
  async getSavedRFQs(@CurrentUser() user: TokenPayload) {
    return this.savedService.getSavedRFQs(user.sub);
  }

  @Get('check')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Check if an item is saved' })
  @ApiQuery({ name: 'type', enum: SavedItemType })
  @ApiQuery({ name: 'itemId', type: String })
  async checkSaved(
    @CurrentUser() user: TokenPayload,
    @Query('type') type: SavedItemType,
    @Query('itemId') itemId: string,
  ) {
    const isSaved = await this.savedService.isSaved(user.sub, type, itemId);
    return { isSaved };
  }

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Save an item' })
  async saveItem(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateSavedItemDto,
  ) {
    return this.savedService.saveItem(user.sub, user.organizationId!, dto);
  }

  @Delete(':id')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove a saved item' })
  @ApiParam({ name: 'id', description: 'Saved item ID' })
  async removeSavedItem(
    @CurrentUser() user: TokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.savedService.removeSavedItem(user.sub, id);
    return { success: true };
  }

  @Post('toggle')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle save status of an item' })
  async toggleSave(
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateSavedItemDto,
  ) {
    return this.savedService.toggleSave(
      user.sub,
      user.organizationId || '',
      dto.itemType,
      dto.itemId,
    );
  }

  @Get('ids/:type')
  @Roles(UserRole.CUSTOMER, UserRole.OPERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get saved item IDs for a specific type' })
  @ApiParam({ name: 'type', enum: SavedItemType })
  async getSavedItemIds(
    @CurrentUser() user: TokenPayload,
    @Param('type') type: SavedItemType,
  ) {
    const ids = await this.savedService.getSavedItemIds(user.sub, type);
    return { ids };
  }
}
