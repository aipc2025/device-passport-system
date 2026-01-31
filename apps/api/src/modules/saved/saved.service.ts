import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SavedItem,
  Organization,
  MarketplaceProduct,
  BuyerRequirement,
} from '../../database/entities';
import { CreateSavedItemDto } from './dto';
import { SavedItemType, MarketplaceListingStatus, RFQStatus } from '@device-passport/shared';

@Injectable()
export class SavedService {
  constructor(
    @InjectRepository(SavedItem)
    private readonly savedItemRepository: Repository<SavedItem>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(MarketplaceProduct)
    private readonly productRepository: Repository<MarketplaceProduct>,
    @InjectRepository(BuyerRequirement)
    private readonly requirementRepository: Repository<BuyerRequirement>,
  ) {}

  /**
   * Save an item
   */
  async saveItem(
    userId: string,
    organizationId: string,
    dto: CreateSavedItemDto,
  ): Promise<SavedItem> {
    // Check if already saved
    const existing = await this.savedItemRepository.findOne({
      where: {
        userId,
        itemType: dto.itemType,
        itemId: dto.itemId,
      },
    });

    if (existing) {
      throw new ConflictException('Item already saved');
    }

    // Validate item exists
    await this.validateItem(dto.itemType, dto.itemId);

    const savedItem = this.savedItemRepository.create({
      userId,
      organizationId,
      itemType: dto.itemType,
      itemId: dto.itemId,
      notes: dto.notes,
    });

    return this.savedItemRepository.save(savedItem);
  }

  /**
   * Remove a saved item
   */
  async removeSavedItem(userId: string, id: string): Promise<void> {
    const item = await this.savedItemRepository.findOne({
      where: { id, userId },
    });

    if (!item) {
      throw new NotFoundException('Saved item not found');
    }

    await this.savedItemRepository.remove(item);
  }

  /**
   * Get all saved items for a user
   */
  async getAllSavedItems(userId: string): Promise<SavedItem[]> {
    return this.savedItemRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get saved suppliers
   */
  async getSavedSuppliers(userId: string) {
    const savedItems = await this.savedItemRepository.find({
      where: { userId, itemType: SavedItemType.SUPPLIER },
      order: { createdAt: 'DESC' },
    });

    const supplierIds = savedItems.map((s) => s.itemId);
    if (supplierIds.length === 0) return [];

    const suppliers = await this.organizationRepository.findByIds(supplierIds);
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    return savedItems.map((item) => ({
      ...item,
      supplier: supplierMap.get(item.itemId),
    }));
  }

  /**
   * Get saved products
   */
  async getSavedProducts(userId: string) {
    const savedItems = await this.savedItemRepository.find({
      where: { userId, itemType: SavedItemType.PRODUCT },
      order: { createdAt: 'DESC' },
    });

    const productIds = savedItems.map((s) => s.itemId);
    if (productIds.length === 0) return [];

    const products = await this.productRepository.find({
      where: productIds.map((id) => ({ id })),
      relations: ['organization'],
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    return savedItems.map((item) => ({
      ...item,
      product: productMap.get(item.itemId),
    }));
  }

  /**
   * Get saved RFQs
   */
  async getSavedRFQs(userId: string) {
    const savedItems = await this.savedItemRepository.find({
      where: { userId, itemType: SavedItemType.RFQ },
      order: { createdAt: 'DESC' },
    });

    const rfqIds = savedItems.map((s) => s.itemId);
    if (rfqIds.length === 0) return [];

    const rfqs = await this.requirementRepository.find({
      where: rfqIds.map((id) => ({ id })),
      relations: ['organization'],
    });
    const rfqMap = new Map(rfqs.map((r) => [r.id, r]));

    return savedItems.map((item) => ({
      ...item,
      rfq: rfqMap.get(item.itemId),
    }));
  }

  /**
   * Check if an item is saved
   */
  async isSaved(
    userId: string,
    itemType: SavedItemType,
    itemId: string,
  ): Promise<boolean> {
    const count = await this.savedItemRepository.count({
      where: { userId, itemType, itemId },
    });
    return count > 0;
  }

  /**
   * Validate that the item exists
   */
  private async validateItem(itemType: SavedItemType, itemId: string): Promise<void> {
    switch (itemType) {
      case SavedItemType.SUPPLIER:
        const supplier = await this.organizationRepository.findOne({
          where: { id: itemId },
        });
        if (!supplier) {
          throw new NotFoundException('Supplier not found');
        }
        break;

      case SavedItemType.PRODUCT:
        const product = await this.productRepository.findOne({
          where: { id: itemId, status: MarketplaceListingStatus.ACTIVE },
        });
        if (!product) {
          throw new NotFoundException('Product not found');
        }
        break;

      case SavedItemType.RFQ:
        const rfq = await this.requirementRepository.findOne({
          where: { id: itemId, status: RFQStatus.OPEN, isPublic: true },
        });
        if (!rfq) {
          throw new NotFoundException('RFQ not found');
        }
        break;
    }
  }
}
