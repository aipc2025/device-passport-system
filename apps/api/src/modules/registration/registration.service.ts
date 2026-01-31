import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  User,
  Organization,
  CompanyProfile,
  OrganizationContact,
  SupplierProduct,
  IndividualExpert,
  UploadedFile,
} from '../../database/entities';
import {
  CompanyRegistrationDto,
  ExpertRegistrationDto,
  UpdateRegistrationStatusDto,
} from './dto';
import { UploadService } from '../upload/upload.service';
import { ExpertCodeService } from '../expert/expert-code.service';
import {
  RegistrationStatus,
  RegistrationType,
  UserRole,
} from '@device-passport/shared';

// Types for registration (exported for controller use)
export interface PendingRegistration {
  id: string;
  registrationType: RegistrationType;
  name: string;
  email: string;
  status: RegistrationStatus;
  submittedAt: Date;
  companyCode?: string;
  isSupplier?: boolean;
  isBuyer?: boolean;
  expertTypes?: string[];
}

export interface RegistrationStatusResponse {
  registrationType: RegistrationType;
  status: RegistrationStatus;
  adminNotes?: string;
  reviewedAt?: Date;
  submittedAt: Date;
}
import { OrganizationType } from '@device-passport/shared';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(CompanyProfile)
    private readonly companyProfileRepository: Repository<CompanyProfile>,
    @InjectRepository(OrganizationContact)
    private readonly contactRepository: Repository<OrganizationContact>,
    @InjectRepository(SupplierProduct)
    private readonly productRepository: Repository<SupplierProduct>,
    @InjectRepository(IndividualExpert)
    private readonly expertRepository: Repository<IndividualExpert>,
    @InjectRepository(UploadedFile)
    private readonly uploadedFileRepository: Repository<UploadedFile>,
    private readonly uploadService: UploadService,
    private readonly expertCodeService: ExpertCodeService,
    private readonly dataSource: DataSource,
  ) {}

  async checkCodeAvailability(code: string): Promise<{ available: boolean }> {
    const normalizedCode = code.toUpperCase();
    const existing = await this.organizationRepository.findOne({
      where: { code: normalizedCode },
    });
    return { available: !existing };
  }

  async registerCompany(dto: CompanyRegistrationDto): Promise<{ message: string; userId: string }> {
    // Validate at least one role is selected
    if (!dto.isSupplier && !dto.isBuyer) {
      throw new BadRequestException('At least one role (Supplier or Buyer) must be selected');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if organization code is available
    const normalizedCode = dto.organizationCode.toUpperCase();
    const existingOrg = await this.organizationRepository.findOne({
      where: { code: normalizedCode },
    });
    if (existingOrg) {
      throw new ConflictException('Organization code is already taken');
    }

    // Use transaction for all inserts
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Organization
      const organizationType = dto.isSupplier
        ? OrganizationType.SUPPLIER
        : OrganizationType.CUSTOMER;

      const organization = queryRunner.manager.create(Organization, {
        name: dto.organizationName,
        code: normalizedCode,
        type: organizationType,
        isActive: true,
      });
      const savedOrg = await queryRunner.manager.save(organization);

      // 2. Create User
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = queryRunner.manager.create(User, {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.userName,
        role: UserRole.CUSTOMER, // Will be upgraded after approval
        organizationId: savedOrg.id,
        isActive: true, // Can log in but with limited access
      });
      const savedUser = await queryRunner.manager.save(user);

      // 3. Create Company Profile
      const companyProfile = queryRunner.manager.create(CompanyProfile, {
        organizationId: savedOrg.id,
        isSupplier: dto.isSupplier,
        isBuyer: dto.isBuyer,
        registeredCapital: dto.registeredCapital,
        capitalCurrency: dto.capitalCurrency,
        companyType: dto.companyType,
        establishmentDate: dto.establishmentDate ? new Date(dto.establishmentDate) : undefined,
        legalRepresentative: dto.legalRepresentative,
        businessScope: dto.businessScope,
        registeredAddress: dto.registeredAddress,
        businessAddress: dto.businessAddress,
        taxNumber: dto.taxNumber,
        bankName: dto.bankName,
        bankAccountNumber: dto.bankAccountNumber,
        invoicePhone: dto.invoicePhone,
        invoiceAddress: dto.invoiceAddress,
        buyerProductDescription: dto.buyerProductDescription,
        purchaseFrequency: dto.purchaseFrequency,
        purchaseVolume: dto.purchaseVolume,
        preferredPaymentTerms: dto.preferredPaymentTerms,
        registrationStatus: RegistrationStatus.PENDING,
      });
      await queryRunner.manager.save(companyProfile);

      // 4. Create Contacts
      if (dto.contacts && dto.contacts.length > 0) {
        const contacts = dto.contacts.map((contactDto) =>
          queryRunner.manager.create(OrganizationContact, {
            organizationId: savedOrg.id,
            ...contactDto,
          }),
        );
        await queryRunner.manager.save(contacts);
      }

      // 5. Create Products (if supplier)
      if (dto.isSupplier && dto.products && dto.products.length > 0) {
        const products = dto.products.map((productDto) =>
          queryRunner.manager.create(SupplierProduct, {
            organizationId: savedOrg.id,
            ...productDto,
            isActive: true,
          }),
        );
        await queryRunner.manager.save(products);
      }

      // 6. Link uploaded files
      if (dto.businessLicenseFileId) {
        await queryRunner.manager.update(UploadedFile, dto.businessLicenseFileId, {
          relatedEntityType: 'CompanyProfile',
          relatedEntityId: savedOrg.id,
        });
      }

      if (dto.productImageFileIds && dto.productImageFileIds.length > 0) {
        for (const fileId of dto.productImageFileIds) {
          await queryRunner.manager.update(UploadedFile, fileId, {
            relatedEntityType: 'SupplierProduct',
            relatedEntityId: savedOrg.id,
          });
        }
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Registration submitted successfully. Please wait for admin approval.',
        userId: savedUser.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async registerExpert(dto: ExpertRegistrationDto): Promise<{ message: string; userId: string }> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create User
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = queryRunner.manager.create(User, {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.personalName,
        role: UserRole.CUSTOMER, // Will be upgraded to ENGINEER after approval
        isActive: true,
      });
      const savedUser = await queryRunner.manager.save(user);

      // 2. Create Expert Profile
      const expert = queryRunner.manager.create(IndividualExpert, {
        userId: savedUser.id,
        expertTypes: dto.expertTypes,
        personalName: dto.personalName,
        idNumber: dto.idNumber,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        emergencyContactRelationship: dto.emergencyContactRelationship,
        professionalField: dto.professionalField,
        servicesOffered: dto.servicesOffered,
        yearsOfExperience: dto.yearsOfExperience,
        certifications: dto.certifications,
        currentLocation: dto.currentLocation,
        locationLat: dto.locationLat,
        locationLng: dto.locationLng,
        registrationStatus: RegistrationStatus.PENDING,
      });
      const savedExpert = await queryRunner.manager.save(expert);

      // 3. Link uploaded files
      if (dto.resumeFileId) {
        await queryRunner.manager.update(UploadedFile, dto.resumeFileId, {
          relatedEntityType: 'IndividualExpert',
          relatedEntityId: savedExpert.id,
        });
      }

      if (dto.certificateFileIds && dto.certificateFileIds.length > 0) {
        for (const fileId of dto.certificateFileIds) {
          await queryRunner.manager.update(UploadedFile, fileId, {
            relatedEntityType: 'IndividualExpert',
            relatedEntityId: savedExpert.id,
          });
        }
      }

      if (dto.idDocumentFileId) {
        await queryRunner.manager.update(UploadedFile, dto.idDocumentFileId, {
          relatedEntityType: 'IndividualExpert',
          relatedEntityId: savedExpert.id,
        });
      }

      if (dto.photoFileId) {
        await queryRunner.manager.update(UploadedFile, dto.photoFileId, {
          relatedEntityType: 'IndividualExpert',
          relatedEntityId: savedExpert.id,
        });
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Registration submitted successfully. Please wait for admin approval.',
        userId: savedUser.id,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getRegistrationStatus(userId: string): Promise<RegistrationStatusResponse> {
    // Check for company registration
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if company registration
    if (user.organizationId) {
      const profile = await this.companyProfileRepository.findOne({
        where: { organizationId: user.organizationId },
      });

      if (profile) {
        return {
          registrationType: RegistrationType.COMPANY,
          status: profile.registrationStatus,
          adminNotes: profile.registrationStatus === RegistrationStatus.REJECTED
            ? profile.adminNotes
            : undefined,
          reviewedAt: profile.reviewedAt,
          submittedAt: profile.createdAt,
        };
      }
    }

    // Check if expert registration
    const expert = await this.expertRepository.findOne({
      where: { userId },
    });

    if (expert) {
      return {
        registrationType: RegistrationType.INDIVIDUAL_EXPERT,
        status: expert.registrationStatus,
        adminNotes: expert.registrationStatus === RegistrationStatus.REJECTED
          ? expert.adminNotes
          : undefined,
        reviewedAt: expert.reviewedAt,
        submittedAt: expert.createdAt,
      };
    }

    throw new NotFoundException('No registration found for this user');
  }

  async getPendingRegistrations(): Promise<PendingRegistration[]> {
    const results: PendingRegistration[] = [];

    // Get pending company registrations
    const companyProfiles = await this.companyProfileRepository.find({
      where: [
        { registrationStatus: RegistrationStatus.PENDING },
        { registrationStatus: RegistrationStatus.UNDER_REVIEW },
      ],
      relations: ['organization'],
    });

    for (const profile of companyProfiles) {
      const user = await this.userRepository.findOne({
        where: { organizationId: profile.organizationId },
      });

      results.push({
        id: profile.id,
        registrationType: RegistrationType.COMPANY,
        name: profile.organization?.name || 'Unknown',
        email: user?.email || 'Unknown',
        status: profile.registrationStatus,
        submittedAt: profile.createdAt,
        companyCode: profile.organization?.code,
        isSupplier: profile.isSupplier,
        isBuyer: profile.isBuyer,
      });
    }

    // Get pending expert registrations
    const experts = await this.expertRepository.find({
      where: [
        { registrationStatus: RegistrationStatus.PENDING },
        { registrationStatus: RegistrationStatus.UNDER_REVIEW },
      ],
      relations: ['user'],
    });

    for (const expert of experts) {
      results.push({
        id: expert.id,
        registrationType: RegistrationType.INDIVIDUAL_EXPERT,
        name: expert.personalName,
        email: expert.user?.email || 'Unknown',
        status: expert.registrationStatus,
        submittedAt: expert.createdAt,
        expertTypes: expert.expertTypes,
      });
    }

    // Sort by submission date (oldest first)
    return results.sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime());
  }

  async updateCompanyStatus(
    profileId: string,
    dto: UpdateRegistrationStatusDto,
    adminUserId: string,
  ): Promise<void> {
    const profile = await this.companyProfileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException('Company registration not found');
    }

    profile.registrationStatus = dto.status;
    if (dto.adminNotes !== undefined) {
      profile.adminNotes = dto.adminNotes;
    }
    profile.reviewedBy = adminUserId;
    profile.reviewedAt = new Date();

    await this.companyProfileRepository.save(profile);

    // If approved, upgrade user role
    if (dto.status === RegistrationStatus.APPROVED) {
      const user = await this.userRepository.findOne({
        where: { organizationId: profile.organizationId },
      });

      if (user) {
        // Upgrade to OPERATOR role for company users
        user.role = UserRole.OPERATOR;
        await this.userRepository.save(user);
      }
    }
  }

  async updateExpertStatus(
    expertId: string,
    dto: UpdateRegistrationStatusDto,
    adminUserId: string,
  ): Promise<void> {
    const expert = await this.expertRepository.findOne({
      where: { id: expertId },
    });

    if (!expert) {
      throw new NotFoundException('Expert registration not found');
    }

    expert.registrationStatus = dto.status;
    if (dto.adminNotes !== undefined) {
      expert.adminNotes = dto.adminNotes;
    }
    expert.reviewedBy = adminUserId;
    expert.reviewedAt = new Date();

    // If approved, generate expert passport code and upgrade user role
    if (dto.status === RegistrationStatus.APPROVED) {
      // Generate expert passport code (EP-TECH-YYMM-NNNNNN-CC)
      if (!expert.expertCode) {
        const expertCode = await this.expertCodeService.generateCode(expert.expertTypes);
        expert.expertCode = expertCode;
        expert.expertCodeGeneratedAt = new Date();
      }

      await this.expertRepository.save(expert);

      const user = await this.userRepository.findOne({
        where: { id: expert.userId },
      });

      if (user) {
        // Upgrade to ENGINEER role for experts
        user.role = UserRole.ENGINEER;
        await this.userRepository.save(user);
      }
    } else {
      await this.expertRepository.save(expert);
    }
  }

  async getCompanyDetails(profileId: string): Promise<{
    profile: CompanyProfile;
    organization: Organization;
    contacts: OrganizationContact[];
    products: SupplierProduct[];
    files: UploadedFile[];
    user: User | null;
  }> {
    const profile = await this.companyProfileRepository.findOne({
      where: { id: profileId },
      relations: ['organization'],
    });

    if (!profile) {
      throw new NotFoundException('Company profile not found');
    }

    const [contacts, products, files, user] = await Promise.all([
      this.contactRepository.find({ where: { organizationId: profile.organizationId } }),
      this.productRepository.find({ where: { organizationId: profile.organizationId } }),
      this.uploadedFileRepository.find({
        where: { relatedEntityId: profile.organizationId },
      }),
      this.userRepository.findOne({ where: { organizationId: profile.organizationId } }),
    ]);

    return {
      profile,
      organization: profile.organization,
      contacts,
      products,
      files,
      user,
    };
  }

  async getExpertDetails(expertId: string): Promise<{
    expert: IndividualExpert;
    user: User;
    files: UploadedFile[];
  }> {
    const expert = await this.expertRepository.findOne({
      where: { id: expertId },
      relations: ['user'],
    });

    if (!expert) {
      throw new NotFoundException('Expert not found');
    }

    const files = await this.uploadedFileRepository.find({
      where: { relatedEntityId: expert.id },
    });

    return {
      expert,
      user: expert.user,
      files,
    };
  }
}
