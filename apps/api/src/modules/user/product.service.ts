import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierProduct, Organization } from '../../database/entities';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(SupplierProduct)
    private readonly productRepository: Repository<SupplierProduct>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>
  ) {}

  private async validateOrganization(orgId: string): Promise<void> {
    const org = await this.organizationRepository.findOne({
      where: { id: orgId },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
  }

  async findAll(organizationId: string, includeInactive = false): Promise<SupplierProduct[]> {
    await this.validateOrganization(organizationId);

    const where: Record<string, unknown> = { organizationId };
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.productRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findById(organizationId: string, id: string): Promise<SupplierProduct> {
    await this.validateOrganization(organizationId);
    const product = await this.productRepository.findOne({
      where: { id, organizationId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(organizationId: string, dto: CreateProductDto): Promise<SupplierProduct> {
    await this.validateOrganization(organizationId);

    const product = this.productRepository.create({
      organizationId,
      ...dto,
      isActive: true,
    });

    return this.productRepository.save(product);
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateProductDto
  ): Promise<SupplierProduct> {
    const product = await this.findById(organizationId, id);

    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async delete(organizationId: string, id: string): Promise<void> {
    const product = await this.findById(organizationId, id);
    await this.productRepository.remove(product);
  }

  async toggleActive(organizationId: string, id: string): Promise<SupplierProduct> {
    const product = await this.findById(organizationId, id);
    product.isActive = !product.isActive;
    return this.productRepository.save(product);
  }
}
