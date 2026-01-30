import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicDeviceInfo, validatePassportCode } from '@device-passport/shared';
import { DevicePassport } from '../../database/entities';

@Injectable()
export class ScanService {
  constructor(
    @InjectRepository(DevicePassport)
    private passportRepository: Repository<DevicePassport>,
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
}
