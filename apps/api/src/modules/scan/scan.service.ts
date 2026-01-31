import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicDeviceInfo, validatePassportCode } from '@device-passport/shared';
import { DevicePassport } from '../../database/entities';
import { ExpertService } from '../expert/expert.service';
import { ExpertCodeService } from '../expert/expert-code.service';

@Injectable()
export class ScanService {
  constructor(
    @InjectRepository(DevicePassport)
    private passportRepository: Repository<DevicePassport>,
    private readonly expertService: ExpertService,
    private readonly expertCodeService: ExpertCodeService,
  ) {}

  async getPublicInfo(code: string): Promise<PublicDeviceInfo> {
    // Validate code format
    const validation = validatePassportCode(code);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    // Find passport
    const passport = await this.passportRepository.findOne({
      where: { passportCode: code.toUpperCase() },
    });

    if (!passport) {
      throw new NotFoundException('Device passport not found');
    }

    // Check warranty status
    const now = new Date();
    const isUnderWarranty = passport.warrantyExpiryDate
      ? new Date(passport.warrantyExpiryDate) > now
      : false;

    // Return public information only
    return {
      passportCode: passport.passportCode,
      deviceName: passport.deviceName,
      deviceModel: passport.deviceModel,
      manufacturer: passport.manufacturer,
      productLine: passport.productLine,
      originCode: passport.originCode,
      status: passport.status,
      manufactureDate: passport.manufactureDate,
      warrantyExpiryDate: passport.warrantyExpiryDate,
      isUnderWarranty,
    };
  }

  async validateCode(code: string): Promise<{ valid: boolean; error?: string }> {
    return validatePassportCode(code);
  }

  /**
   * Get public expert info by scanning expert passport code
   */
  async getExpertPublicInfo(code: string): Promise<{
    expertCode: string;
    personalName: string;
    expertTypes: string[];
    professionalField?: string;
    yearsOfExperience?: number;
    skillTags: string[];
    avgRating?: number;
    totalReviews: number;
    completedServices: number;
    isAvailable: boolean;
    currentLocation?: string;
    registrationStatus: string;
    typeName: string;
    parsed: {
      prefix: string;
      type: string;
      yearMonth: string;
      sequence: string;
      checksum: string;
    } | null;
  }> {
    // Validate expert code format
    if (!this.expertCodeService.validateCode(code)) {
      throw new BadRequestException('Invalid expert passport code format');
    }

    // Get public profile
    const profile = await this.expertService.getPublicProfile(code);

    if (!profile) {
      throw new NotFoundException('Expert passport not found');
    }

    // Parse code components
    const parsed = this.expertCodeService.parseCode(code);
    const typeName = parsed
      ? this.expertCodeService.getTypeDisplayName(parsed.type)
      : 'Expert';

    return {
      expertCode: profile.expertCode!,
      personalName: profile.personalName!,
      expertTypes: profile.expertTypes || [],
      professionalField: profile.professionalField,
      yearsOfExperience: profile.yearsOfExperience,
      skillTags: profile.skillTags || [],
      avgRating: profile.avgRating ? Number(profile.avgRating) : undefined,
      totalReviews: profile.totalReviews || 0,
      completedServices: profile.completedServices || 0,
      isAvailable: profile.isAvailable || false,
      currentLocation: profile.currentLocation,
      registrationStatus: profile.registrationStatus!,
      typeName,
      parsed,
    };
  }

  /**
   * Validate expert passport code format
   */
  validateExpertCode(code: string): { valid: boolean; error?: string } {
    const isValid = this.expertCodeService.validateCode(code);
    return {
      valid: isValid,
      error: isValid ? undefined : 'Invalid expert passport code format',
    };
  }
}
