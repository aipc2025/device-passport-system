import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationContact, Organization } from '../../database/entities';
import { CreateContactDto, UpdateContactDto } from './dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(OrganizationContact)
    private readonly contactRepository: Repository<OrganizationContact>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  private async validateOrganization(orgId: string): Promise<void> {
    const org = await this.organizationRepository.findOne({
      where: { id: orgId },
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
  }

  async findAll(organizationId: string): Promise<OrganizationContact[]> {
    await this.validateOrganization(organizationId);
    return this.contactRepository.find({
      where: { organizationId },
      order: { isPrimary: 'DESC', name: 'ASC' },
    });
  }

  async findById(organizationId: string, id: string): Promise<OrganizationContact> {
    await this.validateOrganization(organizationId);
    const contact = await this.contactRepository.findOne({
      where: { id, organizationId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async create(
    organizationId: string,
    dto: CreateContactDto,
  ): Promise<OrganizationContact> {
    await this.validateOrganization(organizationId);

    // If setting as primary, unset other primaries of same type
    if (dto.isPrimary) {
      await this.contactRepository.update(
        { organizationId, contactType: dto.contactType },
        { isPrimary: false },
      );
    }

    const contact = this.contactRepository.create({
      organizationId,
      ...dto,
    });

    return this.contactRepository.save(contact);
  }

  async update(
    organizationId: string,
    id: string,
    dto: UpdateContactDto,
  ): Promise<OrganizationContact> {
    const contact = await this.findById(organizationId, id);

    // If setting as primary, unset other primaries of same type
    if (dto.isPrimary && !contact.isPrimary) {
      await this.contactRepository.update(
        { organizationId, contactType: contact.contactType },
        { isPrimary: false },
      );
    }

    Object.assign(contact, dto);
    return this.contactRepository.save(contact);
  }

  async updateNotes(
    organizationId: string,
    id: string,
    personalNotes: string,
  ): Promise<OrganizationContact> {
    const contact = await this.findById(organizationId, id);
    contact.personalNotes = personalNotes;
    return this.contactRepository.save(contact);
  }

  async delete(organizationId: string, id: string): Promise<void> {
    const contact = await this.findById(organizationId, id);
    await this.contactRepository.remove(contact);
  }
}
