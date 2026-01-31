import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, MoreThan, LessThanOrEqual, Between } from 'typeorm';
import {
  MarketplaceProduct,
  BuyerRequirement,
  Organization,
  SupplierProduct,
} from '../../database/entities';
import {
  CreateMarketplaceProductDto,
  UpdateMarketplaceProductDto,
  CreateBuyerRequirementDto,
  UpdateBuyerRequirementDto,
  MarketplaceSearchDto,
} from './dto';
import { MarketplaceListingStatus, RFQStatus } from '@device-passport/shared';

@Injectable()
export class MarketplaceService {
  constructor(
    @InjectRepository(MarketplaceProduct)
    private readonly productRepository: Repository<MarketplaceProduct>,
    @InjectRepository(BuyerRequirement)
    private readonly requirementRepository: Repository<BuyerRequirement>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(SupplierProduct)
    private readonly supplierProductRepository: Repository<SupplierProduct>,
  ) {}

  // ==========================================
  // Marketplace Products
  // ==========================================

  async createProduct(
    organizationId: string,
    dto: CreateMarketplaceProductDto,
  ): Promise<MarketplaceProduct> {
    await this.validateOrganization(organizationId);

    // If linking to supplier product, validate it
    if (dto.supplierProductId) {
      const supplierProduct = await this.supplierProductRepository.findOne({
        where: { id: dto.supplierProductId, organizationId },
      });
      if (!supplierProduct) {
        throw new NotFoundException('Supplier product not found or not owned by organization');
      }
    }

    const product = this.productRepository.create({
      ...dto,
      organizationId,
      status: dto.status || MarketplaceListingStatus.DRAFT,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
    });

    return this.productRepository.save(product);
  }

  async updateProduct(
    organizationId: string,
    id: string,
    dto: UpdateMarketplaceProductDto,
  ): Promise<MarketplaceProduct> {
    const product = await this.getProductByIdAndOrg(id, organizationId);

    Object.assign(product, {
      ...dto,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : product.expiresAt,
    });

    return this.productRepository.save(product);
  }

  async deleteProduct(organizationId: string, id: string): Promise<void> {
    const product = await this.getProductByIdAndOrg(id, organizationId);
    product.status = MarketplaceListingStatus.REMOVED;
    await this.productRepository.save(product);
  }

  async pauseProduct(organizationId: string, id: string): Promise<MarketplaceProduct> {
    const product = await this.getProductByIdAndOrg(id, organizationId);
    if (product.status !== MarketplaceListingStatus.ACTIVE) {
      throw new BadRequestException('Only active products can be paused');
    }
    product.status = MarketplaceListingStatus.PAUSED;
    return this.productRepository.save(product);
  }

  async activateProduct(organizationId: string, id: string): Promise<MarketplaceProduct> {
    const product = await this.getProductByIdAndOrg(id, organizationId);
    if (![MarketplaceListingStatus.DRAFT, MarketplaceListingStatus.PAUSED].includes(product.status)) {
      throw new BadRequestException('Only draft or paused products can be activated');
    }
    product.status = MarketplaceListingStatus.ACTIVE;
    return this.productRepository.save(product);
  }

