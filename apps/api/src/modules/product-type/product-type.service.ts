import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductTypeConfig } from '../../database/entities';
import { CreateProductTypeDto, UpdateProductTypeDto } from './dto';
import { PRODUCT_TYPE_NAMES, PRODUCT_TYPE_DESCRIPTIONS, ProductLine } from '@device-passport/shared';

@Injectable()
export class ProductTypeService {
  constructor(
    @InjectRepository(ProductTypeConfig)
    private readonly productTypeRepository: Repository<ProductTypeConfig>,
  ) {}

  async seedDefaultTypes(): Promise<void> {
    const existingCount = await this.productTypeRepository.count();
    if (existingCount > 0) return;

    const defaultTypes = Object.values(ProductLine).map((code, index) => ({
      code,
      name: PRODUCT_TYPE_NAMES[code],
      description: PRODUCT_TYPE_DESCRIPTIONS[code],
      isActive: true,
      isSystem: true,
      sortOrder: index,
    }));

    await this.productTypeRepository.save(defaultTypes);
  }

  async findAll(includeInactive = false): Promise<ProductTypeConfig[]> {
    const where = includeInactive ? {} : { isActive: true };
    return this.productTypeRepository.find({
      where,
      order: { sortOrder: 'ASC', code: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ProductTypeConfig> {
    const productType = await this.productTypeRepository.findOne({ where: { id } });
    if (!productType) {
      throw new NotFoundException(`Product type with ID ${id} not found`);
    }
    return productType;
  }

  async findByCode(code: string): Promise<ProductTypeConfig | null> {
    return this.productTypeRepository.findOne({ where: { code: code.toUpperCase() } });
  }

  async create(dto: CreateProductTypeDto): Promise<ProductTypeConfig> {
    const existing = await this.findByCode(dto.code);
    if (existing) {
      throw new ConflictException(`Product type with code ${dto.code} already exists`);
    }

    const productType = this.productTypeRepository.create({
      ...dto,
      code: dto.code.toUpperCase(),
    });
    return this.productTypeRepository.save(productType);
  }

  async update(id: string, dto: UpdateProductTypeDto): Promise<ProductTypeConfig> {
    const productType = await this.findOne(id);

    if (dto.code && dto.code !== productType.code) {
      const existing = await this.findByCode(dto.code);
      if (existing) {
        throw new ConflictException(`Product type with code ${dto.code} already exists`);
      }
      dto.code = dto.code.toUpperCase();
    }

    Object.assign(productType, dto);
    return this.productTypeRepository.save(productType);
  }

  async remove(id: string): Promise<void> {
    const productType = await this.findOne(id);
    if (productType.isSystem) {
      throw new ConflictException('Cannot delete system product types');
    }
    await this.productTypeRepository.remove(productType);
  }

  async toggleActive(id: string): Promise<ProductTypeConfig> {
    const productType = await this.findOne(id);
    productType.isActive = !productType.isActive;
    return this.productTypeRepository.save(productType);
  }
}
