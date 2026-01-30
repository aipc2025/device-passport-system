import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../database/entities';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async findAll(): Promise<Organization[]> {
    return this.organizationRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findByCode(code: string): Promise<Organization | null> {
    return this.organizationRepository.findOne({
      where: { code: code.toUpperCase() },
    });
  }

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {
    const existingOrg = await this.findByCode(createOrganizationDto.code);
    if (existingOrg) {
      throw new ConflictException('Organization with this code already exists');
    }

    const organization = this.organizationRepository.create({
      ...createOrganizationDto,
      code: createOrganizationDto.code.toUpperCase(),
    });

    return this.organizationRepository.save(organization);
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.findById(id);

    Object.assign(organization, updateOrganizationDto);

    return this.organizationRepository.save(organization);
  }

  async delete(id: string): Promise<void> {
    const organization = await this.findById(id);
    await this.organizationRepository.remove(organization);
  }
}