  async getProductById(id: string): Promise<MarketplaceProduct> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['organization', 'supplierProduct'],
    });
    if (!product) {
      throw new NotFoundException('Marketplace product not found');
    }
    // Increment view count
    product.viewCount += 1;
    await this.productRepository.save(product);
    return product;
  }

  async getMyProducts(organizationId: string): Promise<MarketplaceProduct[]> {
    return this.productRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async searchProducts(query: MarketplaceSearchDto) {
    const {
      keyword,
      category,
      hsCode,
      priceMin,
      priceMax,
      region,
      userLat,
      userLng,
      maxDistanceKm,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
      featuredFirst = true,
    } = query;

    const qb = this.productRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.organization', 'org')
      .where('p.status = :status', { status: MarketplaceListingStatus.ACTIVE });

    // Keyword search (title and description)
    if (keyword) {
      qb.andWhere('(LOWER(p.listingTitle) LIKE LOWER(:keyword) OR LOWER(p.description) LIKE LOWER(:keyword))', {
        keyword: `%${keyword}%`,
      });
    }

    // Category filter
    if (category) {
      qb.andWhere('p.productCategory = :category', { category });
    }

    // HS Code prefix filter
    if (hsCode) {
      qb.andWhere('p.hsCode LIKE :hsCode', { hsCode: `${hsCode}%` });
    }

    // Price range filter (using minPrice)
    if (priceMin !== undefined) {
      qb.andWhere('p.minPrice >= :priceMin', { priceMin });
    }
    if (priceMax !== undefined) {
      qb.andWhere('(p.minPrice <= :priceMax OR p.maxPrice <= :priceMax)', { priceMax });
    }

    // Region filter
    if (region) {
      qb.andWhere('LOWER(p.supplyRegion) LIKE LOWER(:region)', { region: `%${region}%` });
    }

    // Distance filter using Haversine formula (PostgreSQL)
    if (userLat !== undefined && userLng !== undefined && maxDistanceKm !== undefined) {
      qb.andWhere(`
        (6371 * acos(
          cos(radians(:userLat)) * cos(radians(p.locationLat)) *
          cos(radians(p.locationLng) - radians(:userLng)) +
          sin(radians(:userLat)) * sin(radians(p.locationLat))
        )) <= :maxDistanceKm
      `, { userLat, userLng, maxDistanceKm });
    }

    // Ordering
    if (featuredFirst) {
      qb.addOrderBy('p.isFeatured', 'DESC');
    }

    // Sort by distance if coordinates provided
    if (sortBy === 'distance' && userLat !== undefined && userLng !== undefined) {
      qb.addSelect(`
        (6371 * acos(
          cos(radians(:userLat)) * cos(radians(p.locationLat)) *
          cos(radians(p.locationLng) - radians(:userLng)) +
          sin(radians(:userLat)) * sin(radians(p.locationLat))
        ))
      `, 'distance');
      qb.addOrderBy('distance', sortOrder as 'ASC' | 'DESC');
    } else if (sortBy === 'price') {
      qb.addOrderBy('p.minPrice', sortOrder as 'ASC' | 'DESC');
    } else if (sortBy === 'viewCount') {
      qb.addOrderBy('p.viewCount', sortOrder as 'ASC' | 'DESC');
    } else {
      qb.addOrderBy('p.createdAt', sortOrder as 'ASC' | 'DESC');
    }

    // Pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==========================================
  // Buyer Requirements (RFQ)
  // ==========================================

  async createRequirement(
    organizationId: string,
    userId: string,
    dto: CreateBuyerRequirementDto,
  ): Promise<BuyerRequirement> {
    await this.validateOrganization(organizationId);

    const requirement = this.requirementRepository.create({
      ...dto,
      organizationId,
      createdByUserId: userId,
      status: dto.status || RFQStatus.DRAFT,
      deliveryDeadline: dto.deliveryDeadline ? new Date(dto.deliveryDeadline) : null,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
    });

    return this.requirementRepository.save(requirement);
  }

  async updateRequirement(
    organizationId: string,
    id: string,
    dto: UpdateBuyerRequirementDto,
  ): Promise<BuyerRequirement> {
    const requirement = await this.getRequirementByIdAndOrg(id, organizationId);

    Object.assign(requirement, {
      ...dto,
      deliveryDeadline: dto.deliveryDeadline ? new Date(dto.deliveryDeadline) : requirement.deliveryDeadline,
      validUntil: dto.validUntil ? new Date(dto.validUntil) : requirement.validUntil,
    });

    return this.requirementRepository.save(requirement);
  }

  async deleteRequirement(organizationId: string, id: string): Promise<void> {
    const requirement = await this.getRequirementByIdAndOrg(id, organizationId);
    requirement.status = RFQStatus.CANCELLED;
    await this.requirementRepository.save(requirement);
  }

  async getRequirementById(id: string): Promise<BuyerRequirement> {
    const requirement = await this.requirementRepository.findOne({
      where: { id },
      relations: ['organization', 'createdByUser'],
    });
    if (!requirement) {
      throw new NotFoundException('Buyer requirement not found');
    }
    // Increment view count
    requirement.viewCount += 1;
    await this.requirementRepository.save(requirement);
    return requirement;
  }

  async getMyRequirements(organizationId: string): Promise<BuyerRequirement[]> {
    return this.requirementRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async searchRequirements(query: MarketplaceSearchDto) {
    const {
      keyword,
      category,
      hsCode,
      priceMin,
      priceMax,
      region,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = query;

    const qb = this.requirementRepository.createQueryBuilder('r')
      .leftJoinAndSelect('r.organization', 'org')
      .where('r.status = :status', { status: RFQStatus.OPEN })
      .andWhere('r.isPublic = :isPublic', { isPublic: true });

    // Keyword search
    if (keyword) {
      qb.andWhere('(LOWER(r.title) LIKE LOWER(:keyword) OR LOWER(r.description) LIKE LOWER(:keyword))', {
        keyword: `%${keyword}%`,
      });
    }

    // Category filter
    if (category) {
      qb.andWhere('r.productCategory = :category', { category });
    }

    // HS Code prefix filter
    if (hsCode) {
      qb.andWhere('r.hsCode LIKE :hsCode', { hsCode: `${hsCode}%` });
    }

    // Budget range filter
    if (priceMin !== undefined) {
      qb.andWhere('r.budgetMax >= :priceMin', { priceMin });
    }
    if (priceMax !== undefined) {
      qb.andWhere('r.budgetMin <= :priceMax', { priceMax });
    }

    // Region filter (check if region is in preferredRegions JSONB array)
    if (region) {
      qb.andWhere('r.preferredRegions @> :region', { region: JSON.stringify([region]) });
    }

    // Ordering
    if (sortBy === 'price') {
      qb.addOrderBy('r.budgetMax', sortOrder as 'ASC' | 'DESC');
    } else if (sortBy === 'viewCount') {
      qb.addOrderBy('r.viewCount', sortOrder as 'ASC' | 'DESC');
    } else {
      qb.addOrderBy('r.createdAt', sortOrder as 'ASC' | 'DESC');
    }

    // Pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  private async validateOrganization(organizationId: string): Promise<void> {
    const org = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
  }

  private async getProductByIdAndOrg(id: string, organizationId: string): Promise<MarketplaceProduct> {
    const product = await this.productRepository.findOne({
      where: { id, organizationId },
    });
    if (!product) {
      throw new NotFoundException('Marketplace product not found');
    }
    return product;
  }

  private async getRequirementByIdAndOrg(id: string, organizationId: string): Promise<BuyerRequirement> {
    const requirement = await this.requirementRepository.findOne({
      where: { id, organizationId },
    });
    if (!requirement) {
      throw new NotFoundException('Buyer requirement not found');
    }
    return requirement;
  }

  // Public listings for homepage
  async getPublicProducts(limit = 12): Promise<MarketplaceProduct[]> {
    return this.productRepository.find({
      where: { status: MarketplaceListingStatus.ACTIVE },
      relations: ['organization'],
      order: { isFeatured: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  async getPublicRequirements(limit = 12): Promise<BuyerRequirement[]> {
    return this.requirementRepository.find({
      where: { status: RFQStatus.OPEN, isPublic: true },
      relations: ['organization'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
